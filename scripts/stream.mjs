import { cli, settings, state, save, CloudflareAPI, sample, until, ttl, accessCheck, LabError } from './core.mjs';
import path from 'node:path';

export function playbackURL(video, token = video.uid, kind = 'iframe') {
  const source = video.preview || video.playback?.hls;
  if (!source) throw new LabError('No customer playback hostname returned; inspect Stream dashboard.');
  const url = new URL(source);
  if (url.protocol !== 'https:' || !/^customer-[a-z0-9-]+\.cloudflarestream\.com$/.test(url.hostname)) throw new LabError('Unexpected Stream customer hostname.');
  url.pathname = `/${token}/${kind === 'manifest' ? 'manifest/video.m3u8' : 'iframe'}`; url.search = ''; return url.href;
}
export async function main(args) {
  const [command, ...rest] = args;
  if (!command || command === '--help') { console.log('Real Stream lab: upload | ready | captions | verify | token [--expires 60] | verify-access [--expires 5] | cleanup. See docs/02-stream.md.'); return; }
  if (!['upload', 'ready', 'captions', 'verify', 'token', 'verify-access', 'cleanup'].includes(command)) throw new LabError('Unknown Stream command; use --help.');
  const seconds = ttl(rest);
  const config = settings(process.env, 'stream');
  const record = await state(config, command === 'upload');
  const api = new CloudflareAPI(config);
  if (command === 'upload') {
    if (record.stream) throw new LabError('Video already recorded. Resume ready/captions/verify or clean up first.');
    const result = await api.request('/stream', 'POST', await sample('sample-video.mp4', 'video/mp4'));
    if (!result.uid) throw new LabError('Upload returned no UID. Inspect the dashboard before retrying.');
    record.stream = { uid: result.uid }; await save(record);
    await api.request(`/stream/${result.uid}`, 'POST', { uid: result.uid, requireSignedURLs: true, meta: { name: `${record.run}-english-demo` } });
    console.log(`Uploaded owned video UID: ${result.uid}. Signed playback requested; verify confirms the policy.`); return;
  }
  const owned = record.stream;
  if (!owned?.uid) throw new LabError('Upload the sample first.');
  if (command === 'cleanup') {
    await api.request(`/stream/${owned.uid}`, 'DELETE', undefined, { allowMissing: true }); record.stream = null; await save(record); console.log(`Deleted owned video ${owned.uid}, including captions.`); return;
  }
  const read = () => api.request(`/stream/${owned.uid}`);
  if (command === 'ready') {
    const video = await until(read, video => video.readyToStream === true, 'Video');
    console.log(`readyToStream=true; state=${video.status?.state}; all-quality progress=${video.status?.pctComplete ?? 'not returned'}%.`);
    owned.readyAt = new Date().toISOString(); await save(record); return;
  }
  if (command === 'captions') {
    await api.request(`/stream/${owned.uid}/captions/en`, 'PUT', await sample('captions-en.vtt', 'text/vtt'));
    const track = await until(async () => {
      const tracks = await api.request(`/stream/${owned.uid}/captions`);
      return tracks.find(track => track.language === 'en');
    }, track => track?.status === 'ready', 'English captions', 120000);
    console.log(`English captions: ${track.status}; generated=${track.generated}. Review actual player text/timing too.`);
    owned.captionsReadyAt = new Date().toISOString(); await save(record); return;
  }
  const video = await read();
  if (!video.requireSignedURLs) throw new LabError('Signed playback is not enabled. Inspect the owned video policy in the dashboard.');
  if (!video.readyToStream) throw new LabError('Run stream ready and wait for playable video.');
  if (command === 'verify') {
    const tracks = await api.request(`/stream/${owned.uid}/captions`);
    if (!tracks.some(track => track.language === 'en' && track.status === 'ready')) throw new LabError('English captions are not ready; run captions.');
    owned.verifiedAt = new Date().toISOString(); await save(record); console.log('Video playable, signed playback required, English captions ready. Next: token and actual player review.'); return;
  }
  const result = await api.request(`/stream/${owned.uid}/token`, 'POST', { exp: Math.floor(Date.now() / 1000) + seconds });
  if (!result.token || /[\/\s]/.test(result.token)) throw new LabError('Token endpoint returned no valid playback token.');
  if (command === 'token') { console.log(playbackURL(video, result.token)); return; }
  owned.access = await accessCheck(playbackURL(video, video.uid, 'manifest'), playbackURL(video, result.token, 'manifest'), seconds, 'Stream HLS manifest');
  await save(record);
}
if (path.basename(process.argv[1] || '') === 'stream.mjs') await cli(main);
