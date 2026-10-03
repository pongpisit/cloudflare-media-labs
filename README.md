# Cloudflare Media Labs

**Learn the theory. Run the APIs. Verify real media delivery.**

Hands-on Images, Stream and R2 labs for customers who already have a Cloudflare account. Every product command calls the real service using **your own credentials**; these are not the presentation's simulations.

**[Interactive workshop](https://mahidol-media-training.pongpisit.workers.dev/)** · **[Product theory](docs/00-theory.md)** · **[Setup](docs/setup.md)**

## What you will build

| Lab | Real result | Verification |
|---|---|---|
| [Images](docs/01-images.md) | One hosted JPEG, two account-wide named variants | Fetch/decode 320×180 and 960×720 images; optional private signature/expiry test |
| [Stream](docs/02-stream.md) | A processed, captioned video requiring signed playback | Readiness + English caption checks, actual iframe playback, fresh HLS access/expiry requests |
| [R2](docs/03-r2.md) | A private handout and completed multipart object | Real temporary GET, 5/5/2 MiB upload, download and SHA-256 comparison |

## Start here

1. Use **Node.js 24 LTS or later**, npm and Git.
2. Enable **Images Paid storage**, **Stream storage capacity**, and **R2** in your account. Having an account alone does not enable all three products. These exercises use billable services: one small JPEG, one 20-second clip and a 12 MiB object. Check current pricing and delete the lab resources when finished.
3. Follow [account/token/bucket setup](docs/setup.md), then:

```sh
git clone https://github.com/pongpisit/cloudflare-media-labs.git
cd cloudflare-media-labs
npm ci
cp .env.example .env
# Edit .env privately with your own account and scoped credentials.
npm run doctor
```

PowerShell: use `Copy-Item .env.example .env` instead of `cp` if needed. Do not upload `.env` to GitHub. `doctor` checks local configuration only; `images setup`, `stream upload` and `r2 preflight` exercise real permissions.

Run the three guides **in order**. Each has theory, numbered commands, expected results, troubleshooting and cleanup. The operator runs commands in a trusted terminal; the partner reviews settings and evidence. Account setup is a pre-class task.

## Command map

```sh
npm run images -- --help
npm run stream -- --help
npm run r2 -- --help
npm run fixture
npm test
```

`npm test` uses local protocol fixtures and deterministic binary data; it needs no credentials and creates no cloud resources. It verifies request formatting, signing, readiness handling, scope checks, multipart completion/abort behavior and fixture integrity. It does **not** prove your account's entitlements or actual playback. `verify` and `verify-access` commands explicitly perform live checks when you run them.

## Ownership and credentials

- Your account ID and `LAB_PREFIX` are bound to a private, ignored `.lab/state.json` ledger. A random suffix makes each run's variant names and object keys distinct.
- Cleanup targets only IDs/keys recorded by this run. It does not delete shared buckets, account signing keys, unrelated variants or other workshop runs.
- REST bearer tokens are for Images/Stream. R2 uses a separate S3 Access Key ID + Secret Access Key, scoped to your dedicated bucket.
- Images HMAC keys and API credentials stay in `.env`/the terminal. Only a limited delivery URL/token goes into a browser.
- `sign`, `token` and `presign` intentionally print bearer capabilities. Use them immediately; do not commit, screenshot or share their full values. The ledger stores resource IDs and non-secret verification results, not signed URLs.
- Run one terminal operation at a time. On an interrupted/uncertain upload, inspect the ledger and dashboard before repeating creation. Recorded R2 upload IDs can be cleaned up; hard interruption before an ID is saved requires dashboard inspection.

## Repository layout

```text
docs/          Setup, product context, three runnable lab guides and worksheet
scripts/       Actual REST/S3 integrations and deterministic fixture generator
samples/       Original JPEG, narrated MP4, aligned WebVTT and text document
tests/         Local protocol, signing, multipart and integrity checks
.env.example   Names/placeholders only
.lab/          Generated private resource ledger (ignored)
lab-output/    Generated/downloaded binaries (ignored)
```

## Complete the workshop

Record observations in [the worksheet](docs/worksheet.md), then run the three cleanup commands. Remove the dedicated empty R2 bucket and revoke workshop credentials in the dashboard if no longer needed. Keep the original media and your non-secret evidence separately.

This is an unofficial educational project, not a production LMS authorization service. Product behavior is grounded in the [linked official documentation](docs/00-theory.md). Source review and local tests have been performed; live participant outcomes must be established in each customer's own account.
