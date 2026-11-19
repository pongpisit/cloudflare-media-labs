/* Browser-only lab tools. No management credentials, storage, telemetry or API calls. */
export function httpsURL(value) {
  let url;
  try { url = new URL(String(value).trim()); } catch { throw new Error('Paste a complete HTTPS URL, not HTML, a file name or a Dashboard instruction.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) throw new Error('Use a complete HTTPS URL without a password, custom port or fragment.');
  return url;
}
export function imageURL(value) {
  const url = httpsURL(value);
  if (url.hostname !== 'imagedelivery.net' || !/^\/[^/]+\/[^/]+\/[^/]+$/.test(url.pathname)) throw new Error('Use the actual imagedelivery.net URL from your image record. Custom image paths are not supported in this beginner tool.');
  return url;
}
export function imageVariants(value, card, detail) {
  const url = imageURL(value);
  if (url.search) throw new Error('Do not modify a signed URL. Use the complete signed-link fields instead.');
  if (![card, detail].every(name => /^[A-Za-z0-9_-]{1,100}$/.test(name))) throw new Error('Enter the exact saved variant names using letters, numbers, hyphens or underscores.');
  return [card, detail].map(name => { const result = new URL(url); result.pathname = `${url.pathname.slice(0, url.pathname.lastIndexOf('/') + 1)}${name}`; return result.href; });
}
export function streamURL(value) {
  const url = httpsURL(value);
  if (!/^customer-[a-z0-9-]+\.(cloudflarestream\.com|videodelivery\.net)$/.test(url.hostname) || !/^\/[^/]+\/iframe$/.test(url.pathname)) throw new Error('Use the HTTPS customer Stream iframe src URL, not HTML, a manifest, API token or Dashboard URL.');
  const allowed = new Set(['controls','autoplay','muted','loop','preload','poster','startTime','defaultTextTrack','letterboxColor','primaryColor']);
  if ([...url.searchParams.keys()].some(key => !allowed.has(key))) throw new Error('This player URL has unsupported options. Copy the iframe src from the video record.');
  return url.href;
}
export function presignedGET(value) {
  const url = httpsURL(value);
  if (!/^[a-f0-9]{32}(\.(eu|us|fedramp))?\.r2\.cloudflarestorage\.com$/.test(url.hostname) || !url.pathname.slice(1).includes('/')) throw new Error('Use an instructor-issued native R2 S3 presigned GET URL with its original hostname and path.');
  for (const key of ['X-Amz-Algorithm','X-Amz-Credential','X-Amz-Date','X-Amz-Expires','X-Amz-SignedHeaders','X-Amz-Signature']) if (!url.searchParams.get(key)) throw new Error('The URL is missing presigned request fields. Ask the instructor for a complete GET link.');
  if (url.searchParams.get('X-Amz-Algorithm') !== 'AWS4-HMAC-SHA256') throw new Error('Unsupported signing algorithm.');
  return url.href;
}
export const validLabel = value => /^[a-z0-9][a-z0-9-]{2,43}$/.test(value);
export function labNames(label) {
  if (!validLabel(label)) throw new Error('Use 3–44 lowercase letters, numbers or hyphens, starting with a letter or number.');
  return { folder: label, bucket: `${label}-bucket`, card: `${label}-card`, detail: `${label}-detail` };
}
export function generateLabel(words, random = () => crypto.getRandomValues(new Uint32Array(1))[0]) {
  return `${words.verbs[random() % words.verbs.length]}-${words.nouns[random() % words.nouns.length]}`;
}
export async function hashFile(file) {
  if (!globalThis.crypto?.subtle) throw new Error('This browser does not support local SHA-256 here. Use a current Edge or Chrome, and open the page from the extracted folder.');
  const bytes = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2,'0')).join('');
}

