# Lab 1 — one original, two intentional views (35 minutes)

Read [Images theory](00-theory.md#images-transformations-are-a-publishing-contract) and complete [setup](setup.md). **Primary route: Cloudflare Dashboard.**

## 1. Predict and upload (0–10 min)

1. Open `samples/sample-image.jpg`: 1600×1200, aspect ratio 4:3. Predict which edges a 16:9 cover crop removes.
2. In the account dashboard find **Images → Hosted Images** using product search. Open the hosted image library and use the upload/Quick Upload control to select the JPEG.
3. Open the uploaded record and record the actual image ID. The initial synthetic sample is public. Keep the original locally.

## 2. Create owned variants (10–17 min)

1. On **Hosted Images → Delivery**, select **Create variant**.
2. Create `<pair-prefix>-thumb`: width **320**, height **180**, fit **Cover**, **Strip all metadata**.
3. Create `<pair-prefix>-detail`: width **1280**, height **720**, fit **Scale down**, **Strip all metadata**.
4. Leave **Always allow public access** disabled, especially for the optional private test. These settings are account-wide; if the name exists, choose a new one. An authorized operator handles creation if your role lacks permission.

## 3. Inspect actual delivery (17–27 min)

Open the owned image's delivery link for each variant. Use the actual delivery hash and image ID:

```text
https://imagedelivery.net/<delivery-hash>/<image-id>/<variant-name>
```

The hash is **not** the account ID. Measure intrinsic dimensions using browser image information or DevTools: select the delivered image element and inspect `naturalWidth`/`naturalHeight`. Expected **thumb 320×180**, **detail 960×720**. Compare edge markers and verify both URLs use the same source image ID. CSS display dimensions are not the delivered image dimensions.

## 4. Explain and clean up (27–35 min)

Record fit, output dimensions and one crop observation. Delete only your uploaded image from the library. In **Delivery**, remove only your two newly created variants after they are no longer needed. Never remove shared/pre-existing definitions.

If time permits, perform the optional private demonstration below before cleanup. Otherwise mark access checks unperformed; the core crop/dimension result is still real.

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
