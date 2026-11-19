# Lab 1 — make a card image and a full image

**35 minutes · Browser only · No commands**

Your task: use one campus picture in two places on a course page. The small course card fills a wide box; the detail view keeps the whole picture.

Read [Before you start](beginner-start.md). You need the downloaded `sample-image.jpg` and two unique variant names you choose. A **variant** is a saved rule for the image's size and crop.

## 1. Create two views before uploading — 9 minutes

**Do this**

1. Select the approved account, then open **Images → Hosted Images** ([shortcut](https://dash.cloudflare.com/?to=/:account/images/hosted)). Open **Delivery → Create variant**.
2. Enter your own unique **card variant name**, for example your lab label plus `-card`. Select **Create**. If the name exists, choose a different unused name and keep using that name; do not edit the existing definition.
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

## 3. Open and compare the delivered images — 12 minutes

**Do this**

1. In your image record in Dashboard, find the delivery links. Open the link for your saved **card** variant, then the link for your **detail** variant.
2. Compare the actual delivered images in your browser. Which top/bottom edge markers disappear from the card? Does the detail keep the whole source?
3. To keep a copy, right-click each image → **Save image as**. Use `card-result` and `detail-result`, keeping the extension offered by the browser.
4. Optional: in File Explorer, right-click a saved image → **Properties → Details**. If Windows supports that file format, read its width and height. Ask the instructor if dimensions are unavailable; no separate tool or file upload is needed.

**You should see:**

| Result | Expected pixels | Why |
|---|---|---|
| Card | **320 × 180** | Cover fills a wide box and removes edges |
| Detail | **960 × 720** | The 4:3 source fits inside 1280 × 720 without being stretched |

Use the image delivered by Cloudflare, not the original sample or an error page. Displayed size in the browser is not necessarily the file's pixel dimensions.

**If it does not work:** confirm the exact saved variant names and fit settings in Dashboard. A private image needs instructor-authorized access; do not turn on a public override. Do not paste only an account delivery prefix—the link must identify your image and variant.

## 4. Show your result and clean up — 6 minutes

1. Show both images and the dimension results to your partner. Point out the crop difference and compare any available dimensions with the expected values above.
2. Return to **Hosted Images → your campus-picture record → Delete**. Confirm that the Image ID belongs to the image you uploaded before deleting it.
3. In **Delivery**, delete only the two variants you personally created for this lab. Leave instructor-supplied or pre-existing variants alone.
4. Refresh the lists to check removal. Keep the original sample.

**Explain in one sentence:** “Cover crops to fill the card; Scale down keeps the whole picture.”

### Optional instructor demonstration

The instructor can show private image access: unsigned denied, signed allowed, then an expired link denied on a fresh request. Record this as **instructor demonstration**. It is not required to finish your browser task.

Official references: [Upload methods](https://developers.cloudflare.com/images/storage/upload-images/methods/), [variants and fit](https://developers.cloudflare.com/images/optimization/hosted-images/create-variants/).

**Next:** [Lab 2 — Stream](beginner-stream.md).
