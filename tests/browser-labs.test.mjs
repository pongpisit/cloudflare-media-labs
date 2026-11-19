import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { buildKits, labEntries, renderLab, root, zipNames } from '../scripts/lab-kits.mjs';
import { generateLabel, hashFile, imageURL, imageVariants, labNames, presignedGET, streamURL, validLabel } from '../browser-labs/lab.js';
import { labWords, labs } from '../browser-labs/content.mjs';

test('learner kits contain the required local materials and no maintainer files or secrets', async () => {
  const output = await mkdtemp(path.join(tmpdir(), 'lab-kits-'));
  assert.deepEqual((await buildKits(output)).sort(), ['all-labs.zip', 'images-lab.zip', 'r2-lab.zip', 'stream-lab.zip']);
  assert.deepEqual((await readdir(output)).sort(), ['SHA256SUMS.txt', 'all-labs.zip', 'images-lab.zip', 'r2-lab.zip', 'stream-lab.zip']);
  for (const id of Object.keys(labs)) {
    const names = zipNames(await readFile(path.join(output, `${id}-lab.zip`)));
    assert.deepEqual(names.sort(), ['LICENSE', 'README.txt', 'START-HERE.html', ...labs[id].samples.map(name => `samples/${name}`)].sort());
    assert.ok(!names.some(name => /(^|\/)(\.env|node_modules|scripts|tests|lab-output)(\/|$)/.test(name)));
  }
  for (const name of ['images-lab.zip','stream-lab.zip','r2-lab.zip','all-labs.zip']) execFileSync('unzip', ['-tq', path.join(output, name)]);
  const allNames = zipNames(await readFile(path.join(output, 'all-labs.zip')));
  assert.ok(allNames.includes('images-lab/START-HERE.html') && allNames.includes('README.txt'));
  assert.deepEqual(allNames, [...allNames].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)), 'ZIP order must not depend on locale');
  const sums = (await readFile(path.join(output, 'SHA256SUMS.txt'), 'utf8')).trim().split('\n');
  for (const line of sums) { const [hash, name] = line.split(/\s{2}/); assert.equal(createHash('sha256').update(await readFile(path.join(output, name))).digest('hex'), hash); }
});

