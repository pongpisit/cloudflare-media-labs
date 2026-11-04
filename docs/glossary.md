# Product fundamentals glossary

Use this reference when a technical word is unfamiliar. **ABR** means Adaptive Bitrate; it works with HLS/DASH rather than competing with them.

### Images

| Term | Meaning |
|---|---|
| Pixel / raster / vector | Color sample / a pixel grid / shapes and paths that can scale. |
| Dimensions / aspect ratio | Width × height in pixels / width-to-height ratio; 1600×1200 is 4:3. These differ from file bytes and CSS display size. |
| JPEG / JPG | Joint Photographic Experts Group encoding: common lossy photographic images without alpha. Both extensions commonly mean the same format. |
| PNG | Portable Network Graphics: lossless raster images with alpha transparency, useful for diagrams/screenshots. |
| WebP | Raster format with lossy/lossless modes, alpha and animation; useful for compatible web delivery. |
| AVIF / GIF / SVG | AV1 Image File Format / Graphics Interchange Format / Scalable Vector Graphics: modern raster encoding / palette-based animation / scalable shapes. Images AVIF input needs Enterprise; SVG is sanitized without resizing. |
| Lossy / lossless / alpha | Discard some detail / reconstruct encoded pixels exactly / per-pixel transparency. Lossless cannot undo prior lossy conversion. |
| Resize / crop / format conversion / quality | Change dimensions / remove edges / change encoding / adjust supported compression-fidelity settings. Measure actual results. |
| Named / flexible variants | Saved account-wide transform definitions / permitted URL parameters. Flexible variants require opt-in and cannot use native signed private hosted delivery. |
| Watermark / overlay | Visible mark / composited image or text layer. These require supported integration and are not copy protection. |
| Hosted / remote transformations | Original in Images / original fetched from a configured external origin. Separate setup, limits and billing. |
| Custom path / custom domain | Resource ID/path / delivery hostname. Native private Images cannot use custom ID paths. |

References: [MDN formats](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types), [Images concepts](https://developers.cloudflare.com/images/get-started/key-concepts/), [limits](https://developers.cloudflare.com/images/get-started/limits/).

### Stream

| Term | Meaning |
|---|---|
| Encode / decode / transcode | Prepare coded media / reconstruct it / convert encoded media. Encoding is not encryption. |
| Container / codec | File structure with tracks/metadata / encoding-decoding algorithm. Extension alone does not prove compatibility. |
| MP4 / M4A / H.264 / AVC / AAC | MPEG-4 containers; M4A conventionally audio-only / H.264, also Advanced Video Coding, video codec / Advanced Audio Coding audio codec. |
| Resolution / 360p–1080p / fps | Frame pixel dimensions / progressive labels based on vertical lines / frames per second. Available output depends on source/encoding. |
| Bitrate / Mbps / bandwidth / buffer | Encoded bits per second / megabits per second / available network capacity / downloaded media waiting to play. Not megabytes or resolution. |
| Rendition / manifest / segment | Encoded quality option / description of available media / timed piece of media. |
| ABR | Adaptive Bitrate: player selects available renditions using estimated network and buffer conditions. |
| HLS / M3U8 / DASH / MPD | HTTP Live Streaming / text playlist convention / Dynamic Adaptive Streaming over HTTP / XML Media Presentation Description. Both support adaptive delivery with a compatible player; read Stream manifests directly without caching/proxying/storing them. |
| On-demand / VOD / live / live recording | Pre-recorded content when requested / Video On Demand / broadcast as produced / deliberately retained replay. |
| Basic HTTP / tus / URL upload | Single transfer / resumable HTTP protocol / service fetches a remote source. Direct files over 200 MB require tus; unreliable links favor resumability. |
| RTMPS / SRT | Real-Time Messaging Protocol over TLS / Secure Reliable Transport: broadcaster ingest, not viewer HLS/DASH. Stream SRT uses caller mode. |
| Captions / subtitles / WebVTT / AI | Timed speech and relevant sounds / dialogue or translation / Web Video Text Tracks cue file / generated draft needing human review. Thai upload support does not imply Thai AI generation. |
| Player / embed / iframe / SDK | Playback software / placing it in a page / embedded document frame / integration tools. Managed/custom integrations have different ownership. |
| Clipping / downloads | New video from a time interval / encoded MP4 or M4A export. Export is not the exact source or full managed ABR service. |
| Analytics / webhook / player event | Aggregate viewing metrics / server HTTP notification / client playback signal. Verify webhook authenticity; none establishes university identity/completion. |
| Minutes Stored / Delivered | Retained duration / aggregated viewing delivery. Not GB, unique viewers or guaranteed hard caps. |

References: [MDN containers](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers), [video codecs](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs), [adaptive streaming](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Audio_and_video_delivery/Setting_up_adaptive_streaming_media_sources), [Stream](https://developers.cloudflare.com/stream/), [captions](https://developers.cloudflare.com/stream/edit-videos/adding-captions/).

### Shared interfaces and storage

| Term | Meaning |
|---|---|
| Dashboard / API / SDK | Human graphical interface / Application Programming Interface for software / Software Development Kit integration tools. |
| HTTP / HTTPS / URL / TLS | Hypertext Transfer Protocol / HTTP protected by Transport Layer Security / Uniform Resource Locator / transport protection. |
| Batch API / serverless function | Batch-token image operations / code on provider-managed infrastructure such as Workers. Physical servers still exist. |
| Data center / PoP / globally distributed | Networked-computer facility / Point of Presence / components across locations. Coverage does not prove every original's storage location. |
| Direct Creator / one-time upload URL | Limited ingestion permission without exposing management credentials; not private-viewing access. |
| API key / token / signed URL / expiry | Credentials or capabilities / limited signed access / time boundary. Authorize the viewer before issuance; links can be shared/reused while valid and are not DRM. |
| Object / bucket / key | Bytes and metadata / collection / exact identifier. Slash prefixes are not filesystem directories or separate permissions. |
| Amazon S3 / S3-compatible API | Simple Storage Service / implementation of supported S3 operations, not every AWS feature or arbitrary importer compatibility. |
| Public bucket / presigned URL / CORS | Public delivery / temporary signed S3 request / browser cross-origin policy, not identity. R2 presigning uses the S3 host, not a public domain. |
| Multipart upload | Create an upload ID, send numbered parts, complete or abort. Not Stream tus or migration. |
| Bulk import / bulk migration / incremental migration | Collection copied into Images / planned R2 copy / read-driven missing-object copy. Super Slurper handles bulk; Sippy is not continuous synchronization. |
| Zero egress / GB / TB | No R2 outbound bandwidth fee / gigabytes / terabytes. Storage and operations can cost money; contractual sizes need explicit byte definitions. |
| Images Stored / Delivered | Retained originals / deliveries. Named variants do not add stored originals; remote unique transformations are a different meter. |

References: [Images methods](https://developers.cloudflare.com/images/storage/upload-images/methods/), [Stream security](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/), [R2 objects](https://developers.cloudflare.com/r2/objects/), [presigning](https://developers.cloudflare.com/r2/api/s3/presigned-urls/), [migration](https://developers.cloudflare.com/r2/data-migration/).
