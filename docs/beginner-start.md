# Before you start

The lab instructions are here on GitHub. The [workshop slides](https://mahidol-media-training.pongpisit.workers.dev/) explain the concepts; you do not need them open while doing a lab.

## 1. Open the approved account

1. Sign in to [Cloudflare Dashboard](https://dash.cloudflare.com/) and select the account named by your instructor.
2. Ask the instructor to confirm product activation, capacity and your permission to create, upload and delete lab resources. Do not purchase a plan or use production resources.
3. Keep Dashboard open beside your lab kit. Browser labs need **no API keys or commands**. The instructor handles API-only demonstrations.

## 2. Download and open your kit

| Lab | Download | Written guide |
|---|---|---|
| Images | [images-lab.zip](https://github.com/pongpisit/cloudflare-media-labs/releases/latest/download/images-lab.zip) | [Lab 1](beginner-images.md) |
| Stream | [stream-lab.zip](https://github.com/pongpisit/cloudflare-media-labs/releases/latest/download/stream-lab.zip) | [Lab 2](beginner-stream.md) |
| R2 | [r2-lab.zip](https://github.com/pongpisit/cloudflare-media-labs/releases/latest/download/r2-lab.zip) | [Lab 3](beginner-r2.md) |

Or [download all labs](https://github.com/pongpisit/cloudflare-media-labs/releases/latest/download/all-labs.zip).

1. In File Explorer, right-click the ZIP → **Extract All**.
2. Open the extracted folder and double-click **START-HERE.html**. In the all-labs bundle, first open the folder for your lab. Do not open the page inside the ZIP preview.
3. The kit's `samples` folder contains the files to upload. Keep originals unchanged. Open the JPEG and play the MP4 with sound before class.

| File | Purpose |
|---|---|
| `sample-image.jpg` | 1600×1200 orange campus image for Images |
| `sample-video.mp4` | 20-second blue studio clip for Stream and R2 |
| `captions-en.vtt` | English captions matching the clip |
| `sample-document.txt` | Small R2 download example |

Individual files are also in [samples](../samples/). No terminal or software installation is needed.

## 3. Copy your resource names

At the bottom of **START-HERE.html**, find **Copy your own resource names**. Use the copy buttons to paste the names directly into Dashboard as you follow each lab. Keep the kit page open.

A refresh in the same tab keeps the label. Use **Generate a new label** only before creating resources. A different kit/tab may have a different label; continue using the names of the resources you already created.

## 4. Follow one lab at a time

**[Images · 35 min](beginner-images.md) → [Stream · 40 min](beginner-stream.md) → [R2 · 35 min](beginner-r2.md)**

Each guide includes the steps, expected result, help and cleanup. Follow the numbered steps and compare what you see with the expected result—no worksheet or report is required. Ask the instructor for help if a step is blocked.

## Safety and help

- Upload only supplied synthetic samples. Products can incur usage charges.
- Never enter a password, management API token, signing key or R2 secret key in the kit. The browser tools read local files or open your media URL; they do not sign in to Cloudflare.
- Signed delivery/player/presigned URLs grant temporary access. Do not save them in notes, screenshots or Git; use **Clear connections and selections** afterward.
- If Stream's allowed-origin policy blocks a local iframe, verify the video in Dashboard instead. Do not turn off the policy.
- If a browser cannot read a selected file, use a current Edge or Chrome and open the page from the extracted folder. Ask the instructor if still blocked.
- Delete only the resources you personally created. Never empty shared buckets or delete supplied variants/videos.
