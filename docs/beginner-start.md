# Start here — your first media lab

You do not need to write code. Keep this guide in one browser tab and Cloudflare Dashboard in another. Follow one numbered step at a time.

**You need:** Windows 10/11 with Edge or Chrome, access to the approved workshop account, and permission to download sample files. Other desktop browsers can follow the same click steps. The instructor arranges product activation/capacity; the labs teach creation of variants and a private bucket before uploading.

## 1. Open your two working tabs

1. Open [the lab guide and tools](https://mahidol-media-training.pongpisit.workers.dev/labs.html).
2. Open [Cloudflare Dashboard](https://dash.cloudflare.com/) in a second tab. Sign in, then select the account named by your instructor.
3. Keep both tabs open. Return to this guide after each Dashboard step.
4. In Dashboard **Search** (**Ctrl+K**, Mac: **Command+K**), select **Copy account ID** and record it in your local worksheet. Read [First-time setup](beginner-setup.md) for product-access checks and the scoped API-token walkthrough. An authorized operator creates credentials; browser lab participants need none.

**You should see:** the instructor's account name in Cloudflare. If you cannot see it, ask the instructor to fix access before uploading anything.

## 2. Download the four sample files

In the lab guide, find **Start with sample-only media**. Click each download:

| Download | What it is | Used in |
|---|---|---|
| Training image | `sample-image.jpg`, an orange campus picture | Images |
| English training video | `sample-video.mp4`, a 20-second blue studio clip | Stream and R2 |
| English captions | `captions-en.vtt`, timed text for the clip | Stream |
| Sample document | `sample-document.txt`, a small text file | R2 |

Open **File Explorer → Downloads** and find these files. Keep the original files. You do not need to download a ZIP, open a terminal or install a package.

**Try it:** open the picture and play the video with sound. The two scenes look different. If the browser adds `(1)` to a filename, that is a duplicate download; choose the file you just saved.

## 3. Copy your personal lab names

1. In the lab guide, open **Your lab tools → Lab names**.
2. The page gives you a fresh label, a folder name, an **R2 bucket name** and two image-variant names. Click **Copy** beside the value you need. If copying is blocked, select the field and press **Ctrl+C**.
3. Paste the values into [your worksheet](beginner-worksheet.md), or a local document. Keep the names for all three labs.

These are ordinary names, not passwords. Refreshing the page creates new names: use the names already written in your worksheet for existing resources.

## 4. Follow the labs in this order

| Lab | You will show | Guide | Time |
|---|---|---|---|
| Images | Create two variants, then show the picture as a cropped card and full view | [Start Images](beginner-images.md) | 35 minutes |
| Stream | Your uploaded clip playing with reviewed captions | [Start Stream](beginner-stream.md) | 40 minutes |
| R2 | Create a private bucket, then verify its actual downloaded copy | [Start R2](beginner-r2.md) | 35 minutes |

Each guide has **Do this**, **You should see**, **If it does not work**, and **Clean up** sections. Check the result before moving on. An instructor can handle caption or private-access features requiring API permissions; you still watch and record what actually happened.

## Three classroom rules

- Upload only the supplied synthetic samples to the prepared lab account. Products have usage charges; the instructor prepares capacity and cleanup.
- Write down the IDs/names of your own resources. Delete only those resources when the guide says to clean up.
- Never paste passwords or API keys into the lab webpage. The tools inspect local files and build links; they do not log into Cloudflare.

**Ready?** Open [Lab 1 — Images](beginner-images.md).

If a term is unfamiliar, use the [product glossary](https://mahidol-media-training.pongpisit.workers.dev/labs.html#product-fundamentals-glossary). You do not need to memorize it before starting.
