# Cloudflare Media Labs

**Click. Copy and paste. Check what happened.**

Beginner-friendly Images, Stream and R2 labs for people who publish media rather than write code. Use **Windows 10/11 + Edge or Chrome**, Cloudflare Dashboard, and the supplied samples. Each short guide tells you what to click, what to copy, what you should see, and how to finish. **No terminal, API key, ZIP extraction or software installation is required for the learner route.**

### [Start here — the beginner guide →](docs/beginner-start.md)

**[Lab guide and local tools](https://mahidol-media-training.pongpisit.workers.dev/labs.html)** · **[Interactive presentation](https://mahidol-media-training.pongpisit.workers.dev/)** · **[My worksheet](docs/beginner-worksheet.md)**

## Start here

1. Ask the instructor for the prepared Cloudflare account and private R2 bucket.
2. Open [the lab guide](https://mahidol-media-training.pongpisit.workers.dev/labs.html), download the four samples, and copy your personal lab names from **Your lab tools**.
3. Follow these guides in order. Work with a partner and record the actual results in [your worksheet](docs/beginner-worksheet.md).

| Lab | What you do | What you should show | Budget |
|---|---|---|---|
| [Images](docs/beginner-images.md) | Upload a picture, copy two variant names, open and download both views | Card **320×180**, detail **960×720**, and an explained crop | 35 min |
| [Stream](docs/beginner-stream.md) | Upload once, wait, play, add/review captions with instructor help when needed | A real clip with matching sound and captions | 40 min |
| [R2](docs/beginner-r2.md) | Upload private files, download the video, use the browser comparison tool | The actual downloaded file matches the original | 35 min |

These operations use billable products in **your account**. The samples are one small JPEG, a 20-second synthetic clip and a text document; the optional multipart extension adds 12 MiB. Review current product pricing and clean up when finished.

## Help for instructors and technical operators

Start with [Instructor preparation](docs/instructor.md). It covers account/permissions, prepared variants, caption API assistance, private-access demonstrations and cleanup. The earlier detailed API guides remain available there as technical references. Beginners do not need to choose among those routes.

### Retained API tools and credentials

The preferred Windows examples use **Windows PowerShell 5.1 or PowerShell 7**, native `Invoke-RestMethod` for JSON, and **`curl.exe`** for multipart files/status checks. [Windows quick start](docs/windows.md) includes hidden token entry, a copy/paste REST helper, and REST-client steps. Existing Bash examples remain available for macOS/Linux/WSL. Use account-scoped Images/Stream bearer tokens; R2 S3 calls use separate bucket-scoped access keys.

R2 presigning is local SigV4 signing, not a Cloudflare REST endpoint or a Dashboard button. An operator with **AWS CLI v2** can generate a link; participants consume it with a normal browser GET. The Windows multipart route uses AWS CLI plus built-in PowerShell/.NET; the Bash raw-HTTP route uses curl SigV4 and Python 3 standard-library tools. Optional tasks replace repetition within the existing lab budget or become follow-up.

## Evidence and ownership

- Record account label, unique variant names, image ID, video UID, bucket and exact object keys in [My worksheet](docs/beginner-worksheet.md). Instructors use the [technical worksheet](docs/worksheet.md) for API extensions.
- Cleanup is manual and limited to those recorded resources. A prefix is a naming convention, not a permission boundary.
- Do not save API keys, full playback tokens or signed URLs in Git/screenshots/worksheets.
- Check the actual image, player/captions and downloaded file before continuing. An upload alone does not establish correct delivery or authorization.
- A blocked step stays **unperformed**; the presentation's labelled simulations explain mechanisms but are not real product evidence.

## Maintainer tooling

The earlier Node REST/S3 integrations remain in `scripts/`, `tests/` and the pinned package files as optional maintainer tooling. They are not required by participants. `npm test` checks the integration cases, document links, beginner-route constraints, timeboxes and actual caption-file consistency. GitHub Actions also checks documented PowerShell syntax and runs the local REST/S3 helpers and multipart fixture/completion logic with mocked transports on **Windows PowerShell 5.1 and PowerShell 7** (`tests/windows-docs.ps1`). No credentials or cloud mutations are used. These checks do not certify customer account permissions or actual playback.

This is an unofficial educational project. Official sources are linked in [product theory](docs/00-theory.md) and each lab. It is not a production LMS authorization service.
