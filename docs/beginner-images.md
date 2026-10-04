# Lab 1 — make a card image and a full image

**35 minutes · Browser only · No commands**

Your task: use one campus picture in two places on a course page. The small course card fills a wide box; the detail view keeps the whole picture.

Have [the start guide](beginner-start.md) and [worksheet](beginner-worksheet.md) ready. You need the downloaded `sample-image.jpg` and your two copied variant names. A **variant** is a saved rule for the image's size and crop.

## 1. Upload your picture — 8 minutes

**Do this**

1. In Cloudflare Dashboard, select the instructor's account.
2. Search for **Images**, then open **Hosted Images**. [Open Hosted Images](https://dash.cloudflare.com/?to=/:account/images/hosted).
3. Choose **Quick Upload** or the upload button, then **Upload from computer** if offered.
4. In the file picker, choose **Downloads → sample-image.jpg → Open**. Confirm the upload if asked.
5. Open the new campus-picture record. Copy its **Image ID** into your worksheet. Copy one delivery URL privately for step 3.

**You should see:** the orange campus picture and its own Image ID. Keep the original file in Downloads.

**If it does not work:** missing product/upload access is an instructor setup issue. Do not activate another plan or keep uploading duplicate copies.

## 2. Create two views — 9 minutes

**Do this**

1. In Hosted Images, open **Delivery → Create variant**.
2. Copy your **card variant name** from the lab tools and paste it into the name/ID field. Create the variant.
3. Enter the card settings below. Save, then reopen the settings to check them.
4. Repeat **Create variant** with your **detail variant name** and the detail settings.

| Setting | Card | Detail |
|---|---|---|
| Width | `320` | `1280` |
| Height | `180` | `720` |
| Fit | **Cover** | **Scale down** |
| Metadata | **Strip all metadata** | **Strip all metadata** |
| Always allow public access | **Off** | **Off** |

**You should see:** two saved variants with your exact names. These rules are account-wide. If a name already exists, use a new name rather than changing it.

**If it does not work:** ask the instructor to create the variants or supply existing workshop variants. Record **instructor supplied** in your worksheet; do not delete supplied variants later.

## 3. Open and check the real images — 12 minutes

**Do this**

1. Open [Your lab tools](https://mahidol-media-training.pongpisit.workers.dev/labs.html#lab-helpers) → **Image links**.
2. Paste the actual public `imagedelivery.net` URL from your image record. Paste your card and detail variant names into the matching fields. Click **Build image links**.
3. Open **Card image**, then **Detail image** in their new tabs. The tool only changes the last name in the URL; you must already have saved the variants in Cloudflare.
4. Compare the pictures. Which top/bottom edge markers disappear from the card? Does the detail view retain the whole source?
5. Right-click the card image → **Save image as**. Save it as `card-result` in Downloads. Do the same for the detail as `detail-result`. Keep the extension offered by the browser; delivery format can differ from the original JPEG.
6. In **Your lab tools → Image dimensions**, choose the downloaded card file, then click **Read dimensions**. Record the result. Repeat with the downloaded detail file.

**You should see:**

| Result | Expected pixels | Why |
|---|---|---|
| Card | **320 × 180** | Cover fills a wide box and removes edges |
| Detail | **960 × 720** | The 4:3 source fits inside 1280 × 720 without being stretched |

The local tool reads the actual downloaded image. It does not simulate a Cloudflare result or upload your file anywhere. You do not need Developer Tools.

**If it does not work:** check the copied URL and exact variant names. A denied private image needs instructor-issued signed access; do not turn on a public override. Wrong dimensions usually mean the wrong variant or fit setting. If the file is not an image, save the actual image rather than an error page.

## 4. Show your result and clean up — 6 minutes

1. Show both images and the dimension results to your partner. Complete the three Images lines in the worksheet.
2. Return to **Hosted Images → your campus-picture record → Delete**. Check the recorded Image ID before confirming.
3. In **Delivery**, delete only the two variants you personally created for this lab. Leave instructor-supplied or pre-existing variants alone.
4. Refresh the lists to check removal. Keep your original and non-secret worksheet.

**Explain in one sentence:** “Cover crops to fill the card; Scale down keeps the whole picture.”

### Optional instructor demonstration

The instructor can show private image access: unsigned denied, signed allowed, then an expired link denied on a fresh request. Record this as **instructor demonstration**. It is not required to finish your browser task. [Instructor/reference Images guide](01-images.md#c-optional-private-image-and-native-powershell-hmac).

Official references: [Upload methods](https://developers.cloudflare.com/images/storage/upload-images/methods/), [variants and fit](https://developers.cloudflare.com/images/optimization/hosted-images/create-variants/).

**Next:** [Lab 2 — Stream](beginner-stream.md).
