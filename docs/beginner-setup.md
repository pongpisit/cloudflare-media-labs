# First-time setup — account and API credentials

Start with an account you are allowed to use. Everyone follows the setup explanation; an **authorized administrator/instructor** creates API credentials. The browser Images/Stream/R2 labs work without API keys or commands. A management API token is not a playback token or a signed download link.

## 1. Select the account and check product access

**Do this**

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com/), sign in and select the workshop account named by the instructor. Check the account name again after any product shortcut.
2. Open Dashboard **Search** with **Ctrl+K** (Mac: **Command+K**). Enter **Copy account ID** and select that result. Paste the ID into your local worksheet; do not substitute a Zone ID, Images delivery hash or media ID.
3. Open [Hosted Images](https://dash.cloudflare.com/?to=/:account/images/hosted), [Stream Videos](https://dash.cloudflare.com/?to=/:account/stream/videos) and [R2 Overview](https://dash.cloudflare.com/?to=/:account/r2/overview). Ask the instructor to confirm Images hosted storage, Stream upload capacity and R2 activation, plus your allowed create/upload/delete actions.
4. Download the four samples and copy folder, bucket, card and detail names using [Beginner start](beginner-start.md). Record the names before creating resources; refreshing the tools generates a different label.

**You should see:** the approved account and usable product pages; the four samples open locally. Viewing a product page is not proof of write access or available capacity.

**If it does not work:** ask the instructor to arrange membership, activation or capacity. Only an authorized account owner handles product purchase/activation. Do not create another plan or use a production workspace.

## 2. Create scoped REST API access

**Who does this:** the authorized operator, only when an API demonstration needs it. Publishers watch the procedure and continue with browser labs. Create a separate, clearly named product token rather than granting unrelated permissions.

**Do this**

1. Open **My Profile → API Tokens** ([user token page](https://dash.cloudflare.com/profile/api-tokens/)). Select **Create Token**, then the **custom token** option.
2. Give it a descriptive name such as your lab label plus `images` or `stream`.
3. Under **Permissions**, choose the **Account** category and the product required by the demonstration:

   | Demonstration | Required write permission |
   |---|---|
   | Images upload/variant/change/delete | **Cloudflare Images → Edit** |
   | Stream upload/captions/change/token/delete | **Stream → Edit** |

   The permission reference also uses **Images Write / Stream Write**. Select only what the approved workflow needs. **Read** cannot upload or change resources; token permissions cannot exceed the operator's underlying account access. These product grants are account-wide, not assumed limited to one image/video.
4. Under **Account Resources**, choose **Include → Specific account → the approved workshop account**. Do not grant all accounts. Set the **TTL/expiry** to the instructor-approved workshop period.
5. Select **Continue to summary**. Check the name, product, permission, exact account and expiry. Correct mistakes before selecting **Create Token**.
6. Store the **once-shown secret** directly in the authorized operator's password manager/trusted tool. Never paste it into the workshop webpage, worksheet, projected screen, Git or a URL. If it is lost, revoke that token and create a replacement; do not copy a different user's credential.
7. Use the retained [Windows/API reference](windows.md) privately to make a permitted **read-only list request** to the intended Images/Stream account endpoint. Inspect HTTP success and the API success/error result. A listed/active token alone does not establish product permission or a successful endpoint call.

**You should see:** the exact intended scope in the summary and a successful authorized read-only response. Record only token name, product/account scope, expiry, creator and verification outcome—not the secret or response body containing capabilities.

**If it does not work:** compare account ID, product permission, TTL and effective membership with the instructor. Do not widen to all accounts as a workaround.

**Account-owned alternative:** durable service integrations can use **Manage account → Account API tokens → Create Token**. This requires **API Token Provisioning capabilities or Super Administrator** status and can grant only a subset of the creator's own permissions. Check current endpoint compatibility; the current matrix supports Images, Stream and R2. User tokens inherit user membership and are the default workshop teaching route.

## 3. Create R2 S3 credentials after the bucket exists

**Who does this:** the authorized operator for optional presigning/multipart or S3 tooling. First complete **Create your private bucket** in [Lab 3](beginner-r2.md). Dashboard upload/download requires no S3 keys.

**Do this**

1. Select the same account. Open **R2 object storage → Overview → Account Details → Manage next to API Tokens**.
2. Select **Create User API token**, or **Create Account API token** when the operator has the required provisioning role and account approval. Name it for the group/bucket. User tokens inherit membership; account tokens persist independently until revoked or expired.
3. Choose **Object Read & Write**. Restrict its bucket scope to **only the recorded workshop bucket**, not all buckets. Object-only permissions support S3, not Cloudflare REST; they do not create/configure/delete buckets.
4. Review the scope, then select the corresponding **Create User API token** or **Create Account API token** action. Privately store the **Access Key ID** and **Secret Access Key** in the trusted S3 tool. The Secret Access Key is shown only once. These are separate from the Images/Stream REST bearer token.
5. Set the S3 endpoint for the selected account and bucket jurisdiction: default `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`, or the matching `.eu`, `.us` or `.fedramp` account endpoint. Use the actual Account ID. The client region `auto` does not select jurisdiction.
6. In the operator's trusted S3 client, list objects in the recorded bucket as a **read-only check**. Confirm the permitted response before any optional signing/multipart demonstration. Follow the retained [R2 technical reference](03-r2.md) for the selected client; this is not learner software setup.

**You should see:** only the intended bucket in token scope and a successful read-only object listing. An empty new bucket may return an empty list. Record scope, operator and outcome, never either credential value.

**If it does not work:** check bucket name, allowed operation, underlying role and jurisdiction-specific endpoint. Do not use Admin Read & Write just to fix an object-list request.

## 4. Finish and revoke owned workshop credentials

The creator revokes only their recorded workshop REST/R2 tokens through the same API-token management page after the approved exercises. Leave shared/instructor service credentials intact. Clear secrets from trusted session tools and clear preview links/file selections. Resource cleanup remains in each product lab.

Record the actual creator, scope, expiry, check and revocation status in [My worksheet](beginner-worksheet.md). If the step was not performed, write **not performed** rather than a predicted pass.

Official references, reviewed 5 October 2026: [Account ID](https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/), [create token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/), [permissions](https://developers.cloudflare.com/fundamentals/api/reference/permissions/), [account token roles/compatibility](https://developers.cloudflare.com/fundamentals/api/get-started/account-owned-tokens/), [R2 credentials](https://developers.cloudflare.com/r2/api/tokens/).

**Continue:** [Beginner start](beginner-start.md) → [Images](beginner-images.md) → [Stream](beginner-stream.md) → [R2](beginner-r2.md).
