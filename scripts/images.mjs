import sharp from 'sharp';
import path from 'node:path';
import { cli, settings, state, save, CloudflareAPI, sample, signImage, accessCheck, ttl, LabError } from './core.mjs';

export const VARIANTS = { thumb: { width: 320, height: 180, fit: 'cover', metadata: 'none' }, detail: { width: 1280, height: 720, fit: 'scale-down', metadata: 'none' } };
export function deliveryURL(input, image, variant) {
  const url = new URL(input);
  const parts = url.pathname.split('/').filter(Boolean);
  if (url.protocol !== 'https:' || url.hostname !== 'imagedelivery.net' || parts.length !== 3 || parts[1] !== image) throw new LabError('Unexpected image delivery URL; use the dashboard to inspect the uploaded image.');
  parts[2] = variant; url.pathname = `/${parts.join('/')}`; url.search = '';
  return url.href;
}
export async function main(args) {
  const [command, ...rest] = args;
  if (!command || command === '--help') { console.log('Real Images lab: setup | upload | verify | private | sign [--expires 60] | verify-access [--expires 5] | cleanup. See docs/01-images.md.'); return; }
  if (!['setup', 'upload', 'verify', 'private', 'sign', 'verify-access', 'cleanup'].includes(command)) throw new LabError('Unknown Images command; use --help.');
  const seconds = ttl(rest);
  const config = settings(process.env, 'images');
  const record = await state(config, command === 'setup');
  const api = new CloudflareAPI(config);
  const names = Object.keys(VARIANTS).map(name => `${record.run}-${name}`);
  if (command === 'setup') {
    const result = await api.request('/images/v1/variants');
    const variants = Object.values(result.variants || {});
    for (const [name, options] of Object.entries(VARIANTS)) {
      const id = `${record.run}-${name}`;
      const found = variants.find(variant => variant.id === id);
      if (found && !record.variants.includes(id)) throw new LabError('Variant name already exists outside this ledger. Use a new run; no existing variant was changed.');
      if (found) {
        if (found.neverRequireSignedURLs || Object.entries(options).some(([key, value]) => found.options?.[key] !== value)) throw new LabError('Recorded variant settings changed. Inspect the dashboard before continuing.');
        continue;
      }
      await api.request('/images/v1/variants', 'POST', { id, options, neverRequireSignedURLs: false });
      record.variants.push(id); await save(record); console.log(`Created owned variant: ${id}`);
    }
    return;
  }
  if (command === 'cleanup') {
    for (const image of [...record.images]) {
      await api.request(`/images/v1/${encodeURIComponent(image.id)}`, 'DELETE', undefined, { allowMissing: true });
      record.images = record.images.filter(item => item.id !== image.id); await save(record); console.log(`Deleted owned image ${image.id}.`);
    }
    for (const id of [...record.variants]) {
      if (!names.includes(id)) throw new LabError('Unexpected variant in ledger; inspect manually.');
      await api.request(`/images/v1/variants/${id}`, 'DELETE', undefined, { allowMissing: true });
      record.variants = record.variants.filter(name => name !== id); await save(record); console.log(`Deleted owned variant ${id}.`);
    }
    return;
  }
  if (command === 'upload') {
    if (record.images.length) throw new LabError('This run already has an image. Resume verify/private or clean it up first.');
    if (!names.every(name => record.variants.includes(name))) throw new LabError('Run images setup first.');
    const form = await sample('sample-image.jpg', 'image/jpeg');
    form.set('metadata', JSON.stringify({ workshop: record.run }));
    const result = await api.request('/images/v1', 'POST', form);
    if (!result.id) throw new LabError('Upload returned no image ID. Inspect the dashboard before repeating.');
    const image = { id: result.id, private: false };
    record.images.push(image); await save(record);
    if (!result.variants?.[0]) throw new LabError('Image ID recorded, but no delivery URL returned. Inspect dashboard delivery links.');
    image.urls = Object.fromEntries(Object.keys(VARIANTS).map(name => [name, deliveryURL(result.variants[0], result.id, `${record.run}-${name}`)]));
    await save(record); console.log(`Image ID: ${image.id}\nThumbnail: ${image.urls.thumb}\nDetail: ${image.urls.detail}`); return;
  }
  const image = record.images[0];
  if (!image?.urls) throw new LabError('Upload an image for this run first.');
  if (command === 'private') {
    const result = await api.request(`/images/v1/${encodeURIComponent(image.id)}`, 'PATCH', { requireSignedURLs: true });
    if (!result.id) throw new LabError('Inspect the image after the access update; response has no ID.');
    image.id = result.id; image.private = true;
    await save(record);
    if (!result.variants?.[0]) throw new LabError('Updated image ID recorded; inspect current delivery URLs in the dashboard.');
    image.urls = Object.fromEntries(Object.keys(VARIANTS).map(name => [name, deliveryURL(result.variants[0], result.id, `${record.run}-${name}`)]));
    await save(record); console.log(`Private image ID: ${image.id}. Non-public lab variants require signatures.`); return;
  }
  if (command === 'sign') { console.log(signImage(image.urls.detail, process.env.CF_IMAGES_SIGNING_KEY, seconds)); return; }
  if (command === 'verify-access') {
    if (!image.private) throw new LabError('Run images private first.');
    image.access = await accessCheck(image.urls.detail, signImage(image.urls.detail, process.env.CF_IMAGES_SIGNING_KEY, seconds), seconds, 'Images');
    await save(record); return;
  }
  for (const [name, expected] of [['thumb', [320, 180]], ['detail', [960, 720]]]) {
    const url = image.private ? signImage(image.urls[name], process.env.CF_IMAGES_SIGNING_KEY, seconds) : image.urls[name];
    const response = await fetch(url, { headers: { Accept: 'image/jpeg' }, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new LabError(`Delivery ${name}: HTTP ${response.status}.`);
    const actual = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
    if (actual.width !== expected[0] || actual.height !== expected[1]) throw new LabError(`${name}: measured ${actual.width}×${actual.height}; expected ${expected.join('×')}.`);
    console.log(`${name}: measured ${actual.width}×${actual.height}, format ${actual.format}.`);
  }
  image.verifiedAt = new Date().toISOString(); await save(record);
}
if (path.basename(process.argv[1] || '') === 'images.mjs') await cli(main);