if (typeof document !== 'undefined') {
  const $ = selector => document.querySelector(selector);
  const status = (id, message, state = '') => { const node = $(id); node.textContent = message; node.dataset.state = state; };
  let generation = 0;
  const clear = () => {
    generation++;
    document.querySelectorAll('input:not([data-keep])').forEach(input => { if (input.type === 'checkbox') input.checked = false; else input.value = ''; });
    document.querySelectorAll('[data-real-image]').forEach(image => { image.removeAttribute('src'); image.hidden = true; });
    document.querySelectorAll('[data-real-link]').forEach(link => { link.removeAttribute('href'); link.hidden = true; });
    $('#player')?.replaceChildren();
    document.querySelectorAll('[data-status]').forEach(node => { if (node.dataset.initial) { node.textContent = node.dataset.initial; node.dataset.state = ''; } });
    document.querySelectorAll('video').forEach(video => video.pause());
  };
  const labelKey = 'media-labs:lab-label:v1';
  const labelInput = $('#lab-label');
  if (labelInput) {
    const words = JSON.parse($('#lab-words').textContent);
    const update = (message = '') => {
      try {
        const names = labNames(labelInput.value.trim());
        for (const [key, value] of Object.entries(names)) $(`#name-${key}`).value = value;
        status('#names-status', message || 'Saved for this tab. Copy these names before creating resources. They are not passwords.', 'success');
      } catch (error) {
        for (const key of ['folder', 'bucket', 'card', 'detail']) $(`#name-${key}`).value = '';
        status('#names-status', error.message, 'error');
      }
    };
    let saved = '';
    try { saved = sessionStorage.getItem(labelKey) || ''; } catch {}
    labelInput.value = validLabel(saved) ? saved : generateLabel(words);
    try { sessionStorage.setItem(labelKey, labelInput.value); } catch {}
    update();
    labelInput.addEventListener('input', () => { const value = labelInput.value.trim(); if (validLabel(value)) { try { sessionStorage.setItem(labelKey, value); } catch {} } update(); });
    $('#regen-label').addEventListener('click', () => {
      let next = generateLabel(words); while (next === labelInput.value.trim()) next = generateLabel(words);
      labelInput.value = next; try { sessionStorage.setItem(labelKey, next); } catch {}
      update(`New label: ${next}. Do not generate another after creating resources; keep using the names of the resources you already created.`);
    });
    document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
      const field = $(`#${button.dataset.copy}`); if (!field.value) return;
      try { await navigator.clipboard.writeText(field.value); status('#names-status', `Copied: ${field.value}`, 'success'); }
      catch { field.focus(); field.select(); status('#names-status', 'The value is selected. Press Ctrl+C (Mac: Command+C), then paste it into the Dashboard.'); }
    }));
  }
  $('#clear')?.addEventListener('click', clear);
  addEventListener('pagehide', clear);
  const showImages = urls => {
    generation++;
    urls.forEach((url, index) => {
      const image = $(`[data-real-image="${index}"]`), link = $(`[data-real-link="${index}"]`);
      image.referrerPolicy = 'no-referrer'; image.src = url; image.hidden = false;
      link.href = url; link.hidden = false;
    });
    status('#connection-status', 'Real URLs requested. Review both results, then save and measure the actual downloads. Loading a link alone does not verify dimensions.');
  };
  $('#image-form')?.addEventListener('submit', event => {
    event.preventDefault();
    try { showImages(imageVariants($('#image-url').value, $('#card-name').value.trim(), $('#detail-name').value.trim())); }
    catch (error) { clearImages(); status('#connection-status', error.message, 'error'); }
  });
  const clearImages = () => { document.querySelectorAll('[data-real-image]').forEach(image => { image.removeAttribute('src'); image.hidden = true; }); document.querySelectorAll('[data-real-link]').forEach(link => { link.removeAttribute('href'); link.hidden = true; }); };
  $('#signed-image-form')?.addEventListener('submit', event => {
    event.preventDefault();
    try { showImages([imageURL($('#signed-card').value).href, imageURL($('#signed-detail').value).href]); }
    catch (error) { clearImages(); status('#connection-status', error.message, 'error'); }
  });
  document.querySelectorAll('[data-real-image]').forEach(image => image.addEventListener('error', () => status('#connection-status', 'An image did not load. Check the exact URL, saved variant and access policy. A private link may have expired. Do not enable a public override.', 'error')));
  $('#dimension-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const file = $('#image-file').files[0], current = ++generation;
    if (!file) return status('#dimension-status', 'Select an actual downloaded image first.', 'error');
    const url = URL.createObjectURL(file), image = new Image();
    try { image.src = url; await image.decode(); if (current === generation) status('#dimension-status', `${image.naturalWidth} × ${image.naturalHeight} pixels. Compare with card 320×180 or detail 960×720. This reads your selected file; it does not prove its origin.`, 'success'); }
    catch { if (current === generation) status('#dimension-status', 'This file could not be decoded as an image. Select the downloaded image, not an error page.', 'error'); }
    finally { URL.revokeObjectURL(url); }
  });
  $('#image-file')?.addEventListener('change', () => { generation++; status('#dimension-status','File changed. Read dimensions again.'); });
  $('#stream-form')?.addEventListener('submit', event => {
    event.preventDefault(); $('#player').replaceChildren();
    try {
      const url = streamURL($('#stream-url').value), frame = document.createElement('iframe');
      frame.title = 'Your actual Stream video'; frame.referrerPolicy = 'strict-origin-when-cross-origin'; frame.allow = 'accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture'; frame.allowFullscreen = true; frame.src = url;
      $('#player').append(frame);
      status('#connection-status','Player requested—not playback verified. Press Play, listen, and select English captions. A restricted video may refuse to play from a local file; check playback in the Dashboard player instead.');
    } catch (error) { status('#connection-status', error.message, 'error'); }
  });
  $('#r2-form')?.addEventListener('submit', event => {
    event.preventDefault(); const link = $('[data-real-link]'); link.removeAttribute('href'); link.hidden = true;
    try { link.href = presignedGET($('#r2-url').value); link.hidden = false; status('#connection-status','Link format checked only. Open the instructor-issued GET link to download, then compare the actual saved file. Signature, method, expiry and object existence are not verified by this page.'); }
    catch (error) { status('#connection-status',error.message,'error'); }
  });
  for (const id of ['#original-file','#downloaded-file','#download-confirm']) $(id)?.addEventListener('change', () => { generation++; if (id !== '#download-confirm') $('#download-confirm').checked = false; status('#compare-status','Selection changed. Confirm provenance and compare again.'); });
  $('#compare-form')?.addEventListener('submit', async event => {
    event.preventDefault(); const original = $('#original-file').files[0], downloaded = $('#downloaded-file').files[0], current = ++generation;
    if (!original || !downloaded || !$('#download-confirm').checked) return status('#compare-status','Choose both files and confirm the second came from an actual R2 download.', 'error');
    if (original.size > 100 * 1024 * 1024 || downloaded.size > 100 * 1024 * 1024) return status('#compare-status','Use the supplied small samples. This local tool limits each file to 100 MiB.', 'error');
    status('#compare-status','Comparing selected files locally…');
    try {
      const [a,b] = await Promise.all([hashFile(original),hashFile(downloaded)]);
      if (current !== generation) return;
      const match = original.size === downloaded.size && a === b;
      status('#compare-status',`${match ? 'MATCH' : 'MISMATCH'} — ${match ? 'same size and SHA-256' : 'the selected contents differ'}.\nOriginal: ${original.size} bytes · ${a}\nDownload: ${downloaded.size} bytes · ${b}\nA match does not prove provenance. Selecting the original twice is not a completed R2 lab.`,match?'success':'error');
    } catch (error) { if (current === generation) status('#compare-status',error.message,'error'); }
  });
}
