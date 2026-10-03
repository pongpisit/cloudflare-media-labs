import { createHash } from 'node:crypto';
import { readFile, writeFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { S3Client, ListObjectsV2Command, HeadObjectCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { cli, settings, state, save, ttl, accessCheck, ownedKey, ROOT, LabError } from './core.mjs';
import { outputPath, ensureOutputParent } from './lab-fixture.mjs';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const PART_SIZE = 5 * 1024 * 1024;
export function clientOptions(config) {
  return { region: 'auto', endpoint: config.endpoint, credentials: config.credentials, forcePathStyle: true, maxAttempts: 3, requestChecksumCalculation: 'WHEN_REQUIRED', responseChecksumValidation: 'WHEN_REQUIRED', requestHandler: { connectionTimeout: 10000, requestTimeout: 30000, throwOnRequestTimeout: true } };
}
export async function sendParts(client, bucket, key, bytes, onCreate, onComplete, onAbort = async () => {}) {
  const created = await client.send(new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: 'application/octet-stream' }));
  if (!created.UploadId) throw new LabError('No upload ID returned; inspect incomplete uploads in the dashboard.');
  const uploadId = created.UploadId;
  let completed = false;
  try {
    await onCreate(uploadId);
    const parts = [];
    for (let offset = 0, number = 1; offset < bytes.length; offset += PART_SIZE, number++) {
      const body = bytes.subarray(offset, offset + PART_SIZE);
      const result = await client.send(new UploadPartCommand({ Bucket: bucket, Key: key, UploadId: uploadId, PartNumber: number, Body: body, ContentLength: body.length }));
      if (!result.ETag) throw new LabError(`Part ${number} returned no ETag.`);
      parts.push({ PartNumber: number, ETag: result.ETag });
      console.log(`Part ${number}: ${body.length} bytes accepted. SDK retries individual requests, maxAttempts=3.`);
    }
    await client.send(new CompleteMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId, MultipartUpload: { Parts: parts } }));
    completed = true;
    await onComplete();
  } catch (error) {
    if (completed) throw error;
    try { await client.send(new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId })); await onAbort(); }
    catch { console.error(`Abort not confirmed. Owned upload ID: ${uploadId}; inspect/abort this exact upload in your dashboard.`); }
    throw error;
  }
}
const missing = error => error.$metadata?.httpStatusCode === 404;
export async function main(args) {
  const [command, ...rest] = args;
  if (!command || command === '--help') { console.log('Real R2 lab: preflight | upload | presign [--expires 60] | verify-access [--expires 5] | multipart | verify | cleanup. See docs/03-r2.md.'); return; }
  if (!['preflight', 'upload', 'presign', 'verify-access', 'multipart', 'verify', 'cleanup'].includes(command)) throw new LabError('Unknown R2 command; use --help.');
  const seconds = ttl(rest, 604800);
  const config = settings(process.env, 'r2');
  const record = await state(config, ['preflight', 'upload'].includes(command));
  const client = new S3Client(clientOptions(config));
  const bucket = config.bucket;
  if (record.r2 && (record.r2.bucket !== bucket || record.r2.endpoint !== config.endpoint)) throw new LabError('R2 bucket/jurisdiction differs from this run’s ledger.');
  const documentKey = `${record.run}/sample-document.txt`;
  const multipartKey = `${record.run}/multipart-sample.bin`;
  const reserve = async key => {
    if (record.r2?.keys.includes(key)) throw new LabError('This key is already recorded. Resume verification or clean up before another upload.');
    try { await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key })); throw new LabError('Object already exists. No existing content will be overwritten.'); }
    catch (error) { if (!missing(error)) throw error; }
    record.r2 ||= { bucket, endpoint: config.endpoint, keys: [] };
    record.r2.keys.push(key); await save(record);
  };
  try {
    if (command === 'preflight') {
      await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: `${record.run}/`, MaxKeys: 1 }));
      console.log(`Real S3 list authorized for ${bucket}; endpoint ${config.endpoint}. Separately confirm public r2.dev/custom-domain access is disabled in dashboard.`); return;
    }
    if (command === 'upload') {
      const bytes = await readFile(path.join(ROOT, 'samples/sample-document.txt'));
      await reserve(documentKey);
      record.r2.documentHash = sha256(bytes); await save(record);
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: documentKey, Body: bytes, ContentType: 'text/plain; charset=utf-8' }));
      console.log(`Uploaded ${bytes.length} bytes to owned key ${documentKey}.`); return;
    }
    if (command === 'multipart') {
      const bytes = await readFile(path.join(ROOT, 'lab-output/multipart-sample.bin'));
      if (bytes.length !== 12 * 1024 * 1024) throw new LabError('Run npm run fixture first; this teaching upload must be exactly 12 MiB.');
      await reserve(multipartKey);
      record.r2.multipartHash = sha256(bytes); await save(record);
      await sendParts(client, bucket, multipartKey, bytes,
        async id => { record.r2.uploadId = id; await save(record); },
        async () => { delete record.r2.uploadId; record.r2.completed = true; await save(record); },
        async () => { delete record.r2.uploadId; await save(record); });
      console.log('Completed 5 + 5 + 2 MiB. Run verify to download and compare SHA-256.'); return;
    }
    if (command === 'cleanup') {
      if (!record.r2) { console.log('No R2 resources recorded.'); return; }
      if (record.r2.uploadId) {
        ownedKey(record, multipartKey);
        try { await client.send(new AbortMultipartUploadCommand({ Bucket: bucket, Key: multipartKey, UploadId: record.r2.uploadId })); }
        catch (error) { if (!missing(error)) throw error; }
        delete record.r2.uploadId; await save(record);
      }
      for (const key of [...record.r2.keys]) {
        ownedKey(record, key);
        await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
        record.r2.keys = record.r2.keys.filter(item => item !== key); await save(record); console.log(`Deleted owned object ${key}.`);
      }
      record.r2 = null; await save(record); console.log('Bucket retained. Delete the dedicated empty bucket in dashboard if no longer needed.'); return;
    }
    const key = command === 'verify' ? multipartKey : documentKey;
    ownedKey(record, key);
    if (command === 'presign' || command === 'verify-access') {
      const url = await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: seconds });
      if (command === 'presign') { console.log(url); return; }
      const unsigned = new URL(url); unsigned.search = '';
      record.r2.access = await accessCheck(unsigned.href, url, seconds, 'R2 S3 GET'); await save(record); return;
    }
    if (!record.r2.completed) throw new LabError('Complete multipart upload first.');
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    if (!result.Body || result.ContentLength !== 12 * 1024 * 1024) throw new LabError('Downloaded object metadata does not match the 12 MiB fixture.');
    const bytes = Buffer.from(await result.Body.transformToByteArray());
    const hash = sha256(bytes);
    if (hash !== record.r2.multipartHash || bytes.length !== 12 * 1024 * 1024) throw new LabError('Downloaded SHA-256 or byte count differs from the uploaded source.');
    const output = await ensureOutputParent(outputPath('lab-output/multipart-downloaded.bin'));
    try { await writeFile(output, bytes, { flag: 'wx', mode: 0o600 }); }
    catch (error) {
      if (error.code !== 'EEXIST') throw error;
      if (!(await lstat(output)).isFile() || (await lstat(output)).isSymbolicLink() || sha256(await readFile(output)) !== hash) throw new LabError('Existing download differs or is not a regular file; choose a clean local output before retrying.');
    }
    record.r2.verifiedAt = new Date().toISOString(); await save(record);
    console.log(`Real download verified: ${bytes.length} bytes; SHA-256 ${hash}. Local file: lab-output/multipart-downloaded.bin. ETag is not used as a content hash.`);
  } finally { client.destroy(); }
}
if (path.basename(process.argv[1] || '') === 'r2.mjs') await cli(main);
