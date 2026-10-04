# Windows quick start — browser, PowerShell and API

Use **Windows 10/11 + Edge or Chrome**. The core route does not need Node.js, npm, Git, WSL or administrator access to your PC. Use **Windows PowerShell 5.1** or **PowerShell 7** for the commands on this page and the Windows sections of each lab. Do not paste Bash blocks into PowerShell or Command Prompt.

## 1. Choose your route

| Route | What you need | Start here |
|---|---|---|
| Dashboard first | Browser; Cloudflare product access; PowerShell only for file hashes | [Account setup](setup.md), then the numbered Images/Stream/R2 click paths |
| Windows REST/API | PowerShell; `curl.exe` 7.76+ for file uploads; Images/Stream API token | Complete steps 2–5 below, then the **Windows PowerShell/API** section in each lab |
| Windows R2 CLI | PowerShell; optional AWS CLI v2; dedicated bucket's S3 credentials | [R2 Windows CLI](03-r2.md#windows-powershell--aws-cli-option) and [manual multipart](05-r2-windows.md) |
| macOS/Linux/WSL | Bash and curl; optional Python/AWS CLI | Existing Bash sections and [raw S3 multipart](04-r2-api.md) |

The Stream core lab includes caption/access API calls if the Dashboard does not expose them. A paired authorized instructor can run those calls while browser-only participants verify actual playback and record **instructor demonstration**. Choose one route per operation to avoid duplicate uploads or variant creation.

## 2. Download and find the samples

