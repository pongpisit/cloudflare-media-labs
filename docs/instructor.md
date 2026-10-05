# Instructor preparation and technical extensions

The learner route starts at [Beginner start](beginner-start.md). Learners use the browser, downloaded samples, copyable names and local file tools. They do not set environment variables, generate HMAC signatures, install AWS CLI or choose between Bash and PowerShell.

## Prepare before class

1. Select an authorized workshop account with Images Paid storage, Stream capacity and R2 enabled. Check effective learner permissions; prepare billing and owned-resource cleanup.
2. Rehearse **variant creation before image upload** with a learner role. Have learners name/create/configure/save/reopen their definitions. If creation is restricted, create them visibly for the group or provide checked non-public-override definitions; record who created each.
3. Rehearse **R2 Overview → Create bucket → name/location/Standard → Create bucket** with the intended role. Learners create their recorded private group bucket during Lab 3; confirm both public routes off. Prepare a private Standard shared fallback only for restricted roles, explicitly identified in the worksheet. Prefixes are names, not permissions. Delete only the creator's recorded owned empty bucket; never use Empty Bucket on shared storage.
4. Rehearse the 20-second sample MP4, English WebVTT, the Dashboard player and the workshop preview. If caption upload is unavailable in the Dashboard, prepare the Windows API helper and attach captions to each group's owned video on request.
5. Prepare one separate owned demonstration video requiring signed access, plus fresh unsigned/valid/expired request checks. Never change the instructor's demo into a learner cleanup target.
6. Rehearse the workshop's local image-dimensions and SHA-256 tools in the actual classroom browser. These read local files; they do not perform a Cloudflare API call. Learners must select real delivery/download artifacts.
7. Teach [First-time account/REST/R2 credential setup](beginner-setup.md), including product-specific Edit permissions, only the approved account, workshop TTL, once-shown secret handling and intended read-only verification. Provision optional R2 S3 keys only after the bucket exists, Object Read & Write scoped only to that bucket. The authorized operator creates/revokes credentials in trusted tools; participants record creator/scope/outcome, never secrets. Keep the core labs at 110 minutes.

## Facilitate without adding technical homework

| Learner difficulty | Instructor response |
|---|---|
| Cannot find account/product | Fix membership/activation/permissions before repeating steps |
| Cannot create variant | Supply a prepared variant; mark ownership clearly |
| Cannot create bucket | Create the group's bucket visibly or supply the private shared fallback; record creator and cleanup owner |
| Captions button missing | Attach the group's file through the documented API; learner reviews player/text |
| Embed extraction confusing | Copy the iframe `src` together; Dashboard playback remains the core check |
| Processing slow | Wait/check status; use a pre-encoded instructor video with demonstration label |
| Download not found | Use the browser download list and Show in folder; rename the actual copy |
| File mismatch | Inspect selections and repeat the real download, never replace the result with a prediction |

Private Images, Stream access tokens, R2 presigning, live input setup, clipping, webhooks and multipart are demonstrations or follow-up extensions. Choose one per product only if time permits; keep the **35/40/35-minute** lab blocks. An unperformed demonstration stays unperformed in the worksheet.

## Reference routes for authorized technical operators

- [Account and token setup](setup.md)
- [First-time creation walkthrough](beginner-setup.md)
- [Windows PowerShell helper](windows.md#4-paste-this-rest-helper-once)
- [Images API and private signing](01-images.md#windows-powershellapi-option)
- [Stream captions, readiness and private playback](02-stream.md#windows-powershellapi-option)
- [R2 API/presigning](03-r2.md#windows-powershell--aws-cli-option)
- [Windows multipart](05-r2-windows.md) · [Bash raw S3](04-r2-api.md)
- [Detailed theory](00-theory.md) · [Technical evidence worksheet](worksheet.md)

These are the retained technical guides, not required reading for the beginner route. Keep management credentials in the authorized operator's trusted tools. A successful local documentation/browser test does not certify actual account behavior; rehearse the required product operations in the authorized account.
