# Lab 3 — store files and check a downloaded copy

**35 minutes · Browser only · No AWS CLI or commands**

Your task: put your lesson files in a private storage bucket, download the video, and check that its contents match the original. A **bucket** holds files; an **object key** is a file's exact name in that bucket.

You need `sample-document.txt`, `sample-video.mp4`, your copied **bucket and folder names**, and [worksheet](beginner-worksheet.md). The instructor arranges R2 activation and creation permission. You create a dedicated private **Standard** bucket; a restricted role follows an explicitly recorded instructor-created/shared fallback.

## 1. Create your private bucket — 5 minutes

**Do this**

1. In the approved account, open **R2 object storage → Overview** ([shortcut](https://dash.cloudflare.com/?to=/:account/r2/overview)). Select **Create bucket**.
2. Paste **Your lab tools → Lab names → Copy bucket name** into the name field. Legal names use **3–63 lowercase letters, numbers or hyphens**, with no leading/trailing hyphen. If the name exists, choose another unused legal name and record it.
3. Select the **location/jurisdiction approved by the instructor** and **Standard** as the default storage class. Do not choose Infrequent Access for this short-lived lab.
4. Select **Create bucket**. Open the new bucket and record its exact name, creator and whether it belongs to your group or is a shared fallback.
5. Open **Settings**. Confirm **Public Development URL / r2.dev** is disabled and no public custom domain is connected. Keep both routes off.
6. Return to **Objects**. Do not upload until the recorded bucket and privacy checks agree.

**You should see:** the new bucket with your exact recorded name, Standard storage and both public routes disabled. An authorized Dashboard download can work while the bucket remains private.

**If it does not work:** ask the authorized instructor to create the named group bucket while you follow the settings, or use their explicitly shared private Standard fallback. Record **instructor created / shared fallback** and the actual bucket name. Do not enable public access, purchase R2 yourself or change a production bucket.

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

The instructor may show [R2 S3 credential creation](beginner-setup.md) and a temporary download link after the bucket exists. Record who performed it, or **not performed**; keep keys and signed links out of the worksheet. The main task requires no API key, CLI installation or multipart procedure.

## 5. Clean up — 5 minutes

1. In **Objects → your lab folder**, select only your two recorded files → **Delete → Confirm**.
2. Return to the bucket root. If you created a folder marker, delete only your own empty marker.
3. Refresh the list to check your files/marker are gone. **Only if you created the dedicated bucket and it is completely empty**, open **Settings → Delete Bucket → Delete** and confirm the exact recorded name. A restricted role asks the creator/instructor to remove their group bucket.
4. Leave a **shared fallback bucket** and other groups' files intact. Never use **Empty Bucket** on shared storage; it deletes every object. Record bucket deletion or instructor/shared ownership in the worksheet.
5. Click **Clear file selections** in the lab tools. Keep the original samples and non-secret worksheet.

**Explain in one sentence:** “I downloaded my stored file and checked that its contents match the original.”

Official references: [Dashboard bucket creation](https://developers.cloudflare.com/r2/get-started/workers-api/#1-create-a-bucket), [bucket naming](https://developers.cloudflare.com/r2/buckets/create-buckets/), [storage classes](https://developers.cloudflare.com/r2/buckets/storage-classes/), [Dashboard upload](https://developers.cloudflare.com/r2/objects/upload-objects/), [Dashboard download](https://developers.cloudflare.com/r2/objects/download-objects/), [delete an empty bucket](https://developers.cloudflare.com/r2/buckets/delete-buckets/#delete-a-bucket). [Instructor/API reference](03-r2.md).

**Finish:** show [your completed worksheet](beginner-worksheet.md) to the instructor.
