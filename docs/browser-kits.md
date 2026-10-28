# Downloadable browser lab kits

Each release kit has a ready-to-open `START-HERE.html`, instructions, synthetic materials and local verification tools. No learner installation or management credentials are required. The existing hosted guide and beginner Markdown route remain available.

## Learner workflow

1. Choose the instructor-approved kit on the [Releases page](https://github.com/pongpisit/cloudflare-media-labs/releases). A release must be published before its downloads are available.
2. Extract the ZIP. Do not open the HTML from inside File Explorer's ZIP preview.
3. Open `START-HERE.html` in Edge or Chrome. In `all-labs.zip`, open the folder for one lab first.
4. Follow Prepare → Upload/create → Connect → Verify → Clean up.
5. Clear connections and selections after use. Values are also cleared when you close, reload or leave the page. Opening a result in another tab or checking the Dashboard does not clear them, so close the lab tab when finished on a shared device.

| Kit | Materials | Ready-built tools |
|---|---|---|
| Images | 1600×1200 campus JPEG | Real public or instructor-signed delivery views; saved-variant link builder; downloaded-image dimensions |
| Stream | 20-second MP4, separate poster, matching English VTT | Clearly labelled local sample player; actual customer Stream iframe player connection |
| R2 | Small document and MP4 | Optional instructor-issued presigned GET link; original/downloaded SHA-256 match/mismatch |
| All labs | All three folders | Same pages and tools as individual kits |

## Privacy and limitations

- No API token, Images signing key, password or R2 secret key belongs in the HTML. Management operations remain in Dashboard or trusted instructor tooling.
- URLs containing signed capabilities are sensitive. They are not stored by these pages or written into exports, but actual media requests transmit them to the delivery service. Opening links may leave them in browser history; do not use a shared device or save signed URLs in screenshots, bookmarks or Git.
- Use the supplied samples and approved sandbox only. Product usage can incur charges. Creation and cleanup remain manual, limited to recorded owned resources.
- The page does not authenticate users, verify signatures or determine whether a URL permits GET. Its URL checks validate only expected service shapes. Actual permissions, expiry, playback and downloads must be tested separately.
- Local file origins may not satisfy Stream allowed-origin policies. Use the instructor-approved [hosted preview](https://mahidol-media-training.pongpisit.workers.dev/labs.html#live-preview) rather than disabling access controls.
- The Images tool supports the ordinary `imagedelivery.net/<hash>/<id>/<variant>` route. Custom image IDs/hostnames are an instructor extension. Full signed URLs are used unchanged.
- SHA-256 uses the browser Web Crypto API. If unsupported or blocked locally, use the hosted tools. The comparison limit is 100 MiB per file. Selecting the same original twice cannot prove an R2 download.
- All lab content/styles/scripts are bundled in the HTML. Materials are separate files beside it. Local instructions/file tools work offline, but Dashboard and actual media access need Internet connectivity.

## Build and publish (maintainers)

```sh
npm ci
npm test
npm run test:browser
npm run package:labs
```

Set `CHROME_PATH` for a non-default Chrome executable. Browser checks use local files and intercepted media-service fixtures, not real Cloudflare operations. Windows extraction/browser behavior should also be rehearsed by the instructor before class.

The packaging command builds deterministic ZIP files and SHA-256 checksums in ignored `downloads/`. Each kit contains only HTML, a short README, LICENSE and its samples; the single-lab ZIPs keep these at the ZIP root, and the all-labs ZIP uses one folder per lab. English captions are embedded in the Stream page so the local player works from `file://`. The source files are `browser-labs/content.mjs`, `browser-labs/lab.css`, `browser-labs/lab.js` and `scripts/lab-kits.mjs`.

Push reviewed source changes, then run **Publish browser lab kits** in GitHub Actions with a release tag. That manual workflow runs tests, browser checks and packaging before creating or updating release assets. Publishing a release is an explicit maintainer action. The regular test workflow also attaches packages as CI artifacts.

## Local verification record — 28 October 2026

- 21 Node tests passed, including URL rejection, package contents/checksums, deterministic bytes, unchanged samples, creation/privacy/cleanup boundaries and existing REST/S3/document tests.
- 10 Chrome browser groups (including four loaded caption cues and tab-switch persistence) passed at 1280×800 and 390×844 using `file://`: no horizontal overflow, labelled inputs, disconnected initial state, bundled 20-second video metadata, actual local image decoding, intercepted Stream iframe/reset, file-provenance gate, SHA-256 match/mismatch and print control hiding.
- The generated ZIPs passed `unzip -tq`; their timestamps are fixed for repeatable builds.
- `npm audit` reports zero known vulnerabilities with pinned Puppeteer Core 25.16.0.
- These are offline/browser/package checks—not actual product upload, live signed playback, Windows browser rehearsal or a claim that a GitHub release has been published.
