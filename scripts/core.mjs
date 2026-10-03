import { randomBytes, createHmac } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export class LabError extends Error {}
export function settings(env = process.env, product = 'base') {
  if (!/^[a-f0-9]{32}$/i.test(env.CF_ACCOUNT_ID || '')) throw new LabError('Set CF_ACCOUNT_ID to your 32-character account ID in .env.');
  if (!/^[a-z][a-z0-9-]{2,29}$/.test(env.LAB_PREFIX || '') || env.LAB_PREFIX === 'media-yourname') throw new LabError('Choose your own lowercase LAB_PREFIX (3–30 letters/digits/hyphens).');
  const value = { account: env.CF_ACCOUNT_ID, prefix: env.LAB_PREFIX, token: env.CF_API_TOKEN };
  if (['images', 'stream'].includes(product) && !env.CF_API_TOKEN?.trim()) throw new LabError('Set CF_API_TOKEN with account-scoped Images and/or Stream write permission.');
  if (product === 'r2') {
    if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(env.R2_BUCKET || '')) throw new LabError('Set R2_BUCKET to your dedicated private bucket.');
    for (const name of ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY']) if (!env[name]?.trim()) throw new LabError(`Set ${name} from a bucket-scoped R2 token.`);
    const jurisdiction = env.R2_JURISDICTION || 'default';
    if (!['default', 'eu', 'us', 'fedramp'].includes(jurisdiction)) throw new LabError('R2_JURISDICTION must match the bucket: default, eu, us, or fedramp.');
    value.bucket = env.R2_BUCKET;
    value.endpoint = `https://${value.account}${jurisdiction === 'default' ? '' : `.${jurisdiction}`}.r2.cloudflarestorage.com`;
    value.credentials = { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY };
  }
  return value;
}
export function ttl(args, maximum = 86400) {
  if (!args.length) return 60;
  if (args.length !== 2 || args[0] !== '--expires' || !/^\d+$/.test(args[1]) || Number(args[1]) < 5 || Number(args[1]) > maximum) throw new LabError(`Use --expires <seconds>, from 5 through ${maximum}.`);
  return Number(args[1]);
}
export async function state(config, create = false) {
  const directory = path.join(ROOT, '.lab');
  let record;
  try {
    if (!(await lstat(directory)).isDirectory() || (await lstat(directory)).isSymbolicLink()) throw new LabError('.lab must be a real local directory.');
    if ((await lstat(path.join(directory, 'state.json'))).isSymbolicLink()) throw new LabError('Refusing a symlinked ledger.');
    record = JSON.parse(await readFile(path.join(directory, 'state.json'), 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (!create) throw new LabError('No local resource ledger. Run the product setup/upload command first.');
    record = { account: config.account, prefix: config.prefix, run: `${config.prefix}-${randomBytes(4).toString('hex')}`, variants: [], images: [], stream: null, r2: null };
    await save(record);
  }
  if (record.account !== config.account || record.prefix !== config.prefix) throw new LabError('Account/prefix differs from .lab/state.json. Use the original .env to clean up that run first.');
  return record;
}
export async function save(record) {
  const directory = path.join(ROOT, '.lab');
  await mkdir(directory, { recursive: true, mode: 0o700 });
  if ((await lstat(directory)).isSymbolicLink()) throw new LabError('Refusing a symlinked ledger directory.');
  const temporary = path.join(directory, `state-${randomBytes(5).toString('hex')}.tmp`);
  await writeFile(temporary, `${JSON.stringify(record, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
  await rename(temporary, path.join(directory, 'state.json'));
}
export class CloudflareAPI {
  constructor(config, fetcher = fetch) { this.config = config; this.fetcher = fetcher; }
  async request(route, method = 'GET', body, { allowMissing = false } = {}) {
    const headers = { Authorization: `Bearer ${this.config.token}` };
    if (body && !(body instanceof FormData)) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(body); }
    let response;
    try {
      response = await this.fetcher(`https://api.cloudflare.com/client/v4/accounts/${this.config.account}${route}`, { method, headers, body, signal: AbortSignal.timeout(120000), redirect: 'error' });
    } catch { throw new LabError(`Cloudflare ${method} request failed or timed out. Inspect your ledger before retrying a creation.`); }
    if ((response.status === 404 && allowMissing && method === 'DELETE') || response.status === 204) return null;
    let data;
    try { data = await response.json(); } catch { throw new LabError(`Cloudflare returned non-JSON HTTP ${response.status}.`); }
    if (!response.ok || data.success !== true) {
      const codes = (data.errors || []).map(error => Number(error.code)).filter(Number.isFinite).join(',');
      throw new LabError(`Cloudflare HTTP ${response.status}${codes ? `; API codes ${codes}` : ''}. Check permissions, product activation and account ID. Raw responses are not logged.`);
    }
    return data.result;
  }
}
export async function sample(filename, type) {
  const bytes = await readFile(path.join(ROOT, 'samples', filename));
  const form = new FormData();
  form.set('file', new Blob([bytes], { type }), filename);
  return form;
}
export const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
export async function until(read, ready, label, maximum = 300000, delay = 3000) {
  const deadline = Date.now() + maximum;
  do {
    const result = await read();
    if (result?.status?.state === 'error' || result?.status === 'error') throw new LabError(`${label} processing failed. Inspect the owned resource in the dashboard.`);
    if (ready(result)) return result;
    if (Date.now() >= deadline) break;
    await wait(delay);
  } while (true);
  throw new LabError(`${label} is still processing after the polling limit. Resume with ready/verify; do not upload a duplicate.`);
}
export function signImage(input, key, seconds, now = Math.floor(Date.now() / 1000)) {
  if (!key?.trim()) throw new LabError('Set CF_IMAGES_SIGNING_KEY from Hosted Images > Keys for private delivery.');
  const url = new URL(input);
  if (url.protocol !== 'https:' || url.hostname !== 'imagedelivery.net' || url.username || url.password) throw new LabError('Expected an actual HTTPS imagedelivery.net delivery URL.');
  url.searchParams.delete('sig');
  url.searchParams.set('exp', String(now + seconds));
  url.searchParams.set('sig', createHmac('sha256', key).update(`${url.pathname}?${url.searchParams.toString()}`).digest('hex'));
  return url.href;
}
export async function statusOf(url) {
  const response = await fetch(url, { method: 'GET', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(30000) });
  await response.body?.cancel();
  return response.status;
}
export async function accessCheck(unsigned, signed, seconds, label) {
  const unsignedStatus = await statusOf(unsigned);
  const validStatus = await statusOf(signed);
  if (unsignedStatus < 400 || validStatus < 200 || validStatus >= 300) throw new LabError(`${label}: unsigned=${unsignedStatus}, signed=${validStatus}. Expected unsigned denial and signed success; check public overrides/readiness.`);
  console.log(`Unsigned: HTTP ${unsignedStatus}; valid capability: HTTP ${validStatus}. Waiting ${seconds + 3}s for a fresh expiry request…`);
  await wait((seconds + 3) * 1000);
  const expiredStatus = await statusOf(signed);
  if (expiredStatus < 400) throw new LabError(`${label}: expired request returned ${expiredStatus}; check your system clock and policy.`);
  console.log(`Expired fresh GET: HTTP ${expiredStatus}. Access sequence verified against the real service.`);
  return { unsignedStatus, validStatus, expiredStatus, checkedAt: new Date().toISOString() };
}
export function ownedKey(record, key) {
  if (!key.startsWith(`${record.run}/`) || !record.r2?.keys.includes(key)) throw new LabError('Key is not in this run’s owned-resource ledger.');
}
export async function cli(main) {
  try { await main(process.argv.slice(2)); }
  catch (error) {
    console.error(error instanceof LabError ? error.message : 'Operation failed. Inspect owned-resource status; SDK internals and credential-bearing responses are not logged.');
    process.exitCode = 1;
  }
}
