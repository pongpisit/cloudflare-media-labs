# Cloudflare Media Labs

**Download a kit → follow the lab → show your result → clean up.**

This repository contains the hands-on labs. Use the [workshop slides](https://mahidol-media-training.pongpisit.workers.dev/) for explanations and architecture.

## Choose your lab

| Lab | Guide | Download | Time |
|---|---|---|---|
| 1 · Images | [Create and compare two image views](docs/beginner-images.md) | [Images kit](https://github.com/pongpisit/cloudflare-media-labs/releases/latest/download/images-lab.zip) | 35 min |
| 2 · Stream | [Publish a video and review captions](docs/beginner-stream.md) | [Stream kit](https://github.com/pongpisit/cloudflare-media-labs/releases/latest/download/stream-lab.zip) | 40 min |
| 3 · R2 | [Store, download and compare files](docs/beginner-r2.md) | [R2 kit](https://github.com/pongpisit/cloudflare-media-labs/releases/latest/download/r2-lab.zip) | 35 min |

**[Download all three kits](https://github.com/pongpisit/cloudflare-media-labs/releases/latest/download/all-labs.zip)** · **[Before you start](docs/beginner-start.md)**

## Open the kit

1. Download your ZIP and choose **Extract All** in File Explorer.
2. Open **START-HERE.html** in Edge or Chrome. For the all-labs bundle, open the folder for your lab first.
3. Keep [Cloudflare Dashboard](https://dash.cloudflare.com/) open in another tab and follow the lab guide.

Each kit includes its image/video/document samples and ready-built HTML tools. No code editing, terminal or installation is required. Instructions and file tools work locally; Cloudflare operations need Internet access.

## Keep it safe

- Use only the instructor-approved account and supplied synthetic files. Product usage can incur charges.
- Never put API tokens, signing keys or R2 secret keys in the HTML page. Signed media URLs are sensitive too—clear them after use.
- Record results in the small results section at the end of each lab. Delete only resources you personally created.
- If a restricted Stream video will not embed from a local file, use the Dashboard player. Do not disable access policies.

[Individual sample files](samples/) · [All releases and checksums](https://github.com/pongpisit/cloudflare-media-labs/releases)

<details>
<summary>Maintainers</summary>

The learner pages come from `browser-labs/`; samples are in `samples/`. `npm run package:labs` generates the ZIPs in ignored `downloads/`. Publish a new version using the manual **Publish browser lab kits** workflow. The scripts and tests are maintainer tooling, not learner prerequisites. Earlier technical documentation remains available in Git history.

</details>

Unofficial educational labs; not a production authorization service.
