# Setup — your own Cloudflare account

## 1. Activate the services

Select your intended account in the dashboard and copy its **Account ID** (32 hexadecimal characters).

- **Images:** hosted storage requires Images Paid. Our core lab uses Hosted Images, not only the Free remote-transformations allowance. Allow room for one JPEG and two new named variants (100 account-wide definitions maximum).
- **Stream:** activate sufficient stored-minute capacity for the 20-second clip. A completed transfer still needs encoding time.
- **R2:** activate R2; create a dedicated **Standard**, private bucket such as `media-lab-yourname`. Confirm both `r2.dev` and custom-domain public access are disabled. The scripts do not create buckets or change public access/CORS.

Use sample media only. Review current [Images pricing](https://developers.cloudflare.com/images/pricing/), [Stream pricing](https://developers.cloudflare.com/stream/pricing/) and [R2 pricing](https://developers.cloudflare.com/r2/pricing/). No-egress-charge R2 does not make storage/operations free.

## 2. Create Images/Stream REST credentials

In your user/account API-token controls, create a **custom, account-scoped token** for the selected account:

- Images **Edit/Write** (the API reference calls it `Images Write`). The lab creates/deletes variants and uploads/changes/deletes its image.
- Stream **Edit/Write**. The lab uploads, updates its own video, uploads captions, reads status, creates playback tokens and deletes its video.

Cloudflare dashboard labels may say **Edit**, while API permission names say **Write**. A read-only token cannot run the mutations. Use a bearer API token, not a Global API Key or email/key pair. If your organization requires separate product tokens, run one product at a time with its scoped token in `CF_API_TOKEN`.

Set `CF_ACCOUNT_ID`, `CF_API_TOKEN` and your own `LAB_PREFIX` in `.env`. The prefix must be 3–30 lowercase letters/digits/hyphens, starting with a letter. `media-yourname` is deliberately rejected until you replace it.

## 3. Create R2 S3 credentials

From **R2 object storage → Account Details → API Tokens**, create **Object Read & Write** credentials, scoped only to your dedicated bucket. Record the **Access Key ID** and **Secret Access Key** in `.env`. These are different from `CF_API_TOKEN`; bucket object credentials use the S3-compatible API.

Set `R2_BUCKET`. Keep `R2_JURISDICTION=default` for a default-jurisdiction bucket; set `eu`, `us` or `fedramp` only if the bucket was actually created in that jurisdiction. The endpoint must match. SDK region is `auto`; this does not relocate an existing bucket.

Run:

```sh
npm run doctor
npm run r2 -- preflight
```

`doctor` shows configuration readiness without printing secret values. `r2 preflight` makes a real, prefix-limited list request. Newly changed token permissions can take time to propagate; inspect the dashboard and retry the read before changing permissions.

## 4. Optional Images private-delivery extension

Open **Hosted Images → Keys**, copy an Images signing key into `CF_IMAGES_SIGNING_KEY`. The code uses HMAC-SHA256 over the delivery path/query. It never creates, revokes or rotates account signing keys. Leave this variable empty until you choose the optional private-image extension.

## 5. Inspect the supplied media

Open `samples/sample-image.jpg`. Play `samples/sample-video.mp4` with audio and read `samples/captions-en.vtt`; the four English cues match the 20-second synthetic narration. No university footage or personal data is included.

## Troubleshooting preflight

| Result | Next check |
|---|---|
| Missing environment / invalid prefix | Edit your local `.env`; restart the command |
| REST HTTP 401/403 | Correct token, account resource scope and product permission; do not expand to a Global API Key |
| Hosted Images unavailable | Images Paid storage activation; Free transformations are a different path |
| Stream storage unavailable | Stored-minute entitlement/capacity |
| R2 AccessDenied | Bucket-scoped S3 credentials and propagation; general bearer token is not the S3 credential |
| R2 endpoint mismatch | Bucket jurisdiction, not simply where the customer is located |
| Existing ledger belongs to another account | Clean up using the original `.env`; use a separate checkout for another account |

References: [Images pricing](https://developers.cloudflare.com/images/pricing/), [API token creation](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/), [Images upload API](https://developers.cloudflare.com/api/resources/images/subresources/v1/methods/create/), [R2 authentication](https://developers.cloudflare.com/r2/api/tokens/).
