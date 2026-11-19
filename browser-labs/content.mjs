export const labs = {
  images: { name: 'Images', number: '01', minutes: 35, title: 'One picture. Two real views.', intro: 'Create your own variants, upload the campus image, then open the two delivered views from your image record.', samples: ['sample-image.jpg'], steps: [
    ['Prepare', 'Open the supplied JPEG. Select the approved Cloudflare account and choose unique card/detail variant names. Products must already be activated by the instructor.'],
    ['Create, then upload', 'In Images → Hosted Images → Delivery, create your own card variant: 320×180, Cover. Create detail: 1280×720, Scale down. Strip metadata and leave Always allow public access off. Save and reopen both settings before uploading sample-image.jpg. Keep your image record open. Never edit a shared variant.'],
    ['Open the views', 'From your image record in Dashboard, open the delivery link for your card variant and then your detail variant. Use the saved variant names exactly. For a private image, ask the instructor for the appropriate access; do not enable a public override.'],
    ['Compare', 'Compare the actual delivered views in your browser. The card crops the source to fill a wide box; the detail keeps the whole picture. Save each result if needed. On Windows, right-click the saved file → Properties → Details to view dimensions when supported. Expect card 320×180 and detail 960×720 for this source.'],
    ['Clean up', 'Delete only your recorded image and variants you personally created. Leave instructor-supplied variants alone. Keep the original sample.']
  ] },
  stream: { name: 'Stream', number: '02', minutes: 40, title: 'Your lesson. In a real player.', intro: 'Upload the supplied clip, review its captions, and connect your actual Stream player. No HTML editing required.', samples: ['sample-video.mp4', 'video-poster.jpg', 'captions-en.vtt'], steps: [
    ['Prepare', 'Play sample-video.mp4 with sound. The blue recording-studio scene is different from the Images sample. Keep captions-en.vtt beside it. Select the instructor-approved account with available Stream capacity.'],
    ['Upload', 'Open Stream → Videos → Quick upload. Upload sample-video.mp4 once, record its video ID, and wait until it plays with sound. Do not infer playback readiness from transfer completion or upload duplicate copies while waiting.'],
    ['Review captions', 'If your role has a caption upload control, upload captions-en.vtt as English and wait for readiness. Otherwise the instructor attaches it using your recorded video ID. In the actual player, select English CC and review the first and last cues against the speech.'],
    ['Connect and verify', 'Copy only the HTTPS src URL from the actual iframe embed, not the whole snippet. For private playback, use an instructor-issued signed player URL. Load it below and press Play, then CC → English. A local sample preview is not Cloudflare evidence.'],
    ['Clean up', 'Clear the player connection, then delete only your recorded Stream video. Keep the original MP4 and captions. Record private-access demonstrations as instructor performed or not performed.']
  ] },
  r2: { name: 'R2', number: '03', minutes: 35, title: 'Store it. Download it. Prove it.', intro: 'Keep the bucket private, download your actual stored copy, and compare its bytes with the original on your device.', samples: ['sample-document.txt', 'sample-video.mp4'], steps: [
    ['Prepare', 'Select the approved account. Choose a unique bucket name: 3–63 lowercase letters, numbers or hyphens; no leading/trailing hyphen. Record who owns the bucket and exact keys. Keep the original sample files unchanged.'],
    ['Create and upload', 'In R2 object storage → Overview, create your dedicated Standard bucket in the instructor-approved location. Keep r2.dev disabled and no public custom domain connected. Upload the document and MP4 under your own prefix. If creation is restricted, record the instructor-created/shared fallback. Do not enable Bucket Locks on a bucket that must be cleaned up.'],
    ['Download', 'Use the actual object → Download action in Dashboard. Rename the downloaded MP4 to video-from-r2.mp4. Optional: an instructor can supply a short-lived presigned GET link. No R2 access keys belong in this page.'],
    ['Verify', 'Select the original sample-video.mp4 and the actual R2 download below. Confirm where the second file came from, then compare. A SHA-256 match proves equal contents, not provenance or permissions. Selecting the original twice is not a completed lab.'],
    ['Clean up', 'Delete only your recorded files and owned folder marker. Delete your personally created bucket only when completely empty. Never use Empty Bucket on shared storage. Clear file selections and any temporary link.']
  ] }
};
export const repo = 'https://github.com/pongpisit/cloudflare-media-labs';
export const workshop = 'https://mahidol-media-training.pongpisit.workers.dev/';
export const sources = {
  images: ['https://developers.cloudflare.com/images/storage/upload-images/methods/', 'https://developers.cloudflare.com/images/optimization/hosted-images/create-variants/'],
  stream: ['https://developers.cloudflare.com/stream/get-started/', 'https://developers.cloudflare.com/stream/edit-videos/adding-captions/', 'https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/'],
  r2: ['https://developers.cloudflare.com/r2/buckets/create-buckets/', 'https://developers.cloudflare.com/r2/objects/download-objects/', 'https://developers.cloudflare.com/r2/api/s3/presigned-urls/']
};