1. Open the [repository](https://github.com/pongpisit/cloudflare-media-labs) in your browser.
2. Select the green **Code** button → **Download ZIP**.
3. In File Explorer → **Downloads**, right-click the ZIP → **Extract All** → **Extract**.
4. Open the extracted `cloudflare-media-labs-main` folder. It contains `README.md`, `docs`, and `samples`.
5. Open `samples`: preview `sample-image.jpg`, play `sample-video.mp4` with sound, and open `captions-en.vtt` in Notepad. The captions match the 20-second synthetic video.
6. Copy [the worksheet](worksheet.md) into a private local document. Choose a unique lowercase prefix, for example `media-pair07-20261004`.

Open **Start → Windows PowerShell** (or Windows Terminal → a PowerShell profile). Set your actual extracted path; spaces are allowed when quoted:

```powershell
Set-Location "$HOME\Downloads\cloudflare-media-labs-main"
Get-Location
Get-Item .\samples\sample-image.jpg, .\samples\sample-video.mp4, .\samples\captions-en.vtt
$PSVersionTable.PSVersion
curl.exe --version
```

If your folder is nested, use File Explorer's address bar to copy its full path and pass it to `Set-Location`. Use **`curl.exe`**, not `curl`: Windows PowerShell can alias `curl` to `Invoke-WebRequest`. Only multipart file-upload examples need curl 7.76+ (`--fail-with-body`); JSON REST calls below use built-in PowerShell. If the version is older or the command is missing, use the Dashboard upload or an authorized REST client/instructor.

## 3. Select the account and create a REST token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → sign in/MFA → select the workshop account.
2. Find its **Account ID** using the [official account-ID instructions](https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/). Copy the 32-character account ID, not a Zone ID or Images delivery hash.
3. Profile/avatar → **My Profile → API Tokens → Create Token → Create Custom Token**. If labels move, use the [API token page](https://dash.cloudflare.com/profile/api-tokens).
4. Name it with your workshop prefix. Add **Account → Cloudflare Images → Edit** and/or **Account → Stream → Edit**, only for the labs you will operate. API docs sometimes call these Write permissions.
5. Under **Account Resources**, choose **Include → Specific account → your workshop account**. Review effective permissions with the instructor; a token cannot grant access your identity lacks.
6. Set an appropriate workshop expiry if offered → review summary → create. Copy the token privately to your password manager. Do not put it in the worksheet.

Set the non-secret values, then enter the token in a hidden prompt. Variables live only in this PowerShell session:

```powershell
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$env:CF_ACCOUNT_ID = 'REPLACE_WITH_YOUR_32_CHARACTER_ACCOUNT_ID'
$env:PAIR_PREFIX = 'REPLACE_WITH_YOUR_UNIQUE_PREFIX'
if ($env:CF_ACCOUNT_ID -notmatch '^[a-fA-F0-9]{32}$') { throw 'Replace the Account ID placeholder first.' }
if ($env:PAIR_PREFIX -notmatch '^[a-z0-9][a-z0-9-]{2,50}$') { throw 'Use a unique lowercase prefix, 3-51 characters.' }
$env:CF_BASE = "https://api.cloudflare.com/client/v4/accounts/$env:CF_ACCOUNT_ID"

function Read-LabSecret {
    param([string]$Prompt)
    $secure = Read-Host $Prompt -AsSecureString
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
        $secure.Dispose()
    }
}
$env:CF_API_TOKEN = Read-LabSecret 'Cloudflare Images/Stream API token'
```

## 4. Paste this REST helper once

This is a small **local PowerShell function**, not a deployed service or an npm tool. It uses native REST calls for JSON and `curl.exe` for multipart files. It stops on HTTP/API errors and returns the response object for selective inspection. Do not enable PowerShell transcription while entering credentials or inspecting signed capabilities.

```powershell
function Invoke-CfApi {
    param(
        [ValidateSet('GET','POST','PUT','PATCH','DELETE')][string]$Method = 'GET',
        [Parameter(Mandatory = $true)][string]$Path,
        [hashtable]$Body,
        [string]$FilePath
    )
    if (-not $env:CF_BASE -or -not $env:CF_API_TOKEN) { throw 'Complete Windows REST setup first.' }
    if (-not $Path.StartsWith('/')) { throw 'Use an account-relative path beginning with /.' }
    $uri = "$env:CF_BASE$Path"
    if ($FilePath) {
        if ($Body) { throw 'Use either a JSON body or a multipart file.' }
        $file = (Resolve-Path -LiteralPath $FilePath).Path
        $curlArgs = @('--fail-with-body', '--silent', '--show-error', '--request', $Method,
            $uri, '--header', "Authorization: Bearer $env:CF_API_TOKEN", '--form', "file=@$file")
        $raw = & curl.exe @curlArgs
        if ($LASTEXITCODE -ne 0) { throw 'File request failed. Inspect the private error response and stop.' }
        $response = ($raw -join "`n") | ConvertFrom-Json
    } else {
        $request = @{ Uri = $uri; Method = $Method; Headers = @{ Authorization = "Bearer $env:CF_API_TOKEN" } }
        if ($null -ne $Body) {
            $request.ContentType = 'application/json'
            $request.Body = [Text.Encoding]::UTF8.GetBytes(($Body | ConvertTo-Json -Depth 10 -Compress))
        }
        $response = Invoke-RestMethod @request
    }
    if ($response.success -ne $true -or @($response.errors).Count -gt 0) {
        throw 'Cloudflare API rejected the request. Inspect errors privately; do not continue.'
    }
    return $response
}
```

Then continue with [Images](01-images.md#windows-powershellapi-option), [Stream](02-stream.md#windows-powershellapi-option), or [R2](03-r2.md#windows-powershell--aws-cli-option). In a new terminal, repeat setup and paste the helper again. No automatic retry or cleanup is performed.

## 5. HTTP status checks on Windows

Expiry tests use **fresh GETs**, not a cached browser tab or a buffered video. `NUL` discards the body on Windows. Do not add `--fail-with-body` here: denial is an expected observation.

```powershell
# Replace with your actual public/unsigned URL, or a private variable holding a limited URL.
$testUrl = Read-Host 'URL to test privately'
curl.exe --silent --show-error --output NUL --write-out '%{http_code}\n' $testUrl
if ($LASTEXITCODE -ne 0) { throw 'Network/TLS failure: 000 is not an access-policy result.' }
```

## Optional REST-client route

Use an organization-approved REST client instead of a terminal if preferred:

1. Create a private/local environment with `CF_BASE`, `CF_API_TOKEN`, and the recorded image/video ID. Avoid shared or cloud-synced credential environments.
2. Set the method and account-relative path from the lab's API examples.
3. Set **Authorization → Bearer Token** to your token.
4. JSON requests: **Body → raw → JSON**, use the field values shown in the PowerShell hashtable, and set `Content-Type: application/json`.
5. File requests: **Body → form-data → key `file` → type File** → choose the sample. Let the client generate the multipart Content-Type/boundary.
6. Send once. Check HTTP status and `success: true` with an empty `errors` array; record only the necessary fields.

For the exact Stream request matrix, see [its Windows section](02-stream.md#windows-powershellapi-option). R2 object operations use **S3 SigV4**, not this Bearer setup.

## Finish and clear this session

First finish each lab's owned-resource cleanup. Clear the workshop preview. Revoke only the token/keys issued for this workshop when no longer needed. Then clear session variables and close the terminal:

```powershell
'CF_API_TOKEN','CF_IMAGES_SIGNING_KEY','AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY',
'AWS_SESSION_TOKEN','AWS_SECURITY_TOKEN','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY' |
    ForEach-Object { Remove-Item "Env:$_" -ErrorAction SilentlyContinue }
Remove-Variable tokenResponse, playbackToken, signedImageUrl, signedIframeUrl, signedIframe, r2GetUrl, testUrl -ErrorAction SilentlyContinue
Remove-Item Function:\Invoke-CfApi, Function:\Invoke-R2Cli, Function:\Read-LabSecret -ErrorAction SilentlyContinue
```

## Common Windows fixes

| Symptom | Next step |
|---|---|
| `curl` rejects `--form` | Use `curl.exe`, not the PowerShell alias. |
| `\` or `export` is not recognized | You pasted a Bash block. Use the `powershell` blocks and `$env:NAME`. |
| Sample file not found | Check `Get-Location`, then `Get-Item .\samples\sample-video.mp4`; select the extracted root. |
| API 401/403 | Check token expiry, account selection and effective Images/Stream Edit permissions; request instructor help. |
| JSON body errors | Use the helper/`ConvertTo-Json`; do not manually escape JSON for native curl on Windows. |
| `aws` not found after installation | Close/reopen PowerShell, then `aws --version`; repeat session setup. |
| `000`/certificate or proxy error | Check Windows date/time, network/proxy and organizational TLS trust. Do not bypass TLS verification. |

References: [PowerShell REST](https://learn.microsoft.com/powershell/module/microsoft.powershell.utility/invoke-restmethod), [API tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/), [AWS CLI v2 Windows installer](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions).
