# Setup — Dashboard first, direct API where needed

## 1. Prepare your Cloudflare account

Sign in at [dash.cloudflare.com](https://dash.cloudflare.com/), complete MFA and select the intended account. Record its **Account ID** (32 hexadecimal characters).

- **Images:** activate Paid hosted storage. Reserve one JPEG and two new named variants per pair; the account-wide maximum is 100 variants.
- **Stream:** activate stored-minute capacity for the actual 20-second sample and its playback usage.
- **R2:** activate R2 and create a dedicated **Standard**, private bucket. Keep public `r2.dev` and public custom-domain access disabled.

Having an account alone does not establish product activation, capacity or effective write permissions. If your role cannot edit variants or video access, the authorized instructor performs that step. Review current [Images](https://developers.cloudflare.com/images/pricing/), [Stream](https://developers.cloudflare.com/stream/pricing/) and [R2](https://developers.cloudflare.com/r2/pricing/) pricing.

## 2. Download samples and open a worksheet

Use the repository **Code → Download ZIP**, extract it and locate `samples/`; alternatively download each file from [samples](../samples/). No build or installation is needed. Open the JPEG; listen to the MP4 and review the matching WebVTT. Both are original synthetic media.

Choose a unique lowercase prefix such as `media-pair07-20261004`. Record it with every created resource in [worksheet.md](worksheet.md). Never reuse/edit another pair's variant/key. For API examples, open a Bash terminal in the extracted repository root so `samples/...` paths resolve.

## 3. Prepare direct REST calls

Use `curl` (with `--fail-with-body`) or a trusted REST client. Create an account-scoped custom token with **Images Edit/Write** and **Stream Edit/Write** as needed. API reference names can say Write while the dashboard says Edit. A read-only token cannot upload/change/delete resources.

Privately load the token into the trusted terminal from your password manager or a hidden prompt. In Bash:

```sh
read -r -s -p 'Cloudflare API token: ' CF_API_TOKEN; printf '\n'
export CF_API_TOKEN
export CF_ACCOUNT_ID='REPLACE_WITH_YOUR_ACCOUNT_ID'
export PAIR_PREFIX='REPLACE_WITH_YOUR_UNIQUE_PREFIX'
export CF_BASE="https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID"
```

Replace the two non-secret placeholders. Do not enable shell tracing or project credential-bearing responses. For JSON Cloudflare REST calls, check **HTTP success and `success: true` with no API errors**. Token creation responses contain bearer capabilities: inspect privately and do not save them as evidence. You can send these same requests from a trusted REST client using environment variables and multipart-file controls.

## 4. Optional R2 API extension

The GUI upload/download/checksum lab needs no S3 credentials. For temporary GET or multipart, an authorized operator creates **Object Read & Write** R2 credentials scoped only to the dedicated bucket. Load `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` privately; these are not the general REST bearer token.

Set `R2_BUCKET`, `R2_KEY` and `R2_ENDPOINT`. Default endpoint: `https://<account-id>.r2.cloudflarestorage.com`. Jurisdictional buckets use the matching `.eu`, `.us` or `.fedramp` account endpoint. Region `auto` does not choose jurisdiction. AWS CLI v2 is needed only for the optional presigned-link step; raw S3 requests need curl with `--aws-sigv4` (added in curl 7.75.0).

## 5. Cleanup preparation

Keep an ownership checklist rather than relying on automated cleanup. After the labs delete only recorded images/videos/variant definitions/object keys/folder markers. Remove the dedicated empty bucket and revoke workshop credentials when no longer needed. Clear preview URLs and terminal secrets.

References: [API tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/), [Images variants](https://developers.cloudflare.com/images/optimization/hosted-images/create-variants/), [R2 credentials/jurisdiction](https://developers.cloudflare.com/r2/api/tokens/).
