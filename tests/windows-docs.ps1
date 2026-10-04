# Offline verification only: mock every cloud transport; never use real credentials.
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

function Assert-Lab {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw $Message }
}

function Get-CodeBlocks {
    param([string]$File)
    $text = [IO.File]::ReadAllText((Join-Path $root $File), [Text.Encoding]::UTF8)
    return @([regex]::Matches($text, '(?ms)^```powershell\r?\n(.*?)^```\s*$') | ForEach-Object { $_.Groups[1].Value })
}

function Import-DocumentedFunction {
    param([string]$File, [string]$Name)
    foreach ($code in (Get-CodeBlocks $File)) {
        $tokens = $null
        $parseErrors = $null
        $ast = [Management.Automation.Language.Parser]::ParseInput($code, [ref]$tokens, [ref]$parseErrors)
        $definition = $ast.Find({ param($node)
            $node -is [Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq $Name
        }, $true)
        if ($definition) { return [scriptblock]::Create($definition.Extent.Text) }
    }
    throw "Documented function not found: $Name"
}

$count = 0
foreach ($file in (Get-ChildItem (Join-Path $root 'docs') -Filter '*.md')) {
    foreach ($code in (Get-CodeBlocks (Join-Path 'docs' $file.Name))) {
        $tokens = $null
        $parseErrors = $null
        $null = [Management.Automation.Language.Parser]::ParseInput($code, [ref]$tokens, [ref]$parseErrors)
        if ($parseErrors.Count) { throw ("Invalid PowerShell in {0}: {1}" -f $file.Name, ($parseErrors.Message -join '; ')) }
        $count++
    }
}
Write-Output "PASS $count documented PowerShell blocks parse"

. (Import-DocumentedFunction 'docs/windows.md' 'Invoke-CfApi')
. (Import-DocumentedFunction 'docs/03-r2.md' 'Invoke-R2Cli')

# Shadow all transports used by the helpers, so these tests cannot reach the cloud.
$script:response = @{ success = $true; errors = @(); result = @{ uid = 'owned-video' } }
$script:requestFails = $false
function Invoke-RestMethod {
    param($Uri, $Method, $Headers, $ContentType, $Body)
    $script:lastRequest = @{ Uri = $Uri; Method = $Method; Headers = $Headers; ContentType = $ContentType; Body = $Body }
    if ($script:requestFails) { throw 'Mock HTTP failure' }
    return $script:response
}
$script:curlExit = 0
function curl.exe {
    $script:lastCurl = @($args)
    $global:LASTEXITCODE = $script:curlExit
    return ($script:response | ConvertTo-Json -Depth 10 -Compress)
}
$script:awsExit = 0
$script:awsReplies = @()
$script:awsCalls = @()
function aws {
    $script:awsCalls += ,@($args)
    $global:LASTEXITCODE = $script:awsExit
    $reply = $script:awsReplies[0]
    $script:awsReplies = @($script:awsReplies | Select-Object -Skip 1)
    return ($reply | ConvertTo-Json -Depth 10 -Compress)
}

$env:CF_BASE = 'https://api.cloudflare.com/client/v4/accounts/offline-account'
$env:CF_API_TOKEN = 'offline-test-token'
$env:PAIR_PREFIX = 'pair07'
$unicodeName = 'Unicode: ' + [char]0x00E9
$result = Invoke-CfApi -Method POST -Path '/stream/owned-video' -Body @{
    uid = 'owned-video'; requireSignedURLs = $true; meta = @{ name = $unicodeName }
}
$json = [Text.Encoding]::UTF8.GetString($script:lastRequest.Body) | ConvertFrom-Json
Assert-Lab ($result.success -and $json.requireSignedURLs -eq $true) 'REST body/result mismatch'
Assert-Lab ($json.meta.name -eq $unicodeName) 'JSON must retain UTF-8 text'
Assert-Lab ($script:lastRequest.Uri -eq "$env:CF_BASE/stream/owned-video") 'Wrong REST endpoint'
Assert-Lab ($script:lastRequest.Headers.Authorization -eq 'Bearer offline-test-token') 'Missing Bearer header'
$null = Invoke-CfApi -Method PUT -Path '/stream/owned-video/captions/en' -FilePath './samples/captions-en.vtt'
Assert-Lab ($script:lastCurl -contains '--form') 'File upload must be multipart'
Assert-Lab ($script:lastCurl -contains ('file=@' + (Resolve-Path './samples/captions-en.vtt').Path)) 'Wrong multipart file path'
$script:curlExit = 22
$blocked = $false
try { $null = Invoke-CfApi -Method POST -Path '/stream' -FilePath './samples/sample-video.mp4' }
catch { $blocked = $true }
Assert-Lab $blocked 'Native curl failure must stop the flow'
$script:curlExit = 0
$script:response = @{ success = $false; errors = @(@{ code = 1000; message = 'offline error' }) }
$blocked = $false
try { $null = Invoke-CfApi -Path '/stream/owned-video' } catch { $blocked = $true }
Assert-Lab $blocked 'REST success=false must stop the flow'
$script:requestFails = $true
$blocked = $false
try { $null = Invoke-CfApi -Path '/stream/owned-video' } catch { $blocked = $true }
Assert-Lab $blocked 'HTTP failure must stop the flow'
Write-Output 'PASS documented REST JSON/multipart paths, UTF-8 and failure gates (mock transport)'

$imageBlocks = Get-CodeBlocks 'docs/01-images.md'
$hmacBlock = $imageBlocks | Where-Object { $_ -match '\$signingInput\s*=' }
$hmacCode = [regex]::Match($hmacBlock, '(?s)\$signingInput\s*=.*?(?=\r?\n\r?\ncurl\.exe)').Value
Assert-Lab ([bool]$hmacCode) 'Native HMAC code missing'
$imageUri = [Uri]'https://imagedelivery.net/hash/image/pair07-detail'
$expiresAt = 1700000060
$env:CF_IMAGES_SIGNING_KEY = 'offline-signing-key'
$null = . ([scriptblock]::Create($hmacCode))
# Independently calculated with Node crypto.createHmac for this fixed vector.
$expectedSignature = '1d14f1ed5568877e3ed69cd52bd1ab02e7bf743043148f43a00395dfe97e0262'
Assert-Lab ($signedImageUrl -eq "https://imagedelivery.net/hash/image/pair07-detail?exp=1700000060&sig=$expectedSignature") 'Images HMAC does not match independent test vector'

$script:requestFails = $false
$script:response = @{ success = $true; errors = @(); result = @{ token = 'header.payload.signature' } }
$env:CF_VIDEO_UID = 'owned-video'
$iframeUri = [Uri]'https://customer-example.cloudflarestream.com/owned-video/iframe?muted=true'
function Set-Clipboard { param($Value) $script:clipboard = $Value }
$streamBlocks = Get-CodeBlocks 'docs/02-stream.md'
$iframeBlock = $streamBlocks | Where-Object { $_ -match '\$signedIframe\s*=' }
$null = . ([scriptblock]::Create($iframeBlock))
Assert-Lab ($script:clipboard -eq 'https://customer-example.cloudflarestream.com/header.payload.signature/iframe?muted=true') 'Private iframe must retain host/path/query'
Write-Output 'PASS documented native Images HMAC and private Stream iframe substitution (offline)'

$env:R2_ENDPOINT = 'https://offline-account.r2.cloudflarestorage.com'
$env:R2_BUCKET = 'offline-bucket'
$env:AWS_ACCESS_KEY_ID = 'offline-access-key'
$env:AWS_SECRET_ACCESS_KEY = 'offline-secret'
$script:awsReplies = @(@{ ContentLength = 20 })
$metadata = Invoke-R2Cli -ArgumentList @('s3api', 'head-object', '--bucket', $env:R2_BUCKET, '--key', 'pair07/video.mp4')
Assert-Lab ($metadata.ContentLength -eq 20) 'S3 JSON result not parsed'
Assert-Lab ($script:awsCalls[0] -contains $env:R2_ENDPOINT) 'Missing R2 endpoint'
Assert-Lab ($script:awsCalls[0] -contains 'auto') 'Missing R2 signing region'
$script:awsExit = 1
$script:awsReplies = @(@{ Error = 'offline error' })
$blocked = $false
try { $null = Invoke-R2Cli -ArgumentList @('s3api', 'head-object') } catch { $blocked = $true }
Assert-Lab $blocked 'AWS CLI nonzero exit must stop the flow'
$script:awsExit = 0
Write-Output 'PASS documented R2 wrapper endpoint/region/JSON and failure gate (mock transport)'

$runFolder = Join-Path ([IO.Path]::GetTempPath()) ('media docs offline ' + [Guid]::NewGuid().ToString('N'))
$null = New-Item -ItemType Directory -Path $runFolder
try {
    $multipartBlocks = Get-CodeBlocks 'docs/05-r2-windows.md'
    $null = . ([scriptblock]::Create($multipartBlocks[1]))
    Assert-Lab ((Get-Item $sourcePath).Length -eq 12582912) 'Fixture must be exactly 12 MiB'
    $joinedHash = [Security.Cryptography.SHA256]::Create()
    try {
        foreach ($number in 1..3) {
            $bytes = [IO.File]::ReadAllBytes((Join-Path $runFolder "part-$number.bin"))
            $expectedSize = @(5242880, 5242880, 2097152)[$number - 1]
            Assert-Lab ($bytes.Length -eq $expectedSize) 'Incorrect part sizes'
            $null = $joinedHash.TransformBlock($bytes, 0, $bytes.Length, $bytes, 0)
        }
        $null = $joinedHash.TransformFinalBlock([byte[]]@(), 0, 0)
        $reassembledHash = [BitConverter]::ToString($joinedHash.Hash).Replace('-', '')
        Assert-Lab ($reassembledHash -eq $sourceHash) 'Ordered parts must reassemble to source hash'
    } finally { $joinedHash.Dispose() }

    $multipartKey = 'pair07/multipart-sample.bin'
    $uploadId = 'offline-upload'
    $completedParts = @(@{ PartNumber = 3; ETag = '"tag-3"' }, @{ PartNumber = 1; ETag = '"tag-1"' }, @{ PartNumber = 2; ETag = '"tag-2"' })
    $script:awsCalls = @()
    $script:awsReplies = @(@{ Key = $multipartKey; Bucket = $env:R2_BUCKET }, @{ ContentLength = 12582912 })
    $completionBlock = $multipartBlocks | Where-Object { $_ -match '\$completionJson\s*=' }
    $null = . ([scriptblock]::Create($completionBlock))
    $completion = [IO.File]::ReadAllText($completionPath) | ConvertFrom-Json
    Assert-Lab (($completion.Parts.PartNumber -join ',') -eq '1,2,3') 'Completion JSON must order parts'
    Assert-Lab ($completion.Parts[0].ETag -eq '"tag-1"') 'Completion JSON must preserve ETag quotes'
    $encoded = [IO.File]::ReadAllBytes($completionPath)
    Assert-Lab ($encoded[0] -eq 123) 'Completion JSON must be UTF-8 without BOM'
    Assert-Lab ($script:awsCalls[0] -contains "file://$completionPath") 'Path containing spaces must be one CLI argument'
    Write-Output 'PASS documented 12 MiB fixture, 5/5/2 MiB reassembly and ordered UTF-8 completion file (offline)'
} finally {
    Remove-Item -LiteralPath $runFolder -Recurse -Force
    'CF_API_TOKEN','CF_IMAGES_SIGNING_KEY','AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY' | ForEach-Object { Remove-Item "Env:$_" -ErrorAction SilentlyContinue }
}
