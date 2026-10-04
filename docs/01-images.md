# Lab 1 — one original, two intentional views (35 minutes)

> **Beginner? [Use the short browser-only Images guide](beginner-images.md).** This page is the retained instructor/API reference.

Read [Images theory](00-theory.md#images-transformations-are-a-publishing-contract) and complete [setup](setup.md). **Primary route: Cloudflare Dashboard.**

**Choose a route:** follow steps 1–4 for browser work, or use [Windows PowerShell/API](#windows-powershellapi-option) after [Windows setup](windows.md). Bash commands are under [Direct API alternative](#direct-api-alternative). Expected result: one original, thumb **320×180**, detail **960×720**, recorded crop observation and owned-resource cleanup.

## 1. Predict and upload (0–10 min)

1. Open `samples/sample-image.jpg`: 1600×1200, aspect ratio 4:3. Predict which edges a 16:9 cover crop removes.
2. In [Cloudflare Dashboard](https://dash.cloudflare.com/) select the workshop **account** → product search → **Images → Hosted Images**. Shortcut: [Hosted Images](https://dash.cloudflare.com/?to=/:account/images/hosted).
3. Open the image library → **Quick Upload**/upload control → choose **Upload from computer** if offered.
4. In the Windows file picker, navigate to the extracted repository → `samples` → select `sample-image.jpg` → **Open**, then confirm upload if prompted.
5. Wait for the image record/thumbnail, open it, and record the actual **Image ID** and delivery URL. The initial synthetic sample is public. Keep the original locally; the delivery hash is not your Account ID.

## 2. Create owned variants (10–17 min)

1. Stay in **Hosted Images** → **Delivery** tab → **Create variant**.
2. Enter `<pair-prefix>-thumb` → **Create**. In its configuration, set **Width 320**, **Height 180**, **Fit Cover**, **Metadata Strip all metadata**.
3. Leave **Always allow public access** **off** → save/apply if offered. Reopen/read the configuration to confirm the saved values.
4. Return to **Delivery → Create variant** and repeat for `<pair-prefix>-detail`: **Width 1280**, **Height 720**, **Fit Scale down**, **Strip all metadata**, public override **off**.
5. Record both exact names. These settings are account-wide; if a name exists, choose a new one rather than editing it. If your role cannot create variants, an authorized instructor performs this step and you verify the saved configuration.

## 3. Inspect actual delivery (17–27 min)

Open the owned image's delivery link for each variant. Use the actual delivery hash and image ID:

```text
https://imagedelivery.net/<delivery-hash>/<image-id>/<variant-name>
```

The hash is **not** the account ID. Measure intrinsic dimensions using browser image information or DevTools: select the delivered image element and inspect `naturalWidth`/`naturalHeight`. Expected **thumb 320×180**, **detail 960×720**. Compare edge markers and verify both URLs use the same source image ID. CSS display dimensions are not the delivered image dimensions.

Windows Edge/Chrome inspection:

1. Open the delivery URL in a new tab. Replace only its final variant segment with your exact thumb/detail name.
2. Press **F12** or **Ctrl+Shift+I** → **Elements** → select the displayed `<img>` element.
3. In **Console**, type the read-only expression `$0.naturalWidth` and then `$0.naturalHeight` yourself. No credentials or pasted application code are needed.
4. In **Network**, reload the tab → select the image request → **Headers**. Record status and actual `Content-Type` (auto negotiation can return WebP/AVIF rather than JPEG); observe transferred size.
5. Compare the source's edge markers with the thumb. Explain why scale-down inside a 1280×720 box produces 960×720 for a 4:3 source.

## 4. Explain and clean up (27–35 min)

Record fit, output dimensions and one crop observation. Delete only your uploaded image from the library. In **Delivery**, remove only your two newly created variants after they are no longer needed. Never remove shared/pre-existing definitions.

Click path: **Hosted Images → image library → your image → Delete** (or its **…** action) → confirm the recorded ID. Then **Delivery → your exact variant → Delete** → confirm each owned name. Refresh the lists to verify removal.

If time permits, perform the optional private demonstration below before cleanup. Otherwise mark access checks unperformed; the core crop/dimension result is still real.

## Windows PowerShell/API option

Complete [Windows setup and paste the REST helper](windows.md#4-paste-this-rest-helper-once). Use this instead of repeating GUI creation. The helper returns a parsed object and checks HTTP/API success. Commands target your chosen account; run one operation at a time.

### A. Create the two owned variants

```powershell
$thumbName = "$env:PAIR_PREFIX-thumb"
$detailName = "$env:PAIR_PREFIX-detail"
$thumb = Invoke-CfApi -Method POST -Path '/images/v1/variants' -Body @{
    id = $thumbName
    options = @{ width = 320; height = 180; fit = 'cover'; metadata = 'none' }
    neverRequireSignedURLs = $false
}
$detail = Invoke-CfApi -Method POST -Path '/images/v1/variants' -Body @{
    id = $detailName
    options = @{ width = 1280; height = 720; fit = 'scale-down'; metadata = 'none' }
    neverRequireSignedURLs = $false
}
$thumb.result.variant
$detail.result.variant
```

If variants already exist from the GUI, skip these POSTs and set `$thumbName`/`$detailName` to their recorded names. Do not create them twice.

### B. Upload the image and inspect the delivery

```powershell
$image = Invoke-CfApi -Method POST -Path '/images/v1' -FilePath '.\samples\sample-image.jpg'
$env:CF_IMAGE_ID = [string]$image.result.id
$image.result | Select-Object id, filename, requireSignedURLs
$image.result.variants
```

Record the returned ID. Copy a real delivery URL and replace its final segment with your named variant; perform the same browser dimension/crop/header checks from step 3. If the GUI already uploaded the image, skip upload and set `$env:CF_IMAGE_ID` to that recorded generated ID.

### C. Optional: private image and native PowerShell HMAC

Before cleanup, update only the recorded image; do not use custom image-ID paths for this private exercise. **Always allow public access** must be off for the variant.

```powershell
$privateImage = Invoke-CfApi -Method PATCH -Path "/images/v1/$env:CF_IMAGE_ID" -Body @{ requireSignedURLs = $true }
$env:CF_IMAGE_ID = [string]$privateImage.result.id
$privateImage.result | Select-Object id, requireSignedURLs
$privateImage.result.variants
```

Use the **current returned** ID/links, since an access update can change them. An authorized operator opens **Hosted Images → Keys**, selects the appropriate existing workshop Images signing key and privately enters it below. This is separate from the management API token. No Python is required.

```powershell
$env:CF_IMAGES_SIGNING_KEY = Read-LabSecret 'Images signing key (not the API token)'
$imageDeliveryUrl = Read-Host 'Current imagedelivery.net URL using your non-public detail variant'
$imageUri = [Uri]$imageDeliveryUrl
if ($imageUri.Scheme -ne 'https' -or $imageUri.Host -ne 'imagedelivery.net' -or $imageUri.Query -or $imageUri.Fragment) {
    throw 'Use the current HTTPS imagedelivery.net URL with no query or fragment.'
}
$expiresAt = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds() + 60
$signingInput = "$($imageUri.AbsolutePath)?exp=$expiresAt"
$hmac = [Security.Cryptography.HMACSHA256]::new([Text.Encoding]::UTF8.GetBytes($env:CF_IMAGES_SIGNING_KEY))
try {
    $signature = [BitConverter]::ToString($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($signingInput))).Replace('-', '').ToLowerInvariant()
} finally { $hmac.Dispose() }
$signedImageUrl = "$($imageUri.GetLeftPart([UriPartial]::Path))?exp=$expiresAt&sig=$signature"

curl.exe --silent --show-error --output NUL --write-out '%{http_code}\n' $imageDeliveryUrl
curl.exe --silent --show-error --output NUL --write-out '%{http_code}\n' $signedImageUrl
Start-Sleep -Seconds 65
curl.exe --silent --show-error --output NUL --write-out '%{http_code}\n' $signedImageUrl
```

Expect unsigned denial → signed 2xx → expired denial on a fresh request. If `curl.exe` reports a network failure/000, resolve that before interpreting policy. A public variant override can bypass the image's private requirement. Record statuses only; do not print/store `$signedImageUrl` as evidence.

### D. Cleanup with Dashboard or API

Use the earlier Dashboard cleanup, or delete only the recorded image and variants that you created. Do this after both delivery tests finish:

```powershell
$deletedImage = Invoke-CfApi -Method DELETE -Path "/images/v1/$env:CF_IMAGE_ID"
$deletedThumb = Invoke-CfApi -Method DELETE -Path "/images/v1/variants/$thumbName"
$deletedDetail = Invoke-CfApi -Method DELETE -Path "/images/v1/variants/$detailName"
$deletedImage.success
$deletedThumb.success
$deletedDetail.success
```

If the instructor supplied shared variants, do **not** run their DELETE calls. Refresh the Dashboard and record cleanup. Clear the signing key and session using [Windows cleanup](windows.md#finish-and-clear-this-session).

## Direct API alternative

Use [setup's terminal variables](setup.md#3-prepare-direct-rest-calls). Create variants once, inspect each successful response and record names. Do not repeat these POSTs if the GUI already created them.

```sh
curl --fail-with-body --silent --show-error "$CF_BASE/images/v1/variants" \
  --header "Authorization: Bearer $CF_API_TOKEN" \
  --header 'Content-Type: application/json' \
  --data "{\"id\":\"$PAIR_PREFIX-thumb\",\"options\":{\"width\":320,\"height\":180,\"fit\":\"cover\",\"metadata\":\"none\"},\"neverRequireSignedURLs\":false}"

curl --fail-with-body --silent --show-error "$CF_BASE/images/v1/variants" \
  --header "Authorization: Bearer $CF_API_TOKEN" \
  --header 'Content-Type: application/json' \
  --data "{\"id\":\"$PAIR_PREFIX-detail\",\"options\":{\"width\":1280,\"height\":720,\"fit\":\"scale-down\",\"metadata\":\"none\"},\"neverRequireSignedURLs\":false}"

curl --fail-with-body --silent --show-error "$CF_BASE/images/v1" \
  --header "Authorization: Bearer $CF_API_TOKEN" \
  --form 'file=@samples/sample-image.jpg'
```

Record `result.id` and the real delivery links in `result.variants`; use your named variant in the last path segment. GUI cleanup remains valid for API-created resources.

## Optional private delivery — API plus local HMAC

Load `CF_IMAGE_ID` with your recorded ID. Update only that owned image:

```sh
curl --fail-with-body --silent --show-error --request PATCH \
  "$CF_BASE/images/v1/$CF_IMAGE_ID" \
  --header "Authorization: Bearer $CF_API_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{"requireSignedURLs":true}'
```

Record the **returned** ID and current delivery links; an access update can change them. Privately load an Images signing key from **Hosted Images → Keys** into `CF_IMAGES_SIGNING_KEY`, and the current non-public detail URL into `IMAGES_DELIVERY_URL`. A management API token is not this HMAC key. Generate a 60-second link with Python 3 standard library (no packages):

```sh
python3 - <<'PY'
import hashlib, hmac, os, time
from urllib.parse import urlsplit, urlunsplit, urlencode
u = urlsplit(os.environ['IMAGES_DELIVERY_URL'])
assert u.scheme == 'https' and u.netloc == 'imagedelivery.net' and not u.query
query = urlencode({'exp': int(time.time()) + 60})
sig = hmac.new(os.environ['CF_IMAGES_SIGNING_KEY'].encode(),
               (u.path + '?' + query).encode(), hashlib.sha256).hexdigest()
print(urlunsplit((u.scheme, u.netloc, u.path, query + '&sig=' + sig, '')))
PY
```

Load the returned limited URL privately into `SIGNED_IMAGE_URL`. Check fresh requests; keep only HTTP status evidence:

```sh
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' "$IMAGES_DELIVERY_URL"
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' "$SIGNED_IMAGE_URL"
sleep 65
curl --silent --show-error --output /dev/null --write-out '%{http_code}\n' "$SIGNED_IMAGE_URL"
```

Expected unsigned denial → valid signed success → expired denial. If unsigned succeeds, inspect the variant's public override. Do not save the full signed URL or delete an account signing key during lab cleanup.

## Recovery and sources

HTTP 401/403: check account grant and Paid storage. Delivery 404: check current ID, actual hash and variant spelling. Wrong size: check intrinsic dimensions and fit; scale-down is expected to yield 960×720.

References: [Dashboard variants/fit](https://developers.cloudflare.com/images/optimization/hosted-images/create-variants/), [upload API](https://developers.cloudflare.com/api/resources/images/subresources/v1/methods/create/), [private HMAC](https://developers.cloudflare.com/images/optimization/hosted-images/serve-private-images/).
