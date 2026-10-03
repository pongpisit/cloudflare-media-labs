# Lab 1 — one original, two intentional views

Read [Images theory](00-theory.md#images-transformations-are-a-publishing-contract) and complete [setup](setup.md). Hosted Images Paid and account-wide variant-write permission are required.

## 1. Predict the crop

Open `samples/sample-image.jpg`: 1600×1200 (4:3). Predict what a 320×180 (16:9) cover will remove and how a 1280×720 scale-down bounding box will behave.

## 2. Create your own named variants

```sh
npm run images -- setup
```

Creates only `<random-run-prefix>-thumb` (320×180 Cover) and `-detail` (1280×720 Scale down), with metadata stripped and `neverRequireSignedURLs=false`. Names/settings are recorded in `.lab/state.json`. Existing unrelated variants are neither reused nor edited.

In **Hosted Images → Delivery**, inspect these two actual variant definitions. They are account-wide, so use the script's printed names rather than editing `public`.

## 3. Upload the JPEG

```sh
npm run images -- upload
```

This sends a real multipart form POST to `/accounts/<account>/images/v1`. It records the returned image ID and builds variant links using the actual **delivery hash** returned by Images. The initial sample image is public; it contains only synthetic workshop media.

## 4. Measure actual output

```sh
npm run images -- verify
```

The command fetches and decodes real delivered images with Sharp. Expected: **thumb 320×180; detail 960×720**. Open the printed URLs and inspect crop markers. Both delivery URLs reference the same image ID. A browser CSS box is not the intrinsic image dimension.

## 5. Optional: private delivery and expiry

Set `CF_IMAGES_SIGNING_KEY` from Hosted Images → Keys before these commands:

```sh
npm run images -- private
npm run images -- verify
npm run images -- verify-access --expires 5
npm run images -- sign --expires 60
```

`private` PATCHes only your recorded image and records its current returned ID/delivery links. `verify` fetches signed variants and measures them again. `verify-access` makes unsigned, valid-HMAC and freshly expired GETs and prints only HTTP status evidence. Expected: unsigned denied, signed succeeds, expired denied. `sign` prints a short-lived detail link for manual viewing; do not store it in Git or the worksheet.

If unsigned delivery succeeds, inspect the variant's **Always allow public access** setting. If signing fails, check the exact path/query, key and system clock. This is HMAC access control, not a university login.

## 6. Explain and clean up

Record the ID, variant names, actual dimensions, crop observation and response statuses. Then:

```sh
npm run images -- cleanup
```

Deletes only your recorded image and the two created variants. No account signing key is removed.

## Recovery

- HTTP 401/403: check account-scoped Images write permission and Paid storage activation.
- Capacity/collision: inspect account-wide variants. Never fix a collision by editing another team's definition.
- Delivery 404: verify ID, delivery hash and variant spelling in the actual dashboard.
- The script records successful creations after each response. If interrupted before an ID is saved, find the sample by its workshop metadata and inspect/remove only that owned resource manually.

References: [variant API/options](https://developers.cloudflare.com/images/optimization/hosted-images/create-variants/), [image upload API](https://developers.cloudflare.com/api/resources/images/subresources/v1/methods/create/), [private HMAC delivery](https://developers.cloudflare.com/images/optimization/hosted-images/serve-private-images/).
