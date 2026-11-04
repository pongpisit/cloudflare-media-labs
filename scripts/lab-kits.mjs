import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateRawSync } from 'node:zlib';
import { labWords, labs, repo, site as siteURL, sources, workshop } from '../browser-labs/content.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const sampleDescriptions = {
  'sample-image.jpg': 'Orange campus picture · 1600×1200',
  'sample-video.mp4': 'Blue studio lesson · 20 seconds',
  'video-poster.jpg': 'Optional video poster',
  'captions-en.vtt': 'English captions · four cues',
  'sample-document.txt': 'Small private-download example'
};
const csp = "default-src 'none'; img-src 'self' file: https://imagedelivery.net blob: data:; media-src 'self' file: blob: data:; frame-src https://*.cloudflarestream.com https://*.videodelivery.net; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'";

let captionsData = '';
const namesSection = `<section class="tool" aria-labelledby="names-title"><p class="eyebrow">Your lab names</p><h2 id="names-title">Copy your own resource names</h2><p class="help">Use one label for your own work and keep the values in your worksheet. These are ordinary names, not passwords. A refresh in this tab keeps your label; use the button only before you create anything.</p><label>Your lab label<input id="lab-label" data-keep maxlength="44" autocomplete="off" spellcheck="false"></label><div class="copy-grid">${[['folder','Folder name'],['bucket','R2 bucket name'],['card','Card variant name'],['detail','Detail variant name']].map(([key, label]) => `<label>${label}<span class="copy-row"><input id="name-${key}" data-keep readonly><button type="button" data-copy="name-${key}">Copy</button></span></label>`).join('')}</div><div class="actions"><button type="button" id="regen-label">Generate a new label</button></div><div class="status" id="names-status" role="status" aria-live="polite" data-status>Preparing your names…</div><script type="application/json" id="lab-words">${JSON.stringify(labWords)}</script></section>`;
const connection = (id, { site = false } = {}) => { const samplePath = site ? '../samples/' : 'samples/'; return ({
  images: `<section class="tool" aria-labelledby="connect-title"><p class="eyebrow">Connect your real result</p><h2 id="connect-title">Show your actual card and detail images</h2><p class="help">Paste an actual public <code>imagedelivery.net</code> URL and the exact variant names you created. A delivery URL can be sensitive when it is signed. Never enter a Cloudflare API token, signing key or password here.</p>
<form id="image-form" class="fields"><label>Image delivery URL<input id="image-url" type="url" autocomplete="off" spellcheck="false" placeholder="https://imagedelivery.net/HASH/IMAGE_ID/public"></label><div><label>Card variant name<input id="card-name" autocomplete="off" spellcheck="false"></label><label>Detail variant name<input id="detail-name" autocomplete="off" spellcheck="false"></label></div><div class="actions"><button class="primary">Load real images</button></div></form>
<details><summary>Private image? Use full signed links from your instructor</summary><form id="signed-image-form" class="fields"><label>Signed card link<input id="signed-card" type="url" autocomplete="off" spellcheck="false"></label><label>Signed detail link<input id="signed-detail" type="url" autocomplete="off" spellcheck="false"></label><div class="actions"><button class="primary">Load signed images</button></div></form></details>
<div class="status connected-media" id="connection-status" role="status" aria-live="polite" data-status data-initial="Not connected yet. Nothing below is a Cloudflare result until you load your own URL.">Not connected yet. Nothing below is a Cloudflare result until you load your own URL.</div>
<div class="views connected-media"><figure><h3>Card — expect 320 × 180</h3><img data-real-image="0" alt="Your actual card image result" hidden><a data-real-link="0" target="_blank" rel="noopener noreferrer" hidden>Open actual card image</a></figure><figure><h3>Detail — expect 960 × 720</h3><img data-real-image="1" alt="Your actual detail image result" hidden><a data-real-link="1" target="_blank" rel="noopener noreferrer" hidden>Open actual detail image</a></figure></div></section>
<section class="tool" aria-labelledby="dimension-title"><p class="eyebrow">Check the actual download</p><h2 id="dimension-title">Read image dimensions</h2><p class="help">Save each real result, then select it here. The file stays on your device.</p><form id="dimension-form"><label>Downloaded image<input id="image-file" type="file" accept="image/*"></label><div class="actions"><button class="primary">Read dimensions</button></div></form><div class="status" id="dimension-status" role="status" aria-live="polite" data-status data-initial="No file read yet.">No file read yet.</div></section>`,
  stream: `<section class="tool" aria-labelledby="sample-title"><p class="eyebrow">Local sample only</p><h2 id="sample-title">Preview the supplied lesson</h2><p class="help">This plays your downloaded sample. It is not Cloudflare Stream and does not prove upload, caption readiness or access.</p><video controls preload="metadata" poster="${samplePath}video-poster.jpg"><source src="${samplePath}sample-video.mp4" type="video/mp4"><track kind="captions" srclang="en" label="English" default src="${captionsData}"></video></section>
<section class="tool" aria-labelledby="connect-title"><p class="eyebrow">Connect your real result</p><h2 id="connect-title">Open your actual Stream player</h2><p class="help">Paste only the HTTPS <code>src</code> address from the iframe embed in your video record—not the whole HTML snippet. For private video, use an instructor-issued signed player URL. Never enter an API token or signing key.</p><form id="stream-form"><label>Stream player URL<input id="stream-url" type="url" autocomplete="off" spellcheck="false" placeholder="https://customer-CODE.cloudflarestream.com/VIDEO_ID/iframe"></label><div class="actions"><button class="primary">Load your player</button></div></form><div class="status" id="connection-status" role="status" aria-live="polite" data-status data-initial="Not connected yet. The local sample above is not a Cloudflare result.">Not connected yet. The local sample above is not a Cloudflare result.</div><div id="player" class="connected-media"></div><p class="help">Opening this file directly can be blocked by an allowed-origin policy. Do not turn off access policies; ${site ? 'Your instructor must allow this site\'s origin, <code>pongpisit.github.io</code>, in the video\'s allowed origins.' : `Use the instructor-approved <a href="${siteURL}stream/" target="_blank" rel="noopener noreferrer">hosted version</a> instead.`}</p></section>`,
  r2: `<section class="tool" aria-labelledby="connect-title"><p class="eyebrow">Optional instructor demonstration</p><h2 id="connect-title">Open a temporary download link</h2><p class="help">The core lab uses the Dashboard download. Only use an instructor-issued native R2 presigned GET URL; it can be reused until expiry, so keep it private. Never enter R2 access keys, a secret key or an API token.</p><form id="r2-form"><label>Presigned GET URL<input id="r2-url" type="url" autocomplete="off" spellcheck="false"></label><div class="actions"><button class="primary">Check link format</button></div></form><div class="status" id="connection-status" role="status" aria-live="polite" data-status data-initial="Not connected yet. This page does not verify signatures or contact R2.">Not connected yet. This page does not verify signatures or contact R2.</div><p><a data-real-link target="_blank" rel="noopener noreferrer" hidden>Open temporary GET link</a></p></section>
<section class="tool" aria-labelledby="compare-title"><p class="eyebrow">Verify your actual download</p><h2 id="compare-title">Compare original and downloaded file</h2><p class="help">Select the original sample, then the copy you downloaded from R2. Files are read locally and are not uploaded.</p><form id="compare-form" class="fields"><label>Original file<input id="original-file" type="file"></label><label>Downloaded from R2<input id="downloaded-file" type="file"></label><label class="checklist"><span><input id="download-confirm" type="checkbox"> The second file is the actual R2 download.</span></label><div class="actions"><button class="primary">Compare files</button></div></form><div class="status" id="compare-status" role="status" aria-live="polite" data-status data-initial="No comparison yet.">No comparison yet.</div></section>`
})[id]; };

