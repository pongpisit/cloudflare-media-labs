import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { lstat, mkdir, open, realpath, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROJECT_ROOT = fileURLToPath(new URL('../', import.meta.url));
export const OUTPUT_ROOT = path.join(PROJECT_ROOT, 'lab-output');
export const FIXTURE_BYTES = 12 * 1024 * 1024;
export const FIXTURE_SHA256 = '8b54debaa89f78212f6afb00c7ebb2780f3604c4caa8c97c395576a50d5d6a6a';

export class LabError extends Error {}

export function outputPath(value) {
  if (typeof value !== 'string' || !value.trim() || /[\x00-\x1f\x7f]/u.test(value)) {
    throw new LabError('Provide an explicit local output filename under lab-output/.');
  }
  const resolved = path.resolve(PROJECT_ROOT, value);
  const relative = path.relative(OUTPUT_ROOT, resolved);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new LabError('Output must be a file inside the project lab-output/ directory.');
  }
  return resolved;
}

// Walk each directory rather than following a symlink or creating arbitrary paths.
export async function ensureOutputParent(filename) {
  const safe = outputPath(filename);
  const root = await realpath(PROJECT_ROOT);
  let directory = root;
  const relative = path.relative(PROJECT_ROOT, path.dirname(safe));
  for (const segment of relative.split(path.sep)) {
    directory = path.join(directory, segment);
    try {
      await mkdir(directory, { mode: 0o700 });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
    const info = await lstat(directory);
    if (info.isSymbolicLink() || !info.isDirectory()) {
      throw new LabError('Local output directories must be real directories, not symlinks.');
    }
  }
  return path.join(directory, path.basename(safe));
}

// Delete only the file reserved by this process, never a replacement at its path.
export async function removeOwnedOutput(filename, owned) {
  try {
    const current = await lstat(filename);
    if (current.dev !== owned.dev || current.ino !== owned.ino || !current.isFile()) {
      throw new LabError('Local output changed during cleanup; inspect the requested output.');
    }
    await unlink(filename);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

async function verifyExisting(filename) {
  const handle = await open(filename, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const info = await handle.stat();
    if (!info.isFile() || info.size !== FIXTURE_BYTES) {
      throw new LabError('Existing fixture differs; it was not overwritten. Move it before retrying.');
    }
    const hash = createHash('sha256');
    const buffer = Buffer.alloc(64 * 1024);
    let position = 0;
    while (position < FIXTURE_BYTES) {
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, position);
      if (!bytesRead) throw new LabError('Existing fixture could not be verified.');
      hash.update(buffer.subarray(0, bytesRead));
      position += bytesRead;
    }
    if (hash.digest('hex') !== FIXTURE_SHA256) {
      throw new LabError('Existing fixture differs; it was not overwritten. Move it before retrying.');
    }
  } finally {
    await handle.close();
  }
}

export async function generateFixture() {
  const filename = await ensureOutputParent(path.join(OUTPUT_ROOT, 'multipart-sample.bin'));
  let handle;
  try {
    handle = await open(filename, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    await verifyExisting(filename);
    return { path: filename, bytes: FIXTURE_BYTES, sha256: FIXTURE_SHA256, reused: true };
  }
  const owned = await handle.stat();
  let complete = false;
  try {
    // Byte at offset n is n modulo 256, independent of time, platform or randomness.
    const block = Buffer.alloc(64 * 1024);
    for (let index = 0; index < block.length; index++) block[index] = index % 256;
    const hash = createHash('sha256');
    for (let written = 0; written < FIXTURE_BYTES; written += block.length) {
      await handle.writeFile(block);
      hash.update(block);
    }
    const sha256 = hash.digest('hex');
    if (sha256 !== FIXTURE_SHA256) throw new LabError('Fixture integrity check failed.');
    await handle.close();
    complete = true;
    return { path: filename, bytes: FIXTURE_BYTES, sha256, reused: false };
  } finally {
    if (!complete) {
      await handle.close();
      await removeOwnedOutput(filename, owned);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--help') {
    console.log('npm run fixture\nLocal-only deterministic 12 MiB fixture in lab-output/multipart-sample.bin.\nPrints path, bytes and SHA-256. An identical existing fixture is verified and reused; other files are never overwritten. No credentials or network.');
    return;
  }
  if (args.length) throw new LabError('Usage: npm run fixture (no arguments), or npm run fixture -- --help.');
  const result = await generateFixture();
  console.log(`Path: ${JSON.stringify(result.path)}\nBytes: ${result.bytes}\nSHA-256: ${result.sha256}\n${result.reused ? 'Verified existing deterministic fixture.' : 'Created deterministic local fixture.'}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`Error: ${error instanceof LabError ? error.message : 'Local fixture operation failed; inspect lab-output/ permissions and existing files.'}`);
    process.exitCode = 1;
  });
}
