# Setup — Dashboard first, direct API where needed

**Windows participants:** follow [Windows quick start](windows.md) for ZIP extraction, PowerShell, hidden token entry and the REST helper. All three labs include native Windows sections. The Bash blocks below are the macOS/Linux/WSL alternative.

**Browser-first publishers:** use [Beginner start](beginner-start.md), [first-time account/API creation](beginner-setup.md) and the numbered product labs. This page is an authorized technical-operator reference; its terminal setup is not a beginner prerequisite.

## 1. Prepare your Cloudflare account

Sign in at [dash.cloudflare.com](https://dash.cloudflare.com/), complete MFA and select the intended account. Record its **Account ID** (32 hexadecimal characters).

1. Use the account selector to choose the intended account before opening a product.
   Open **Search (Ctrl/Command+K) → Copy account ID** to copy the selected account's32-hex-character ID; do not use the Zone ID.
2. Use the Dashboard product search if the left navigation is collapsed or renamed.
3. Open [Hosted Images](https://dash.cloudflare.com/?to=/:account/images/hosted), [Stream Videos](https://dash.cloudflare.com/?to=/:account/stream/videos), or [R2 Overview](https://dash.cloudflare.com/?to=/:account/r2/overview). These shortcuts may prompt for the account; check its name again.
4. If asked to subscribe/activate a billable product, the authorized account owner/instructor handles it before class.
5. Confirm you can perform the lab's specific actions, not just view the product. Token permission cannot elevate your underlying account access.

- **Images:** activate Paid hosted storage. Reserve one JPEG and two new named variants per pair; the account-wide maximum is 100 variants.
- **Stream:** activate stored-minute capacity for the actual 20-second sample and its playback usage.
- **R2:** arrange activation; [Lab 3 teaches Dashboard bucket creation](beginner-r2.md) before upload. Use a dedicated **Standard**, private group bucket. Keep public `r2.dev` and public custom-domain access disabled. A prepared shared bucket is an explicit role-restricted fallback.

Having an account alone does not establish product activation, capacity or effective write permissions. If your role cannot edit variants or video access, the authorized instructor performs that step. Review current [Images](https://developers.cloudflare.com/images/pricing/), [Stream](https://developers.cloudflare.com/stream/pricing/) and [R2](https://developers.cloudflare.com/r2/pricing/) pricing.

## 2. Download samples and open a worksheet

Use the repository **Code → Download ZIP**, extract it and locate `samples/`; alternatively download each file from [samples](../samples/). No build or installation is needed. Open the JPEG; listen to the MP4 and review the matching WebVTT. Both are original synthetic media.

Choose a unique lowercase prefix such as `media-pair07-20261004`. Record it with every created resource in [worksheet.md](worksheet.md). Never reuse/edit another pair's variant/key. For Windows, open PowerShell in the extracted root as shown in [Windows setup](windows.md#2-download-and-find-the-samples); for Bash, open a terminal there so `samples/...` paths resolve.

## 3. Prepare direct REST calls

Use the [Windows PowerShell REST helper](windows.md#4-paste-this-rest-helper-once), Bash `curl`, or a trusted REST client. Create an account-scoped custom token with **Images Edit/Write** and **Stream Edit/Write** as needed; [Windows setup has the exact token click path](windows.md#3-select-the-account-and-create-a-rest-token). API reference names can say Write while the dashboard says Edit. A read-only token cannot upload/change/delete resources.

[First-time setup](beginner-setup.md) gives the graphical name → permission → specific account → TTL → summary → once-shown secret → intended read-only check sequence. Prefer separate product tokens where practical and revoke owned workshop tokens after use. Durable account tokens require the appropriate provisioning/Super Administrator capability and endpoint compatibility; their general availability does not elevate the creator's permissions.

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

Create the bucket first, then follow [R2 credential creation](beginner-setup.md): **R2 Overview → Account Details → API Tokens /Manage → Create User/Account API token → Object Read & Write → only the recorded bucket → Create**. Store the Access Key ID and once-shown Secret Access Key privately. Object-only grants support S3 operations, not Cloudflare REST or bucket administration. Verify a permitted read-only object listing in the matching endpoint before optional signing/multipart.

Set `R2_BUCKET`, `R2_KEY` and `R2_ENDPOINT`. Default endpoint: `https://<account-id>.r2.cloudflarestorage.com`. Jurisdictional buckets use the matching `.eu`, `.us` or `.fedramp` account endpoint. Region `auto` does not choose jurisdiction. AWS CLI v2 is needed only for the optional presigned-link step; raw S3 requests need curl with `--aws-sigv4` (added in curl 7.75.0).

For a **Windows AWS CLI upload/download/presign or multipart route**, use [R2's Windows setup](03-r2.md#windows-powershell--aws-cli-option). It includes the Windows installer link and the R2 credential creation click path. No Python or npm is needed for that route.

## 5. Cleanup preparation

Keep an ownership checklist rather than relying on automated cleanup. After the labs delete only recorded images/videos/variant definitions/object keys/folder markers. Remove the dedicated empty bucket and revoke workshop credentials when no longer needed. Clear preview URLs and terminal secrets.

References: [API tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/), [Images variants](https://developers.cloudflare.com/images/optimization/hosted-images/create-variants/), [R2 credentials/jurisdiction](https://developers.cloudflare.com/r2/api/tokens/).