export async function labScript() {
  return (await readFile(path.join(root, 'browser-labs/lab.js'), 'utf8')).replace(/^export /gm, '');
}
export async function renderLab(id, { site = false } = {}) {
  const lab = labs[id], samplePath = site ? '../samples/' : 'samples/';
  captionsData = `data:text/vtt;charset=utf-8;base64,${(await readFile(path.join(root, 'samples/captions-en.vtt'))).toString('base64')}`;
  const [css, script] = [await readFile(path.join(root, 'browser-labs/lab.css'), 'utf8'), await labScript()];
  const downloads = lab.samples.map(name => `<a href="${samplePath}${name}" download>${escapeHTML(name)} <small>${escapeHTML(sampleDescriptions[name])}</small></a>`).join('');
  const steps = lab.steps.map(([title, text]) => `<li><div><h3>${escapeHTML(title)}</h3><p>${escapeHTML(text)}</p></div></li>`).join('');
  const references = sources[id].map(url => `<li><a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(url.replace('https://developers.cloudflare.com/', ''))}</a></li>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="referrer" content="no-referrer"><title>${escapeHTML(lab.name)} lab · Cloudflare Media Labs</title><style>${css}</style></head><body><header><strong>Cloudflare Media Labs</strong><span class="header-links">${site ? `<a href="../">All labs</a>` : `<a href="${siteURL}${id}/" target="_blank" rel="noopener noreferrer">Hosted version ↗</a>`}<a href="${repo}/blob/main/docs/beginner-${id}.md" target="_blank" rel="noopener noreferrer">Written guide ↗</a><a href="${workshop}" target="_blank" rel="noopener noreferrer">Workshop slides ↗</a></span></header><main><p class="eyebrow">Lab ${lab.number} · ${escapeHTML(lab.name)} · ${lab.minutes} minutes</p><h1>${escapeHTML(lab.title)}</h1><p class="intro">${escapeHTML(lab.intro)}</p><div class="notice"><strong>Your account only.</strong> Use the supplied synthetic samples in the approved workshop account. These products can incur usage charges. This page never needs a Cloudflare API token, signing key or R2 secret key. A delivery, player or presigned URL is a sensitive capability: enter it only for your own check and clear it afterward.</div><section aria-labelledby="materials"><h2 id="materials">Ready-to-use materials</h2><div class="downloads">${downloads}</div></section><section aria-labelledby="steps"><h2 id="steps">Follow these steps</h2><ol class="steps">${steps}</ol></section>${connection(id, { site })}${namesSection}<div class="actions"><button id="clear" type="button">Clear connections and selections</button></div><details><summary>Official references</summary><ul>${references}</ul></details><footer>Unofficial educational material. The page reads files and opens links locally; it does not log in, upload files, call Cloudflare APIs or keep URLs and files. Only your non-secret lab label is remembered in this browser tab. A page loading successfully is not proof of permissions or account configuration—check the actual result.</footer></main><script>${script}</script></body></html>`;
}

const crcTable = value => crc32(value) >>> 0;
export function zip(entries) {
  const locals = [], central = [];
  let offset = 0;
  for (const entry of [...entries].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    const name = Buffer.from(entry.name), data = Buffer.from(entry.data), compressed = deflateRawSync(data, { level: 9 }), sum = crcTable(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(8, 8); local.writeUInt16LE(0, 10); local.writeUInt16LE(33, 12);
    local.writeUInt32LE(sum, 14); local.writeUInt32LE(compressed.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(name.length, 26);
    locals.push(local, name, compressed);
    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50, 0); directory.writeUInt16LE(0x031e, 4); directory.writeUInt16LE(20, 6); directory.writeUInt16LE(0x0800, 8); directory.writeUInt16LE(8, 10); directory.writeUInt16LE(0, 12); directory.writeUInt16LE(33, 14);
    directory.writeUInt32LE(sum, 16); directory.writeUInt32LE(compressed.length, 20); directory.writeUInt32LE(data.length, 24); directory.writeUInt16LE(name.length, 28); directory.writeUInt32LE((0o100644 << 16) >>> 0, 38); directory.writeUInt32LE(offset, 42);
    central.push(directory, name);
    offset += local.length + name.length + compressed.length;
  }
  const size = central.reduce((total, part) => total + part.length, 0), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(size, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, ...central, end]);
}
export function zipNames(buffer) {
  const end = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const count = buffer.readUInt16LE(end + 10); let position = buffer.readUInt32LE(end + 16); const names = [];
  for (let index = 0; index < count; index++) { const length = buffer.readUInt16LE(position + 28), extra = buffer.readUInt16LE(position + 30), comment = buffer.readUInt16LE(position + 32); names.push(buffer.toString('utf8', position + 46, position + 46 + length)); position += 46 + length + extra + comment; }
  return names;
}

const readme = lab => `${lab.name} lab\n\n1. Extract this ZIP to a folder. Do not run the page from inside the ZIP preview.\n2. Double-click START-HERE.html.\n3. Follow the steps. The sample files are in the samples folder.\n\nDo not enter a Cloudflare API token, signing key, password or R2 secret key. Delivery, player and presigned URLs are sensitive capabilities; clear them when finished.\nUnofficial educational material. Charges can apply in your Cloudflare account.\n`;
export async function labEntries(id, folder = '') {
  const lab = labs[id], prefix = folder ? `${folder}/` : '';
  const entries = [{ name: `${prefix}START-HERE.html`, data: await renderLab(id) }, { name: `${prefix}README.txt`, data: readme(lab) }, { name: `${prefix}LICENSE`, data: await readFile(path.join(root, 'LICENSE')) }];
  for (const sample of lab.samples) entries.push({ name: `${prefix}samples/${sample}`, data: await readFile(path.join(root, 'samples', sample)) });
  return entries;
}
export async function buildKits(output = path.join(root, 'downloads')) {
  await rm(output, { recursive: true, force: true }); await mkdir(output, { recursive: true });
  const all = [], files = [];
  for (const id of Object.keys(labs)) {
    all.push(...await labEntries(id, `${id}-lab`));
    files.push([`${id}-lab.zip`, zip(await labEntries(id))]);
  }
  files.push(['all-labs.zip', zip([...all, { name: 'README.txt', data: 'Cloudflare Media Labs\n\nExtract the ZIP, open the folder for one lab, then double-click START-HERE.html. Never enter API tokens or secret keys.\n' }])]);
  const sums = [];
  for (const [name, data] of files) { await writeFile(path.join(output, name), data); sums.push(`${createHash('sha256').update(data).digest('hex')}  ${name}`); }
  await writeFile(path.join(output, 'SHA256SUMS.txt'), `${sums.join('\n')}\n`);
  return files.map(([name]) => name);
}
export async function renderIndex() {
  const css = await readFile(path.join(root, 'browser-labs/lab.css'), 'utf8');
  const cards = Object.entries(labs).map(([id, lab]) => `<a class="card" href="${id}/"><p class="eyebrow">Lab ${lab.number} · ${lab.minutes} minutes</p><h2>${escapeHTML(lab.name)}</h2><p>${escapeHTML(lab.title)}</p><span class="go">Open the ${escapeHTML(lab.name)} lab →</span></a>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>Cloudflare Media Labs</title><style>${css}</style></head><body><header><strong>Cloudflare Media Labs</strong><span class="header-links"><a href="${repo}/blob/main/docs/beginner-start.md" target="_blank" rel="noopener noreferrer">Start guide ↗</a><a href="${repo}/releases" target="_blank" rel="noopener noreferrer">Offline downloads ↗</a><a href="${workshop}" target="_blank" rel="noopener noreferrer">Workshop slides ↗</a></span></header><main><p class="eyebrow">Images · Stream · R2 · 110 minutes</p><h1>Hands-on media labs.</h1><p class="intro">Download the samples, follow the clicks, and check the actual result. The slides teach the ideas; these pages are where you practise.</p><div class="notice"><strong>Your account only.</strong> Use the synthetic samples in the approved workshop account. No page here asks for an API token, signing key or R2 secret key.</div><div class="cards">${cards}</div><section aria-labelledby="samples"><h2 id="samples">All sample files</h2><div class="downloads">${Object.keys(sampleDescriptions).map(name => `<a href="samples/${name}" download>${name} <small>${escapeHTML(sampleDescriptions[name])}</small></a>`).join('')}</div></section><footer>Unofficial educational material. <a href="${repo}" target="_blank" rel="noopener noreferrer">Source and written guides on GitHub</a>.</footer></main></body></html>`;
}
export async function buildSite(output = path.join(root, 'site')) {
  await rm(output, { recursive: true, force: true });
  await mkdir(path.join(output, 'samples'), { recursive: true });
  await writeFile(path.join(output, 'index.html'), await renderIndex());
  await writeFile(path.join(output, '.nojekyll'), '');
  for (const id of Object.keys(labs)) {
    await mkdir(path.join(output, id), { recursive: true });
    await writeFile(path.join(output, id, 'index.html'), await renderLab(id, { site: true }));
  }
  for (const name of Object.keys(sampleDescriptions)) await writeFile(path.join(output, 'samples', name), await readFile(path.join(root, 'samples', name)));
  return output;
}
if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv[2] === 'site') console.log(await buildSite());
else if (process.argv[1] === fileURLToPath(import.meta.url)) console.log((await buildKits()).map(name => `downloads/${name}`).join('\n'));
