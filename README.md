# Cloudflare Media Labs

**Learn the theory. Use the Dashboard. Inspect real API responses.**

Hands-on Images, Stream and R2 labs for customers with a Cloudflare account, with **Windows 10/11 as the preferred participant platform**. Each lab has numbered **Cloudflare Dashboard click paths**, expected results, and **Windows PowerShell/API alternatives**. No Node.js, npm, Git clone or WSL is required for the core route. Optional R2 CLI exercises use AWS CLI v2.

**[Interactive workshop](https://mahidol-media-training.pongpisit.workers.dev/)** · **[Windows quick start](docs/windows.md)** · **[Product theory](docs/00-theory.md)** · **[Setup](docs/setup.md)** · **[Evidence worksheet](docs/worksheet.md)**

## Start here

1. On Windows, start with the [Windows browser/PowerShell walkthrough](docs/windows.md). Complete [account and access setup](docs/setup.md): Images Paid storage, Stream capacity and a dedicated private R2 bucket.
2. Download the [sample files](samples/) individually, or use **Code → Download ZIP** and extract it. Keep originals separately.
3. Follow the numbered guides. Work in pairs: operator clicks/calls; partner checks settings and evidence. Use a unique prefix and manually record the exact resources you create.

| Lab | Dashboard work | Direct API / extension | Budget |
|---|---|---|---|
| [Images](docs/01-images.md) | Upload JPEG, create named variants, inspect real dimensions/crop, delete owned assets | PowerShell REST upload/variants/privacy; native .NET HMAC expiry test; Bash alternative | 35 min |
| [Stream](docs/02-stream.md) | Upload/preview, processing, captions, embed, delete owned video | PowerShell caption PUT/readiness/access/token; optional export/clip/Analytics | 40 min |
| [R2](docs/03-r2.md) | Private bucket, upload, actual download/SHA-256, delete owned keys | Windows AWS CLI upload/download/presign; [Windows manual multipart](docs/05-r2-windows.md); [Bash raw S3](docs/04-r2-api.md) | 35 min |

These operations use billable products in **your account**. The samples are one small JPEG, a 20-second synthetic clip and a text document; the optional multipart extension adds 12 MiB. Review current product pricing and clean up when finished.

## API tools and credentials

The preferred Windows examples use **Windows PowerShell 5.1 or PowerShell 7**, native `Invoke-RestMethod` for JSON, and **`curl.exe`** for multipart files/status checks. [Windows quick start](docs/windows.md) includes hidden token entry, a copy/paste REST helper, and REST-client steps. Existing Bash examples remain available for macOS/Linux/WSL. Use account-scoped Images/Stream bearer tokens; R2 S3 calls use separate bucket-scoped access keys.

R2 presigning is local SigV4 signing, not a Cloudflare REST endpoint or a Dashboard button. An operator with **AWS CLI v2** can generate a link; participants consume it with a normal browser GET. The Windows multipart route uses AWS CLI plus built-in PowerShell/.NET; the Bash raw-HTTP route uses curl SigV4 and Python 3 standard-library tools. Optional tasks replace repetition within the existing lab budget or become follow-up.

## Evidence and ownership

- Record account label, unique variant names, image ID, video UID, bucket, exact object keys and any multipart upload ID in the [worksheet](docs/worksheet.md).
- Cleanup is manual and limited to those recorded resources. A prefix is a naming convention, not a permission boundary.
- Do not save API keys, full playback tokens or signed URLs in Git/screenshots/worksheets.
- Inspect the HTTP response and REST `success`/`errors` before continuing. An upload response alone does not establish correct delivery, captions or authorization.
- A blocked step stays **unperformed**; the presentation's labelled simulations explain mechanisms but are not real product evidence.

## Maintainer tooling

The earlier Node REST/S3 integrations remain in `scripts/`, `tests/` and the pinned package files as optional maintainer tooling. They are not required by participants. `npm test` checks the 12 integration cases plus participant document links. GitHub Actions also checks documented PowerShell syntax and runs the local REST/S3 helpers and multipart fixture/completion logic with mocked transports on **Windows PowerShell 5.1 and PowerShell 7** (`tests/windows-docs.ps1`). No credentials or cloud mutations are used. These checks do not certify customer account permissions or actual playback.

This is an unofficial educational project. Official sources are linked in [product theory](docs/00-theory.md) and each lab. It is not a production LMS authorization service.
