# Lab 2 — ready, captioned and protected playback (40 minutes)

Read [Stream theory](00-theory.md#stream-file--renditions--manifests--player) and complete [setup](setup.md). **Dashboard for upload/player; direct REST for captions and access.** All API calls target your recorded owned video.

## 1. Upload in the Dashboard (0–7 min)

Find **Stream → Videos** in your account, select its upload/Quick upload control and upload `samples/sample-video.mp4`. Give it a pair-prefixed name if available. Record the **video UID** and copy the actual iframe `src`/customer hostname from its embed details. This 20-second sample is synthetic; public UID-based access is the initial default.

API alternative — run this only if you did not already upload in the GUI:

```sh
curl --fail-with-body --silent --show-error "$CF_BASE/stream" \
  --header "Authorization: Bearer $CF_API_TOKEN" \
  --form 'file=@samples/sample-video.mp4'
```

Record `result.uid`. Set `CF_VIDEO_UID` to that value in your terminal or REST client.

## 2. Inspect readiness (7–12 min)

Wait for dashboard playback to become available, then listen to the clip. Inspect the actual read response:

```sh
curl --fail-with-body --silent --show-error "$CF_BASE/stream/$CF_VIDEO_UID" \
  --header "Authorization: Bearer $CF_API_TOKEN"
```

Check `result.readyToStream`, `result.status.state` and `result.status.pctComplete`. Playable is `readyToStream=true`; all-quality encoding can still be incomplete. Repeat the GET after a reasonable wait; do not upload duplicates if processing is slow. Preserve an error/blocked observation.

## 3. Attach and verify English captions (12–22 min)

If the current dashboard exposes caption upload, choose the owned video and upload `captions-en.vtt` as English. Otherwise send the documented PUT:

```sh
curl --fail-with-body --silent --show-error --request PUT \
  "$CF_BASE/stream/$CF_VIDEO_UID/captions/en" \
  --header "Authorization: Bearer $CF_API_TOKEN" \
  --form 'file=@samples/captions-en.vtt'

curl --fail-with-body --silent --show-error "$CF_BASE/stream/$CF_VIDEO_UID/captions" \
  --header "Authorization: Bearer $CF_API_TOKEN"
```

Confirm an `en` track with `status: ready` independently of video readiness. An existing English track on this video is replaced. Select English in the actual player and review all four cues against the speech, especially the first/final cue. A ready metadata response alone does not prove caption accuracy.

## 4. Embed, then require signed access (22–31 min)

Paste only the iframe `src` from your own video's dashboard embed into the **[live preview](https://mahidol-media-training.pongpisit.workers.dev/labs.html#live-preview)**. Load it, click Play and enable English captions. Do not paste raw HTML or API credentials.

After verifying the public sample preview, require signed playback with the native REST update:

```sh
curl --fail-with-body --silent --show-error --request POST \
  "$CF_BASE/stream/$CF_VIDEO_UID" \
  --header "Authorization: Bearer $CF_API_TOKEN" \
  --header 'Content-Type: application/json' \
  --data "{\"uid\":\"$CF_VIDEO_UID\",\"requireSignedURLs\":true}"
```

Confirm `success: true` and `result.requireSignedURLs: true`. A fresh UID-only player request should now be denied. If your dashboard exposes an equivalent signed-URL control, use it and verify the same property with GET.

## 5. Issue a short token and test fresh requests (31–38 min)

Set a Unix expiry 60 seconds ahead. The following Bash uses `date`, not Node:

```sh
EXPIRES_AT=$(( $(date +%s) + 60 ))
curl --fail-with-body --silent --show-error --request POST \
  "$CF_BASE/stream/$CF_VIDEO_UID/token" \
  --header "Authorization: Bearer $CF_API_TOKEN" \
  --header 'Content-Type: application/json' \
  --data "{\"exp\":$EXPIRES_AT}"
```

Inspect the token response **privately** and load `result.token` into `PLAYBACK_TOKEN`. Replace only the UID segment in the actual iframe URL with that limited token, retaining the real hostname and `/iframe`. Verify playback and captions immediately; clear the preview afterwards.

Set `STREAM_HOST` to the actual `customer-<code>.cloudflarestream.com` hostname, without protocol or path. Check fresh HLS GETs without caching/storing/proxying manifests:

```sh
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  "https://$STREAM_HOST/$CF_VIDEO_UID/manifest/video.m3u8"
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  "https://$STREAM_HOST/$PLAYBACK_TOKEN/manifest/video.m3u8"
sleep 65
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  "https://$STREAM_HOST/$PLAYBACK_TOKEN/manifest/video.m3u8"
```

Expected unsigned denial → signed success → expired denial on a new request. Buffered playback continuing is not an expiry test. If allowed origins are restricted, include `mahidol-media-training.pongpisit.workers.dev` for this preview. Terminal manifest tests may also need the approved origin as a `Referer` header; diagnose that gate separately rather than disabling policy. Signed access is not university authentication.

## 6. Record and delete the owned video (38–40 min)

Record UID, readiness/progress, English status, real caption/audio match and HTTP outcomes; never the token. Delete only that owned video through its dashboard action, then clear preview/terminal capabilities. Captions are removed with the video. API alternative:

```sh
curl --fail-with-body --silent --show-error --request DELETE \
  "$CF_BASE/stream/$CF_VIDEO_UID" --header "Authorization: Bearer $CF_API_TOKEN"
```

References: [upload](https://developers.cloudflare.com/stream/uploading-videos/upload-video-file/), [caption PUT/list](https://developers.cloudflare.com/stream/edit-videos/adding-captions/), [signed playback and origins](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/), [manifests](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/).
