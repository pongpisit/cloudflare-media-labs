# Cloudflare Media Labs

**Click. Copy and paste. Check what happened.**

Beginner-friendly Images, Stream and R2 labs for people who publish media rather than write code. Use **Windows 10/11 + Edge or Chrome**, Cloudflare Dashboard, and the supplied samples. Each short guide tells you what to click, what to copy, what you should see, and how to finish. **No terminal, API key or software installation is required for the learner route.** The hosted guide needs no download or ZIP extraction; the download-first browser kits (below) need only a ZIP extraction.

### [Start here — the beginner guide →](docs/beginner-start.md)

**[Lab guide and local tools](https://mahidol-media-training.pongpisit.workers.dev/labs.html)** · **[Interactive presentation](https://mahidol-media-training.pongpisit.workers.dev/)** · **[My worksheet](docs/beginner-worksheet.md)**

## Download first (browser lab kits)

The browser kits include a ready-to-open HTML guide and the materials for **Images**, **Stream**, **R2**, or an **all-labs** bundle. Local instructions and file tools work offline; Dashboard operations and real media delivery still need Internet access. Each is a ZIP file that you extract and open in Edge or Chrome.

**Availability:** ZIPs are not stored in the repository. A maintainer builds them and publishes a tagged release, so they are available only once that release exists. Check the [Releases page](https://github.com/pongpisit/cloudflare-media-labs/releases). If no release is listed, or it has no kit files, use the hosted guide above. Ask your instructor which release to use.

| Images lab · 35 min | Stream lab · 40 min | R2 lab · 35 min |
|---|---|---|
| JPEG + ready-built card/detail page | MP4 + captions + ready-built player page | Document/video + ready-built file comparison |
| [Find `images-lab.zip` in Releases](https://github.com/pongpisit/cloudflare-media-labs/releases) | [Find `stream-lab.zip` in Releases](https://github.com/pongpisit/cloudflare-media-labs/releases) | [Find `r2-lab.zip` in Releases](https://github.com/pongpisit/cloudflare-media-labs/releases) |

**[Kit contents, privacy and troubleshooting](docs/browser-kits.md)**

**How to use a kit once available:**

1. On the release page, download the ZIP for your lab (`images-lab.zip`, `stream-lab.zip` or `r2-lab.zip`), or `all-labs.zip` for every lab. The release may also list `SHA256SUMS.txt` for an optional integrity check.
2. In File Explorer, right-click the ZIP and choose **Extract All**. Do not open `START-HERE.html` from inside the ZIP preview.
3. Open the extracted folder and double-click **START-HERE.html**. It opens in your browser. It does not need a terminal, an installer or a web server.

**Browser tool limits:**

- The tools work locally in your browser, including image dimension checks and SHA-256 file comparison. If your browser blocks a local capability, use the hosted fallback tools. They do not upload your files.
- **Never enter an API key, signing key, password or R2 secret key.** The tools do not log in to Cloudflare. Connections and selections are cleared when you close or leave the page, or press the clear button. You may optionally paste an actual delivery URL or player URL, but treat it as sensitive: a URL with a bearer or signed token grants access to anyone who has it. Do not share it, screenshot it or save it in Git.
- A Stream player embedded in a locally opened page can fail Stream's allowed-origin check, so the video may not play there. This is expected. Use the existing [hosted lab guide](https://mahidol-media-training.pongpisit.workers.dev/labs.html) as the fallback.

**Sample files from `main` (individual downloads):** right-click a link and choose **Save link as…**.

- [sample-image.jpg](https://raw.githubusercontent.com/pongpisit/cloudflare-media-labs/main/samples/sample-image.jpg)
- [sample-video.mp4](https://raw.githubusercontent.com/pongpisit/cloudflare-media-labs/main/samples/sample-video.mp4)
- [captions-en.vtt](https://raw.githubusercontent.com/pongpisit/cloudflare-media-labs/main/samples/captions-en.vtt)
- [sample-document.txt](https://raw.githubusercontent.com/pongpisit/cloudflare-media-labs/main/samples/sample-document.txt)

## Start here

1. Select the approved account and follow [First-time setup](docs/beginner-setup.md): Account ID, product access and scoped API credentials for authorized operators.
2. Open [the lab guide](https://mahidol-media-training.pongpisit.workers.dev/labs.html), download the four samples, and copy your folder, bucket and variant names from **Your lab tools**.
3. Follow these guides in order. Work with a partner and record the actual results in [your worksheet](docs/beginner-worksheet.md).

| Lab | What you do | What you should show | Budget |
|---|---|---|---|
| [Images](docs/beginner-images.md) | Create/check two variants first, then upload a picture, open and download both views | Card **320×180**, detail **960×720**, and an explained crop | 35 min |
| [Stream](docs/beginner-stream.md) | Upload once, wait, play, add/review captions with instructor help when needed | A real clip with matching sound and captions | 40 min |
| [R2](docs/beginner-r2.md) | Create a private Standard bucket, upload files, download the video and compare locally | Recorded bucket/privacy and an actual download matching the original | 35 min |

These operations use billable products in **your account**. The samples are one small JPEG, a 20-second synthetic clip and a text document; the optional multipart extension adds 12 MiB. Review current product pricing and clean up when finished.

## Help for instructors and technical operators

Start with [Instructor preparation](docs/instructor.md). It covers account/permissions, teaching resource creation with explicit role-restricted fallbacks, scoped REST/R2 credentials, caption assistance, private-access demonstrations and owned cleanup. The earlier detailed API guides remain available as technical references. Beginners do not need to choose among those routes.

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

**Browser lab kits.** `npm run package:labs` builds `downloads/images-lab.zip`, `downloads/stream-lab.zip`, `downloads/r2-lab.zip`, `downloads/all-labs.zip` and `downloads/SHA256SUMS.txt`. Each ZIP contains `START-HERE.html` (all-labs uses one folder per lab), generated by the script with inline styles/scripts; generated HTML and ZIPs are not checked in. The shared sources are `browser-labs/lab.js`, `browser-labs/lab.css` and `browser-labs/content.mjs`. To publish, run the manual **lab-kits.yml** workflow (`workflow_dispatch`) and enter the required release **tag** input. Learner links to the Releases page are valid only after a maintainer has done this.

The earlier Node REST/S3 integrations remain in `scripts/`, `tests/` and the pinned package files as optional maintainer tooling. They are not required by participants. `npm test` checks the integration cases, document links, beginner-route constraints, timeboxes and actual caption-file consistency. GitHub Actions also checks documented PowerShell syntax and runs the local REST/S3 helpers and multipart fixture/completion logic with mocked transports on **Windows PowerShell 5.1 and PowerShell 7** (`tests/windows-docs.ps1`). No credentials or cloud mutations are used. These checks do not certify customer account permissions or actual playback.

This is an unofficial educational project. Official sources are linked in [product theory](docs/00-theory.md) and each lab. It is not a production LMS authorization service.
