# Context before commands

Official developer documentation reviewed on 2026-10-03. The explanations below distinguish native product capabilities from application responsibilities.

## The shared model: management, processing, delivery

```text
Publisher → trusted management API → stored source → processing policy → delivery URL → viewer
Viewer identity / course permission → your application → limited capability → media service
```

The management API uses account credentials. The viewer receives media through a different delivery path. A successful upload proves ingestion; it does not prove the content is correctly transformed, fully encoded, captioned, authorized or recoverable. API tokens are not browser playback credentials. Your app still owns user identity and entitlement decisions.

## Images: transformations are a publishing contract

Cloudflare Images has **two integration paths**:

1. **Hosted Images:** upload an original to Images, receive an image ID and delivery links, define reusable named variants. This lab uses this path.
2. **Bring your own storage:** retain the original on an origin such as R2 and request transformations through an enabled Cloudflare zone or Workers integration. Storage, source access and transformation configuration are separate responsibilities.

A **variant** is a named transformation policy, not another independent preservation master. Width/height describe a box; fit determines whether the image is cropped or shrunk. For a 1600×1200 source, cover at 320×180 crops; scale-down within 1280×720 yields 960×720. Metadata stripping and image quality are deliberate publishing choices. Responsive HTML should choose an appropriate delivered width for the layout/device; increasing pixel dimensions cannot restore source detail.

For remote transformations, a cache miss fetches the source and transforms it; a hit serves the cached transformed representation. The source+parameter combination matters for cache identity and unique-transformation billing. Do not confuse these billing dimensions with hosted Images Stored/Delivered.

Private hosted delivery uses backend-generated HMAC signatures. Audit variants: **Always allow public access** overrides an image's signed requirement. Flexible variants cannot be combined with native signed private delivery. An image-delivery hash is not the Cloudflare account ID.

Sources: [Images overview](https://developers.cloudflare.com/images/), [key concepts](https://developers.cloudflare.com/images/get-started/key-concepts/), [remote transformation/cache behavior](https://developers.cloudflare.com/images/optimization/transformations/overview/), [variants](https://developers.cloudflare.com/images/optimization/hosted-images/create-variants/), [private delivery](https://developers.cloudflare.com/images/optimization/hosted-images/serve-private-images/).

## Stream: file → renditions → manifests → player

```text
Original video → encoding → available renditions → HLS/DASH manifest + segments → ABR player
                                      ↘ captions: independently processed language tracks
```

Stream manages upload, storage, encoding and delivery. Adaptive bitrate (ABR) means the player chooses among **available** representations based on its own bandwidth/buffer logic. A manifest describes the stream; the player fetches media segments. A 1080p capability is not proof that every source has a usable 1080p rendition. Encoding cannot recreate detail absent from the source.

Separate three milestones: transfer complete; `readyToStream=true` (playable); and `pctComplete=100` (all quality processing complete). Caption readiness is another independent state. Our short MP4 uses basic multipart form upload; files over 200 MB require tus for direct file upload, and unreliable connections can benefit from tus below that threshold.

The managed iframe player is one integration path; an HLS/DASH-compatible custom player is another. Official docs say **do not cache, proxy or store Stream manifests**; read them directly from Stream. The player may already have buffered media, so verify expiry with a **fresh** manifest/media request rather than waiting for buffered playback to stop.

`requireSignedURLs` removes public UID-only playback. Low-volume labs use `/token` with explicit expiry; high-volume integrations can sign locally or use the documented Workers binding. Signed playback, allowed-origin restrictions and LMS authentication solve different problems. CORS/CSP/embedding policy must be tested in the real publishing environment. Storage and delivery are measured in minutes; preloading/buffering can count as delivered usage.

Sources: [Stream overview](https://developers.cloudflare.com/stream/), [basic uploads](https://developers.cloudflare.com/stream/uploading-videos/upload-video-file/), [readiness](https://developers.cloudflare.com/stream/faq/), [custom players and manifests](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/), [captions](https://developers.cloudflare.com/stream/edit-videos/adding-captions/), [signed playback](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/), [pricing](https://developers.cloudflare.com/stream/pricing/).

## R2: a key addresses an object, not a video pipeline

An object consists of **bytes, an exact key, and metadata** inside a bucket. `courses/biology/handout.txt` is a key with prefixes; it is not a nested filesystem. R2 stores arbitrary files; an MP4 in R2 does not acquire Stream encoding, ABR manifests, captions or a managed player.

R2 offers an S3-compatible API and Workers bindings. Check exact API/header compatibility instead of assuming full S3 parity. S3 calls use `region: auto` and the account/jurisdiction endpoint; a public custom domain is a separate delivery route. The lab uses a dedicated private bucket and S3 object credentials.

A presigned URL uses SigV4 to authorize **one method on one object** until expiry. It is reusable until expiry and is generated locally without proving object existence. Changing the signed method/host/key breaks the signature. Use GET to consume a presigned GET; HEAD is different. Browser JavaScript also needs appropriate CORS; navigation/curl and browser fetch are different tests.

R2 object read/write/list/delete operations are strongly globally consistent. A caching-enabled custom domain can still serve an older cached object or cached 404. S3 API/Workers bucket access does not transit that CDN cache. Strong consistency is not backup/version history: R2 does not implement native S3 bucket versioning. Keep explicit originals, metadata and tested restoration paths.

Multipart upload creates an upload, sends numbered parts, and **completes** with ordered ETags. Parts alone are not a completed object. Retry failed parts, retain successes, and abort abandoned uploads. The 5/5/2 MiB example is intentionally small; multipart is not necessary for a 12 MiB file. Compare a real downloaded SHA-256 with the original; a multipart ETag is not that checksum.

No egress bandwidth charge does not remove storage/Class A/Class B costs. Infrequent Access adds retrieval/minimum-duration considerations; Standard is the workshop default.

Sources: [R2 overview](https://developers.cloudflare.com/r2/), [authentication](https://developers.cloudflare.com/r2/api/tokens/), [objects](https://developers.cloudflare.com/r2/objects/), [S3 compatibility](https://developers.cloudflare.com/r2/api/s3/api/), [presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/), [consistency/cache](https://developers.cloudflare.com/r2/reference/consistency/), [multipart](https://developers.cloudflare.com/r2/objects/upload-objects/), [pricing](https://developers.cloudflare.com/r2/pricing/).

## Assess the result, not the button press

| Product | Evidence worth keeping | What it does not establish |
|---|---|---|
| Images | Actual delivery dimensions, observed crop, private-access response sequence | University identity or preservation backup |
| Stream | Playability, all-quality progress, caption text/timing, fresh manifest access results | LMS compatibility or original-file recovery |
| R2 | Exact key/bytes, private-path checks, downloaded SHA-256 | Free total cost, automatic ABR or native S3 versioning |

Record claims from the actual account and avoid substituting local test fixtures for live product results.
