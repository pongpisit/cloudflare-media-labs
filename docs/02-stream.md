# Lab 2 — ready, captioned and protected playback

Read [Stream theory](00-theory.md#stream-file--renditions--manifests--player) and complete [setup](setup.md). Stream must be activated with capacity and account-scoped Stream write permission.

## 1. Upload the actual English clip

```sh
npm run stream -- upload
```

Uploads `samples/sample-video.mp4` with basic multipart form POST, records the returned UID, then updates **that video** to `requireSignedURLs=true`. Stream's default is public UID-based access before this update. The sample has no private customer data. If the access update fails, retain the UID and inspect/fix that owned video; do not upload it again as a workaround.

## 2. Wait for playability

```sh
npm run stream -- ready
```

Polls for up to five minutes, stopping at `readyToStream=true`. The printed all-quality progress can still be below 100. Processing error/timeout stops the command; rerun `ready` later to resume inspecting the same UID.

## 3. Upload and inspect captions independently

```sh
npm run stream -- captions
npm run stream -- verify
```

Uploads `samples/captions-en.vtt` through `PUT /stream/<uid>/captions/en`, then separately polls English caption readiness. `verify` checks video readiness, signed-playback policy and ready English track. Caption metadata alone does not establish accurate text/timing; the next step is required.

## 4. Play the real iframe

```sh
npm run stream -- token --expires 60
```

Prints an actual customer-host iframe URL using `/token` with explicit Unix expiry. The playback token replaces the video UID in the path; the REST API token stays in the terminal.

Open the workshop's **[live Stream preview](https://mahidol-media-training.pongpisit.workers.dev/labs.html#live-preview)** and paste the printed iframe URL. Load it, click Play, enable English captions, listen to all 20 seconds, and inspect the first and last cues. Clear the preview when finished. This verifies a real Stream embed, not your LMS's CSP/integration.

Alternatively, use the owned video's dashboard preview. Do not paste `CF_API_TOKEN` into any browser field.

## 5. Verify a fresh access/expiry sequence

```sh
npm run stream -- verify-access --expires 5
```

Uses the actual Stream HLS manifest endpoint: unsigned UID denied → valid token succeeds → after a short wait, the same token denied on a **new request**. This does not wait for buffered playback to stop, and it does not download/store/proxy manifests.

If playback fails while the manifest check passes, inspect allowed-origin settings, the exact customer hostname, token lifetime and browser/CSP errors. If you explicitly restrict origins, allow `mahidol-media-training.pongpisit.workers.dev` for the hosted preview; local embedding needs the documented host/port entry as well. Allowed origins are an embedding policy, not identity authentication.

## 6. Record and clean up

Record UID, readiness, all-quality progress, caption readiness, actual audio/text match, iframe result and access HTTP statuses. Do not record the token.

```sh
npm run stream -- cleanup
```

Deletes only this run's recorded video; attached captions are removed with it. Clear any preview URL.

## Recovery

- Processing blocks: inspect the source/error in dashboard and resume `ready`; do not repeatedly upload.
- Captions missing: inspect independent track readiness and choose English in the player. `en` uploads replace that owned video's existing English track.
- Access failure: check `requireSignedURLs`, exact token path and time. A `/token` call is a live, rate-limited API operation.
- Preserve your original source separately: Stream's encoded download is not the exact uploaded original.

References: [basic uploads](https://developers.cloudflare.com/stream/uploading-videos/upload-video-file/), [captions](https://developers.cloudflare.com/stream/edit-videos/adding-captions/), [signed playback/token customization](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/), [manifests](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/).
