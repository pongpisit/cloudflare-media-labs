# Lab 1 — make a card image and a full image

**35 minutes · Browser only · No commands**

Your task: use one campus picture in two places on a course page. The small course card fills a wide box; the detail view keeps the whole picture.

Read [Before you start](beginner-start.md). You need the downloaded `sample-image.jpg` and your two copied variant names. A **variant** is a saved rule for the image's size and crop.

## 1. Create two views before uploading — 9 minutes

**Do this**

1. Select the approved account, then open **Images → Hosted Images** ([shortcut](https://dash.cloudflare.com/?to=/:account/images/hosted)). Open **Delivery → Create variant**.
2. Copy your **card variant name** from the lab kit and paste it into the name field. Select **Create**. If the name exists, choose a different unused name and keep using that name; do not edit the existing definition.
3. Enter the card settings below. Apply the editor's save/update action, then reopen the settings to check the actual saved values.
4. Repeat **Delivery → Create variant → name → Create** using your **detail variant name** and the detail settings.
5. Record who created the variants and confirm both saved definitions **before uploading**. Creation uses account-wide settings; no image is required yet.

| Setting | Card | Detail |
|---|---|---|
| Width | `320` | `1280` |
| Height | `180` | `720` |
| Fit | **Cover** | **Scale down** |
| Metadata | **Strip all metadata** | **Strip all metadata** |
| Always allow public access | **Off** | **Off** |

**You should see:** two saved variants with your exact names. These rules are account-wide. If a name already exists, use a new name rather than changing it.

**If it does not work:** ask the instructor to create the variants or supply existing workshop variants. Do not delete instructor-supplied variants later.

## 2. Upload your picture — 8 minutes

**Do this**

1. Stay in the approved account. Return to **Hosted Images** after confirming the two variants.
2. Choose **Quick Upload** or the upload button, then **Upload from computer** if offered.
3. In the file picker, choose **Downloads → sample-image.jpg → Open**. Confirm the upload if asked.
4. Open the new campus-picture record. Find its **Image ID**, which is different from your Account ID or delivery hash. Keep this image record open for the remaining steps. Copy one actual public delivery URL privately for step 3.

**You should see:** the orange campus picture and its own Image ID. Keep the original file in Downloads.

**If it does not work:** missing product/upload access is an instructor setup issue. Do not activate another plan or keep uploading duplicate copies.

## 3. Open and check the real images — 12 minutes

**Do this**

1. Open your Images lab kit page (`START-HERE.html` from [the kit](https://github.com/pongpisit/cloudflare-media-labs/releases)) → **Show your actual card and detail images**.
2. Paste the actual public `imagedelivery.net` URL from your image record. Paste your card and detail variant names into the matching fields. Click **Load real images**.
3. Check the two pictures that load, then use **Open actual card image** and **Open actual detail image**. The tool only changes the last name in the URL; you must already have saved the variants in Cloudflare.
4. Compare the pictures. Which top/bottom edge markers disappear from the card? Does the detail view retain the whole source?
5. Right-click the card image → **Save image as**. Save it as `card-result` in Downloads. Do the same for the detail as `detail-result`. Keep the extension offered by the browser; delivery format can differ from the original JPEG.
6. On the same page, under **Read image dimensions**, choose the downloaded card file, then click **Read dimensions**. Read the result, then repeat with the downloaded detail file.

**You should see:**

| Result | Expected pixels | Why |
|---|---|---|
| Card | **320 × 180** | Cover fills a wide box and removes edges |
| Detail | **960 × 720** | The 4:3 source fits inside 1280 × 720 without being stretched |

The local tool reads the actual downloaded image. It does not simulate a Cloudflare result or upload your file anywhere. You do not need Developer Tools.

**If it does not work:** check the copied URL and exact variant names. A denied private image needs instructor-issued signed access; do not turn on a public override. Wrong dimensions usually mean the wrong variant or fit setting. If the file is not an image, save the actual image rather than an error page.

## 4. Show your result and clean up — 6 minutes

1. Show both images and the dimension results to your partner. Compare the result with the expected dimensions above.
2. Return to **Hosted Images → your campus-picture record → Delete**. Confirm that the Image ID belongs to the image you uploaded before deleting it.
3. In **Delivery**, delete only the two variants you personally created for this lab. Leave instructor-supplied or pre-existing variants alone.
4. Refresh the lists to check removal. Keep the original sample.

**Explain in one sentence:** “Cover crops to fill the card; Scale down keeps the whole picture.”

### Optional instructor demonstration

The instructor can show private image access: unsigned denied, signed allowed, then an expired link denied on a fresh request. Record this as **instructor demonstration**. It is not required to finish your browser task.

Official references: [Upload methods](https://developers.cloudflare.com/images/storage/upload-images/methods/), [variants and fit](https://developers.cloudflare.com/images/optimization/hosted-images/create-variants/).

**Next:** [Lab 2 — Stream](beginner-stream.md).
