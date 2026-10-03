import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { CloudflareAPI, settings, signImage, ttl, until, ownedKey } from '../scripts/core.mjs';
import { deliveryURL } from '../scripts/images.mjs';
import { playbackURL } from '../scripts/stream.mjs';
import { sendParts, PART_SIZE, clientOptions } from '../scripts/r2.mjs';

const env = { CF_ACCOUNT_ID: 'a'.repeat(32), LAB_PREFIX: 'media-test', CF_API_TOKEN: 'test-placeholder', R2_BUCKET: 'test-bucket', R2_ACCESS_KEY_ID: 'placeholder', R2_SECRET_ACCESS_KEY: 'placeholder' };
test('credential domains and jurisdiction endpoint are explicit', () => {
  assert.throws(() => settings({ ...env, LAB_PREFIX: 'media-yourname' }));
  assert.throws(() => settings({ ...env, CF_ACCOUNT_ID: 'not-an-id' }));
  assert.throws(() => settings({ ...env, R2_SECRET_ACCESS_KEY: '' }, 'r2'));
  const config = settings({ ...env, R2_JURISDICTION: 'eu' }, 'r2');
  assert.equal(config.endpoint, `https://${env.CF_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`);
  assert.equal(clientOptions(config).forcePathStyle, true);
  assert.equal(clientOptions(config).maxAttempts, 3);
  assert.throws(() => settings({ ...env, R2_JURISDICTION: 'elsewhere' }, 'r2'));
});
test('Cloudflare request sends bearer authorization and correct JSON/form envelopes', async () => {
  const calls = [];
  const api = new CloudflareAPI(settings(env, 'images'), async (url, options) => { calls.push({ url, options }); return Response.json({ success: true, result: { id: 'owned-image' } }); });
  await api.request('/images/v1/variants', 'POST', { id: 'named', options: { fit: 'cover' }, neverRequireSignedURLs: false });
  const form = new FormData(); form.set('file', new Blob(['test']), 'test.jpg');
  await api.request('/images/v1', 'POST', form);
  assert.match(calls[0].url, /\/accounts\/a{32}\/images\/v1\/variants$/);
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-placeholder');
  assert.equal(JSON.parse(calls[0].options.body).neverRequireSignedURLs, false);
  assert.equal(calls[1].options.headers['Content-Type'], undefined, 'Fetch must generate multipart boundary');
  assert.equal(calls[1].options.body, form);
});
test('failed API response does not reflect tokens, signed links or raw remote messages', async () => {
  const api = new CloudflareAPI(settings(env, 'stream'), async () => Response.json({ success: false, errors: [{ code: 10000, message: 'secret token-value signed-url' }] }, { status: 403 }));
  await assert.rejects(() => api.request('/stream'), error => /403.*10000/.test(error.message) && !/token-value|signed-url/.test(error.message));
});
test('private Images HMAC signs documented path/query and rejects unrelated hosts', () => {
  const url = new URL(signImage('https://imagedelivery.net/delivery-hash/owned-image/detail', 'fixture-key', 60, 100));
  assert.equal(url.searchParams.get('exp'), '160');
  const expected = createHmac('sha256', 'fixture-key').update('/delivery-hash/owned-image/detail?exp=160').digest('hex');
  assert.equal(url.searchParams.get('sig'), expected);
  assert.throws(() => signImage('https://example.com/image', 'fixture-key', 60, 100));
  assert.equal(deliveryURL('https://imagedelivery.net/hash/owned-id/public', 'owned-id', 'my-thumb'), 'https://imagedelivery.net/hash/owned-id/my-thumb');
  assert.throws(() => deliveryURL('https://imagedelivery.net/hash/another-id/public', 'owned-id', 'my-thumb'));
});
test('Stream token replaces UID and retains actual customer hostname', () => {
  const video = { uid: 'owned-video', preview: 'https://customer-demo.cloudflarestream.com/owned-video/watch' };
  assert.equal(playbackURL(video, 'limited-token'), 'https://customer-demo.cloudflarestream.com/limited-token/iframe');
  assert.equal(playbackURL(video, 'limited-token', 'manifest'), 'https://customer-demo.cloudflarestream.com/limited-token/manifest/video.m3u8');
  assert.throws(() => playbackURL({ uid: 'owned-video', preview: 'https://example.com/watch' }));
});
test('polling distinguishes not-ready, ready, processing error and timeout', async () => {
  let calls = 0;
  assert.equal((await until(async () => ({ readyToStream: ++calls === 2 }), result => result.readyToStream, 'Video', 100, 1)).readyToStream, true);
  await assert.rejects(() => until(async () => ({ status: { state: 'error' } }), () => false, 'Video', 100, 1), /processing failed/);
  await assert.rejects(() => until(async () => ({}), () => false, 'Video', 0, 1), /polling limit/);
});
test('expiry and resource ownership reject scope changes before operations', () => {
  assert.equal(ttl(['--expires', '5']), 5);
  assert.throws(() => ttl(['--expires', '0']));
  assert.throws(() => ttl(['--unknown', '60']));
  const record = { run: 'media-test-123', r2: { keys: ['media-test-123/handout.txt'] } };
  assert.doesNotThrow(() => ownedKey(record, 'media-test-123/handout.txt'));
  assert.throws(() => ownedKey(record, 'other-run/handout.txt'));
  assert.throws(() => ownedKey(record, 'media-test-123/unrecorded.txt'));
});
test('multipart sends real 5/5/2 MiB bodies, preserves ordered ETags and records completion', async () => {
  const calls = []; let recorded = false, completed = false;
  const client = { send: async command => { calls.push(command); if (command.constructor.name === 'CreateMultipartUploadCommand') return { UploadId: 'test-upload' }; if (command.constructor.name === 'UploadPartCommand') return { ETag: `etag-${command.input.PartNumber}` }; return {}; } };
  await sendParts(client, 'test-bucket', 'owned/key', Buffer.alloc(PART_SIZE * 2 + 2 * 1024 * 1024), async id => { assert.equal(id, 'test-upload'); recorded = true; }, async () => { completed = true; });
  const parts = calls.filter(command => command.constructor.name === 'UploadPartCommand');
  assert.deepEqual(parts.map(command => command.input.Body.length), [PART_SIZE, PART_SIZE, 2 * 1024 * 1024]);
  assert.deepEqual(calls.at(-1).input.MultipartUpload.Parts.map(part => part.PartNumber), [1, 2, 3]);
  assert.ok(recorded && completed);
});
test('multipart failure aborts exact owned upload and never completes partial data', async () => {
  const calls = []; let aborted = false;
  const client = { send: async command => { calls.push(command); if (command.constructor.name === 'CreateMultipartUploadCommand') return { UploadId: 'test-upload' }; if (command.constructor.name === 'UploadPartCommand') throw new Error('test failure'); return {}; } };
  await assert.rejects(() => sendParts(client, 'test-bucket', 'owned/key', Buffer.alloc(12 * 1024 * 1024), async () => {}, async () => {}, async () => { aborted = true; }));
  assert.equal(calls.at(-1).constructor.name, 'AbortMultipartUploadCommand');
  assert.equal(calls.at(-1).input.UploadId, 'test-upload');
  assert.ok(aborted);
  assert.ok(!calls.some(command => command.constructor.name === 'CompleteMultipartUploadCommand'));
});
test('post-completion ledger failure does not attempt to abort a completed object', async () => {
  const calls = [];
  const client = { send: async command => { calls.push(command); if (command.constructor.name === 'CreateMultipartUploadCommand') return { UploadId: 'test-upload' }; if (command.constructor.name === 'UploadPartCommand') return { ETag: 'etag' }; return {}; } };
  await assert.rejects(() => sendParts(client, 'bucket', 'owned/key', Buffer.alloc(1024), async () => {}, async () => { throw new Error('disk failure'); }));
  assert.equal(calls.at(-1).constructor.name, 'CompleteMultipartUploadCommand');
});
