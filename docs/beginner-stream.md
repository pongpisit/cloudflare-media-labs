# Lab 2 — publish a short lesson with captions

**40 minutes · Browser first · Instructor handles API-only controls**

Your task: publish the 20-second studio clip, play it, and review its English captions. Uploading a video is not the same as having a playable video.

You need `sample-video.mp4`, `captions-en.vtt`, your copied lab label and [worksheet](beginner-worksheet.md). **Captions** are timed text for speech and relevant sounds.

## 1. Upload once and wait — 10 minutes

**Do this**

1. In the instructor's Cloudflare account, search for **Stream → Videos**. [Open Videos](https://dash.cloudflare.com/?to=/:account/stream/videos).
2. Choose **Quick upload** or the upload button. Select **Downloads → sample-video.mp4 → Open**.
3. Open the new video record. If a title/name field is available, paste your lab label followed by `-lesson`.
4. Copy the **video ID/UID** into your worksheet. The title and ID are different.
5. Wait until the player is available. Press **Play** and listen to the clip. Do not upload another copy while it is processing.

**You should see:** the blue studio scene and hear a short English lesson. Being playable does not prove every quality level is finished processing.

**If it does not work:** wait and check the status again. Show an error to the instructor. Missing Stream access or capacity must be prepared by the instructor.

## 2. Add the caption file — 10 minutes

**Do this**

1. On your video, look for **Captions/Subtitles → Upload/Add captions** if that control is available.
2. Choose **English**, then **Downloads → captions-en.vtt → Open**. Confirm the upload and wait for the track to be ready.
3. If the caption upload control is absent or unavailable to your role, give the instructor your recorded video ID. The instructor attaches the file using the prepared API procedure. Mark **instructor attached captions** in your worksheet.
4. In your actual video player, open **CC/subtitles → English**. Play from the beginning to the end.

**You should see:** captions matching the speech. The first cue is “Welcome to this sample media publishing lesson.” The last is “Check readiness, captions, and access before sharing.”

**If it does not work:** a caption file may still be processing. Recheck it, reload the player, and select English. If text is incorrect, review the actual file with the instructor; a ready status is not an accuracy check. Uploading another English track replaces this video's existing English track.

## 3. Show how the clip is shared — 8 minutes

**Do this**

1. Ask your partner to replay the clip in the Dashboard and check the first and last captions. This is enough to complete the core playback check.
2. For an embed demonstration, open the video's **Player/Embed** details. If it gives a ready-to-open player link, open that link.
3. If it gives an iframe snippet instead, the instructor helps copy only the address between `src="` and the next `"`. Paste that address into the workshop [Live preview](https://mahidol-media-training.pongpisit.workers.dev/labs.html#live-preview). Click **Load preview → Play**, then enable **English** captions.

**You should see:** the same clip and captions in the player. Do not paste the entire HTML snippet or an API key into the preview. The instructor prepares allowed-origin settings if needed; do not turn off access policies to make an embed work.

**If it does not work:** keep the successful Dashboard playback result and record **embed not performed**. Ask the instructor to identify whether the problem is a wrong URL or an embed/access setting.

## 4. Watch a private-access demonstration — 7 minutes

The instructor uses an owned sample video and shows three fresh requests:

| Request | Expected observation |
|---|---|
| No signed access | Denied after private access is required |
| Valid short-lived link | Allowed |
| Same link after expiry, new request | Denied |

Watch and record the observed results as **instructor demonstration**, or **not performed** if skipped. You do not create a token or run commands. A player continuing with already-downloaded video after expiry is not evidence that the expired link still works. Your course application would decide who receives a link.

## 5. Show your result and clean up — 5 minutes

1. Complete the Stream worksheet: played with sound, caption review, and who attached captions.
2. Clear the workshop live preview if used.
3. Return to **Stream → Videos → your recorded video → Delete** or its **…** menu. Delete only your recorded video. Check its ID/title, confirm, then refresh the list.
4. Keep your original MP4 and caption file. Do not delete the instructor's demonstration video.

**Explain in one sentence:** “Stream prepares video for playback; I checked the player and reviewed the captions.”

Official references: [Stream getting started](https://developers.cloudflare.com/stream/get-started/), [captions](https://developers.cloudflare.com/stream/edit-videos/adding-captions/), [private playback](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/). [Instructor/API reference](02-stream.md#windows-powershellapi-option).

**Next:** [Lab 3 — R2](beginner-r2.md).
