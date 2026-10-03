# Cloudflare Media Labs

**Learn the theory. Use the Dashboard. Inspect real API responses.**

Hands-on Images, Stream and R2 labs for customers with a Cloudflare account. The participant route uses **Cloudflare Dashboard GUI first**, with direct HTTP API examples where needed. **No Node.js, npm, package installation or Git clone is required for the core labs.**

**[Interactive workshop](https://mahidol-media-training.pongpisit.workers.dev/)** · **[Product theory](docs/00-theory.md)** · **[Setup](docs/setup.md)** · **[Evidence worksheet](docs/worksheet.md)**

## Start here

1. Complete [account and access setup](docs/setup.md): Images Paid storage, Stream capacity and a dedicated private R2 bucket.
2. Download the [sample files](samples/) individually, or use **Code → Download ZIP** and extract it. Keep originals separately.
3. Follow the numbered guides. Work in pairs: operator clicks/calls; partner checks settings and evidence. Use a unique prefix and manually record the exact resources you create.

| Lab | Dashboard work | Direct API / extension | Budget |
|---|---|---|---|
| [Images](docs/01-images.md) | Upload JPEG, create named variants, inspect real dimensions/crop, delete owned assets | Alternative REST upload/variant creation; optional private HMAC delivery | 35 min |
| [Stream](docs/02-stream.md) | Upload/preview video, inspect processing, play English captions, copy iframe, delete owned video | Caption PUT/list GET, readiness GET, signed-policy POST and expiring playback token POST | 40 min |
| [R2](docs/03-r2.md) | Private bucket, upload document/video, download actual object, compare SHA-256, delete owned keys | Temporary GET via documented AWS CLI signing; [direct S3 multipart calls](docs/04-r2-api.md) | 35 min |

These operations use billable products in **your account**. The samples are one small JPEG, a 20-second synthetic clip and a text document; the optional multipart extension adds 12 MiB. Review current product pricing and clean up when finished.

## API tools and credentials

The API examples are standard `curl` requests for Bash on macOS/Linux/WSL. A trusted REST client can send the same method, URL, headers and body. Use account-scoped Images/Stream bearer tokens; R2 S3 calls use separate bucket-scoped access keys. Never paste management credentials into the workshop preview.

R2 presigning is local SigV4 signing, not a Cloudflare REST endpoint or a Dashboard button assumed by this guide. An instructor with **AWS CLI v2** can generate a link; participants consume it with a normal browser GET. The optional raw multipart exercise uses curl with `--aws-sigv4`, and Python 3 standard-library tools only for generating local data/parsing XML. Neither requires npm.

## Evidence and ownership

- Record account label, unique variant names, image ID, video UID, bucket, exact object keys and any multipart upload ID in the [worksheet](docs/worksheet.md).
- Cleanup is manual and limited to those recorded resources. A prefix is a naming convention, not a permission boundary.
- Do not save API keys, full playback tokens or signed URLs in Git/screenshots/worksheets.
- Inspect the HTTP response and REST `success`/`errors` before continuing. An upload response alone does not establish correct delivery, captions or authorization.
- A blocked step stays **unperformed**; the presentation's labelled simulations explain mechanisms but are not real product evidence.

## Maintainer tooling

The earlier Node REST/S3 integrations and 12 local tests remain in `scripts/`, `tests/` and the pinned package files as optional maintainer tooling. They are not required by the participant guides. GitHub Actions checks these existing integrations without credentials or cloud mutations. Documentation review/local tests do not certify customer account permissions or actual playback.

This is an unofficial educational project. Official sources are linked in [product theory](docs/00-theory.md) and each lab. It is not a production LMS authorization service.
