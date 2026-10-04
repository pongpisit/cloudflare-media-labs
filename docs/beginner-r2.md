# Lab 3 — store files and check a downloaded copy

**35 minutes · Browser only · No AWS CLI or commands**

Your task: put your lesson files in a private storage bucket, download the video, and check that its contents match the original. A **bucket** holds files; an **object key** is a file's exact name in that bucket.

You need `sample-document.txt`, `sample-video.mp4`, your lab label and [worksheet](beginner-worksheet.md). The instructor provides a dedicated **Standard** lab bucket.

## 1. Find the prepared private bucket — 5 minutes

**Do this**

1. In the instructor's Cloudflare account, search for **R2 object storage → Overview**. [Open R2](https://dash.cloudflare.com/?to=/:account/r2/overview).
2. Open the bucket named by the instructor. Copy its name into your worksheet.
3. Open **Settings**. Ask the instructor to confirm **Public Development URL / r2.dev** is disabled and no public custom domain is connected.
4. Return to **Objects**.

**You should see:** the prepared lab bucket with public routes disabled. An authorized Dashboard download can work while the bucket remains private.

**If it does not work:** ask the instructor for the correct bucket/access. Do not enable public access or change a production bucket.

## 2. Upload your files — 8 minutes

**Do this**

1. In **Objects**, choose **Create folder** if available. Paste your copied **lab folder name**, then open it.
2. Choose **Upload → Select from computer**. Select the downloaded `sample-document.txt` and `sample-video.mp4` with Ctrl-click, then **Open** and confirm the upload.
3. Wait for completion, close the upload panel and refresh the file list.
4. Record both exact object keys from the Dashboard. Their names include your folder label and filename.

**You should see:** the document and MP4 in your lab folder, with sizes shown. The folder is a useful naming group, not a separate login or permission boundary.

**If it does not work:** use the instructor's prepared personal prefix/folder if folder creation is unavailable. Do not overwrite another group's files.

## 3. Download and compare — 12 minutes

**Do this**

1. Select your stored MP4 → **… → Download**.
2. Find the new copy in **File Explorer → Downloads**. Rename it `video-from-r2.mp4` so it is easy to distinguish from the original `sample-video.mp4`. Keep the original intact.
3. Open [Your lab tools](https://mahidol-media-training.pongpisit.workers.dev/labs.html#lab-helpers) → **Compare original and downloaded file**.
4. For **Original file**, choose the original `sample-video.mp4` from the sample download.
5. For **Downloaded file**, choose the new `video-from-r2.mp4` from the actual R2 download.
6. Tick the confirmation that the second file came from R2. Click **Compare files**.

**You should see:** **MATCH — both files have identical size and SHA-256.** SHA-256 is a fingerprint of the contents. A match is meaningful only when the second file is the actual download, not the original selected twice.

The tool reads the two files locally in your browser. It does not upload them or connect to R2. It shows the result of your real download, not a simulated object-storage result.

**If it does not work:** a mismatch can mean the wrong download, incomplete download or changed file. Check the two selections, download your recorded object again, and rerun the comparison. Do not record a match until it actually matches.

## 4. Discuss one practical choice — 5 minutes

Show the uploaded MP4 and answer: “Is this now a Stream video?” **No.** R2 stores the file; it does not create Stream's adaptive-quality player, captions or video pipeline.

The instructor may show a temporary download link. Record it as **instructor demonstration**, not a link you created. Keep signed links out of the worksheet. The main task requires no API key, CLI installation or multipart procedure.

## 5. Clean up — 5 minutes

1. In **Objects → your lab folder**, select only your two recorded files → **Delete → Confirm**.
2. Return to the bucket root. If you created a folder marker, delete only your own empty marker.
3. Refresh the list to check your files are gone. Leave the instructor's bucket and other groups' files alone.
4. Click **Clear file selections** in the lab tools. Keep the original samples and non-secret worksheet.

**Explain in one sentence:** “I downloaded my stored file and checked that its contents match the original.”

Official references: [Dashboard upload](https://developers.cloudflare.com/r2/objects/upload-objects/), [Dashboard download](https://developers.cloudflare.com/r2/objects/download-objects/). [Instructor/API reference](03-r2.md).

**Finish:** show [your completed worksheet](beginner-worksheet.md) to the instructor.