test('generated pages are self-contained, not credential forms, and label unconnected state', async () => {
  for (const id of Object.keys(labs)) {
    const html = await renderLab(id);
    assert.doesNotMatch(html, /img-src[^;]*\bhttps:(?!\/\/imagedelivery)/);
    assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+href=["']https?:|fetch\(|XMLHttpRequest|localStorage|Authorization|X-Auth|Bearer/i);
    assert.deepEqual([...html.matchAll(/sessionStorage\.(?:get|set)Item\(([^,)]+)/g)].map(match => match[1]).filter(key => key !== 'labelKey'), [], 'only the non-secret lab label may use session storage');
    assert.doesNotMatch(html, /type=["']password["']|name=["'](?:token|api|secret)/i);
    assert.match(html, /Not connected yet/);
    assert.match(html, /never needs a Cloudflare API token, signing key or R2 secret key/);
    assert.match(html, /<main>/); assert.match(html, /<title>/);
    for (const [, id] of html.matchAll(/id="([^"]+)"/g)) assert.equal(html.split(`id="${id}"`).length, 2, `duplicate id ${id}`);
    for (const [, label] of html.matchAll(/<label[^>]*>([\s\S]*?)<\/label>/g)) assert.ok(label.replace(/<[^>]+>/g, '').trim(), 'label has text');
    for (const [, href] of html.matchAll(/href="(samples\/[^"]+)"/g)) assert.ok(labs[id].samples.includes(href.split('/')[1]));
  }
  const sourceFiles = await Promise.all(['browser-labs/lab.css', 'browser-labs/lab.js'].map(file => readFile(path.join(root, file), 'utf8')));
  assert.doesNotMatch(sourceFiles.join('\n'), /Bearer|apiToken|secret key input/i);
});

test('lab steps preserve creation-before-upload, private-by-default and cleanup boundaries', () => {
  assert.equal(Object.values(labs).reduce((sum, lab) => sum + lab.minutes, 0), 110);
  assert.ok(labs.images.steps[1][1].indexOf('create your own card variant') < labs.images.steps[1][1].indexOf('before uploading sample-image.jpg'));
  assert.match(labs.stream.steps[1][1], /Do not infer playback readiness/);
  assert.match(labs.r2.steps[1][1], /r2\.dev disabled/);
  assert.match(labs.r2.steps[4][1], /Never use Empty Bucket/);
  for (const lab of Object.values(labs)) assert.match(lab.steps.at(-1)[1], /Delete only|Clean up|Delete your/i);
});

test('connection validators accept documented URL shapes and reject credentials, signed edits and wrong services', async () => {
  assert.equal(imageURL('https://imagedelivery.net/hash/image-id/public').hostname, 'imagedelivery.net');
  assert.deepEqual(imageVariants('https://imagedelivery.net/hash/image-id/public', 'lab-card', 'lab-detail'), ['https://imagedelivery.net/hash/image-id/lab-card', 'https://imagedelivery.net/hash/image-id/lab-detail']);
  for (const bad of ['http://imagedelivery.net/h/i/public', 'https://user:pass@imagedelivery.net/h/i/public', 'https://example.com/h/i/public', 'https://imagedelivery.net/h/i/public#x']) assert.throws(() => imageURL(bad));
  assert.throws(() => imageVariants('https://imagedelivery.net/h/i/public?sig=x&exp=1', 'a', 'b'));
  assert.throws(() => imageVariants('https://imagedelivery.net/h/i/public', '../a', 'b'));
  assert.equal(streamURL('https://customer-abc123.cloudflarestream.com/video-id/iframe?controls=true'), 'https://customer-abc123.cloudflarestream.com/video-id/iframe?controls=true');
  for (const bad of ['https://dash.cloudflare.com/x/iframe', 'https://customer-abc.cloudflarestream.com/video/manifest/video.m3u8', 'https://customer-abc.cloudflarestream.com/id/iframe?api_token=x', '<iframe src="https://customer-a.cloudflarestream.com/i/iframe">']) assert.throws(() => streamURL(bad));
  const account = 'a'.repeat(32);
  const signed = `https://${account}.r2.cloudflarestorage.com/bucket/key.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=a%2Fb&X-Amz-Date=20261021T000000Z&X-Amz-Expires=60&X-Amz-SignedHeaders=host&X-Amz-Signature=abc`;
  assert.equal(presignedGET(signed), signed);
  assert.throws(() => presignedGET(signed.replace('X-Amz-Signature=abc', '')));
  assert.throws(() => presignedGET(signed.replace(`${account}.r2.cloudflarestorage.com`, 'files.example.com')));
  assert.equal(await hashFile(new Blob(['abc'])), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('entry listing is deterministic and sample bytes are copied unchanged', async () => {
  const entries = await labEntries('stream');
  assert.match(entries[0].data, /src="data:text\/vtt/);
  for (const sample of labs.stream.samples) assert.deepEqual(entries.find(entry => entry.name === `samples/${sample}`).data, await readFile(path.join(root, 'samples', sample)));
  const a = await mkdtemp(path.join(tmpdir(), 'lab-a-')), b = await mkdtemp(path.join(tmpdir(), 'lab-b-'));
  const first = await buildKits(a), second = await buildKits(b);
  assert.deepEqual(first, second);
  for (const name of first) assert.deepEqual(await readFile(path.join(a,name)),await readFile(path.join(b,name)),`${name} must be byte-deterministic`);
});

test('lab labels and names follow the legal bucket and variant rules', () => {
  assert.deepEqual(labNames('class-pair07'), { folder: 'class-pair07', bucket: 'class-pair07-bucket', card: 'class-pair07-card', detail: 'class-pair07-detail' });
  for (const bad of ['', 'ab', '-abc', 'UPPER', 'a b', 'a'.repeat(45)]) assert.throws(() => labNames(bad));
  const label = generateLabel(labWords, (() => { let n = 0; return () => n++; })());
  assert.ok(validLabel(label));
  for (let i = 0; i < 200; i++) { const generated = generateLabel(labWords); assert.ok(validLabel(generated)); assert.ok(labNames(generated).bucket.length <= 63); }
  assert.ok(labWords.verbs.length > 40 && labWords.nouns.length > 40);
});

test('markdown guides and generated lab pages agree on the numbers learners must hit', async () => {
  const images = await readFile(path.join(root, 'docs/beginner-images.md'), 'utf8');
  const html = await renderLab('images');
  for (const fact of ['320', '1280', '720', '180', '960', 'Cover', 'Scale down']) {
    assert.ok(images.includes(fact), `guide lacks ${fact}`);
    assert.ok(html.includes(fact), `lab page lacks ${fact}`);
  }
  for (const file of ['README.md', 'docs/beginner-start.md', 'docs/beginner-images.md', 'docs/beginner-stream.md', 'docs/beginner-r2.md']) {
    assert.doesNotMatch(await readFile(path.join(root, file), 'utf8'), /workers\.dev\/labs\.html|Your lab tools|github\.io/, `${file} still points at the retired Worker lab reader`);
  }
});
