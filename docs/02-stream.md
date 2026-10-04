# Lab 2 — ready, captioned and protected playback (40 minutes)

> **Beginner? [Use the short Stream guide](beginner-stream.md).** This page is the retained instructor/API reference.

Read [Stream theory](00-theory.md#stream-file--renditions--manifests--player) and complete [setup](setup.md). **Dashboard for upload/player; direct REST for captions and access.** All API calls target your recorded owned video.

**Windows preferred:** follow the click paths below and use the complete [Windows PowerShell/API route](#windows-powershellapi-option) for terminal operations. The `sh` blocks are Bash alternatives. Expected result: an actual playable/captioned video, signed-access fresh-request tests, and owned-resource cleanup.

## 1. Upload in the Dashboard (0–7 min)

1. Dashboard → select the workshop **account** → product search **Stream → Videos**. Shortcut: [Stream Videos](https://dash.cloudflare.com/?to=/:account/stream/videos).
2. Select **Quick upload**/upload → choose a local file → extracted repository → `samples` → `sample-video.mp4` → **Open** → confirm if prompted.
3. Open the new video record. Set a pair-prefixed title if available; do not confuse the title with its **video UID**.
4. Record the UID and processing status. Open its embed/player details → copy the actual iframe `src` and `customer-<code>.cloudflarestream.com` hostname privately for later preview.
5. Wait for playback availability rather than uploading another copy. This 20-second synthetic sample starts with public UID-based access by default.

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

Dashboard → **Stream → Videos → your video → Captions/Subtitles** if present → **Upload/Add captions → English** → choose `samples/captions-en.vtt` → confirm → wait for track readiness. If that control is absent or your role cannot use it, use the documented PUT below or [Windows caption commands](#c-upload-and-check-english-captions):

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

Click path: **your video's player/embed details → iframe snippet → copy only the value inside `src="..."`**. Open the linked workshop **Lab guide → Live preview**, paste that URL → load → Play → player **CC/subtitles → English**. Check actual sound and all four cues. Under the video's **Settings**, use **Require Signed URLs** if exposed; verify the property with API GET. If allowed origins are configured, have the authorized operator include the preview hostname rather than turning origin policy off.

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

Dashboard cleanup path: **Stream → Videos → your recorded video → …/Delete** → verify UID/title → confirm → refresh Videos. If you made an optional clip, delete its separate UID too. Clear the workshop's live-preview input.

```sh
curl --fail-with-body --silent --show-error --request DELETE \
  "$CF_BASE/stream/$CF_VIDEO_UID" --header "Authorization: Bearer $CF_API_TOKEN"
```

## Windows PowerShell/API option

Complete [Windows setup and paste the REST helper](windows.md#4-paste-this-rest-helper-once). This is the full Windows route; do not mix Bash syntax into these blocks. Use the same account and owned UID throughout.

### A. Upload once or use the GUI's recorded UID

If you already uploaded in the Dashboard:

```powershell
$env:CF_VIDEO_UID = 'REPLACE_WITH_YOUR_RECORDED_VIDEO_UID'
```

Otherwise use native multipart upload for this small sample:

```powershell
$videoUpload = Invoke-CfApi -Method POST -Path '/stream' -FilePath '.\samples\sample-video.mp4'
$env:CF_VIDEO_UID = [string]$videoUpload.result.uid
$videoUpload.result | Select-Object uid, readyToStream, status
```

The sample is well under the basic-upload 200 MB threshold. Larger/unreliable transfers use tus; this lab does not install a tus client or demonstrate the TOR's ≥30 GB acceptance boundary.

### B. Check readiness

```powershell
$video = Invoke-CfApi -Path "/stream/$env:CF_VIDEO_UID"
$video.result | Select-Object uid, readyToStream, duration, requireSignedURLs
$video.result.status | Select-Object state, pctComplete, errorReasonCode, errorReasonText
```

If still processing, wait around 15 seconds and manually run this GET again. Stop on encoding errors. `readyToStream=true` permits playback; `pctComplete=100` establishes all-quality encoding. Listen in the actual Dashboard player before proceeding.

### C. Upload and check English captions

Skip the PUT if the GUI already attached the same English file. An `en` PUT replaces an existing English track on this owned video.

```powershell
$captionUpload = Invoke-CfApi -Method PUT -Path "/stream/$env:CF_VIDEO_UID/captions/en" -FilePath '.\samples\captions-en.vtt'
$captions = Invoke-CfApi -Path "/stream/$env:CF_VIDEO_UID/captions"
$captions.result | Select-Object language, label, status
```

Wait/recheck until `en` is ready. Player → **CC → English** → verify first and last cue and speech alignment. Caption readiness is separate from video readiness. AI caption generation is an optional prepared demonstration; do not assume Thai AI generation from the existence of a `th` language tag.

### D. Verify public embed, then require signed playback

Use the Dashboard's actual iframe source in the [live preview](https://mahidol-media-training.pongpisit.workers.dev/labs.html#live-preview) first. Then:

```powershell
$protectedVideo = Invoke-CfApi -Method POST -Path "/stream/$env:CF_VIDEO_UID" -Body @{
    uid = $env:CF_VIDEO_UID
    requireSignedURLs = $true
}
$protectedVideo.result | Select-Object uid, requireSignedURLs
```

Expect `requireSignedURLs=true`; a new UID-only request should be denied. University identity/authorization would be checked by your own application before issuing a capability.

### E. Issue a 60-second token and check fresh requests

Copy your actual embed URL **before** issuing the short token so prompt time does not consume its lifetime:

```powershell
$iframeUrl = Read-Host 'Actual HTTPS iframe src from your video Dashboard'
$iframeUri = [Uri]$iframeUrl
if ($iframeUri.Scheme -ne 'https' -or $iframeUri.Host -notmatch '^customer-[a-zA-Z0-9-]+\.cloudflarestream\.com$') {
    throw 'Use the actual customer hostname copied from the Dashboard.'
}
$streamHost = $iframeUri.Host
$expiresAt = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds() + 60
$tokenResponse = Invoke-CfApi -Method POST -Path "/stream/$env:CF_VIDEO_UID/token" -Body @{ exp = $expiresAt }
$playbackToken = [string]$tokenResponse.result.token
if (-not $playbackToken) { throw 'No playback token returned.' }

$statusArgs = @('--silent', '--show-error', '--output', 'NUL', '--write-out', '%{http_code}\n')
# For a restricted-origin video, use its already-approved preview origin.
# $statusArgs += @('--header', 'Referer: https://mahidol-media-training.pongpisit.workers.dev/')
curl.exe @statusArgs "https://$streamHost/$env:CF_VIDEO_UID/manifest/video.m3u8"
curl.exe @statusArgs "https://$streamHost/$playbackToken/manifest/video.m3u8"
Start-Sleep -Seconds 65
curl.exe @statusArgs "https://$streamHost/$playbackToken/manifest/video.m3u8"
```

Expect unsigned denial → valid 2xx → expired denial. A network error/000 is not access evidence. Record statuses only. Buffered playback continuing past expiry is expected; the new manifest GET is the expiry test.

For actual private player playback, issue a **fresh** token, copy the limited iframe URL privately to the Windows clipboard and paste it into the preview. This retains the actual hostname, path/query and `/iframe` from your Dashboard URL:

```powershell
$tokenResponse = Invoke-CfApi -Method POST -Path "/stream/$env:CF_VIDEO_UID/token" -Body @{
    exp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds() + 60
}
$playbackToken = [string]$tokenResponse.result.token
if (-not $playbackToken -or -not $iframeUri.AbsolutePath.Contains("/$env:CF_VIDEO_UID/")) {
    throw 'Token or original iframe UID path is missing.'
}
$signedIframe = [UriBuilder]::new($iframeUri)
$signedIframe.Path = $iframeUri.AbsolutePath.Replace("/$env:CF_VIDEO_UID/", "/$playbackToken/")
$signedIframeUrl = $signedIframe.Uri.AbsoluteUri
Set-Clipboard -Value $signedIframeUrl
```

Preview → paste → load → Play → English captions immediately. Then clear the preview, run `Set-Clipboard -Value ''`, and clear capability variables. Do not submit token responses/URLs as evidence.

### F. Optional owned-video export, clip and Analytics

Choose one within spare lab time or as follow-up; these are not extra mandatory steps.

Generate the encoded MP4 export, then manually recheck until ready. The result is not the exact uploaded original:

```powershell
$downloadRequest = Invoke-CfApi -Method POST -Path "/stream/$env:CF_VIDEO_UID/downloads"
$downloads = Invoke-CfApi -Path "/stream/$env:CF_VIDEO_UID/downloads"
$downloads.result.default | Select-Object status, percentComplete
```

For an optional audio-only M4A export, use the separate audio route:

```powershell
$audioRequest = Invoke-CfApi -Method POST -Path "/stream/$env:CF_VIDEO_UID/downloads/audio"
$downloads = Invoke-CfApi -Path "/stream/$env:CF_VIDEO_UID/downloads"
$downloads.result.audio | Select-Object status, percentComplete
```

Do not assume a UID-only download URL works for a protected video: follow [signed download instructions](https://developers.cloudflare.com/stream/viewing-videos/download-videos/) with a token that allows downloads. Retain the local source for R2 backup/fallback.

Create a private 10–15 second clip; record its **new UID** immediately, check readiness, and delete it separately. A scheduled deletion date is not inherited.

```powershell
$clip = Invoke-CfApi -Method POST -Path '/stream/clip' -Body @{
    clippedFromVideoUID = $env:CF_VIDEO_UID
    startTimeSeconds = 10
    endTimeSeconds = 15
    requireSignedURLs = $true
    meta = @{ name = "$env:PAIR_PREFIX-clip" }
}
$clipUid = [string]$clip.result.uid
$clip.result | Select-Object uid, readyToStream, requireSignedURLs
$clipStatus = Invoke-CfApi -Path "/stream/$clipUid"
$clipStatus.result | Select-Object uid, readyToStream, requireSignedURLs, scheduledDeletion
```

Analytics click path: **Stream → Analytics** (or the video's Analytics panel) → select permitted content/time range → observe viewing data after a real playback. Reports may lag and require permission; these are not verified student identity/completion. Live inputs/recording, watermark profiles and an authenticated webhook receiver are separate prepared demonstrations; do not replace the account's shared webhook during class.

### G. Cleanup only your recorded UIDs

```powershell
# Run only if you created and recorded a clip in this session.
# $deletedClip = Invoke-CfApi -Method DELETE -Path "/stream/$clipUid"
$deletedVideo = Invoke-CfApi -Method DELETE -Path "/stream/$env:CF_VIDEO_UID"
$deletedVideo.success
```

Or use Dashboard cleanup from step 6. Verify removal, clear the preview, then [clear Windows credentials/capabilities](windows.md#finish-and-clear-this-session).

### REST-client request matrix

Use `Authorization: Bearer <token>` privately on each management request. Prefix paths with your account's `CF_BASE`. File rows use **form-data → `file` → File**; JSON rows use **raw JSON**, with your actual values.

| Method | Path | Body | Observe |
|---|---|---|---|
| POST | `/stream` | File: `sample-video.mp4` | `result.uid` |
| GET | `/stream/<UID>` | None | readiness/progress/access |
| PUT | `/stream/<UID>/captions/en` | File: `captions-en.vtt` | API success |
| GET | `/stream/<UID>/captions` | None | independent `en` readiness |
| POST | `/stream/<UID>` | `{"uid":"<UID>","requireSignedURLs":true}` | signed requirement |
| POST | `/stream/<UID>/token` | `{"exp":<Unix timestamp 60 seconds ahead>}` | private `result.token` |
| DELETE | `/stream/<UID>` | None | owned-video cleanup |

Sources for extensions: [clipping](https://developers.cloudflare.com/stream/edit-videos/video-clipping/), [downloads](https://developers.cloudflare.com/stream/viewing-videos/download-videos/), [Analytics](https://developers.cloudflare.com/stream/getting-analytics/).

References: [upload](https://developers.cloudflare.com/stream/uploading-videos/upload-video-file/), [caption PUT/list](https://developers.cloudflare.com/stream/edit-videos/adding-captions/), [signed playback and origins](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/), [manifests](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/).
