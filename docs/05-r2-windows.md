# Windows R2 multipart — AWS CLI + PowerShell, step by step

**Optional advanced/instructor exercise.** Complete [R2 Windows AWS CLI setup](03-r2.md#windows-powershell--aws-cli-option), including `Invoke-R2Cli`, the dedicated private bucket and Object Read & Write S3 credentials. No Python, npm or WSL is needed. The 12 MiB fixture teaches explicit multipart operations; a production 12 MiB object does not need multipart.

Run from the extracted repository root. Keep the original source untouched. Record each owned key/upload ID in the [worksheet](worksheet.md). S3 responses are not Cloudflare REST `success` envelopes.

## 1. Prepare a new owned key and fresh local output folder

1. In **Dashboard → R2 → your bucket → Objects**, check that `<pair-prefix>/multipart-sample.bin` does not already exist. If it exists from a previous run, use a new prefix/key; do not overwrite it.
2. Record the exact bucket/key before creating an upload.
3. Run this setup once. A fresh timestamped directory separates this run's evidence:

```powershell
if (-not $env:R2_BUCKET -or -not $env:PAIR_PREFIX) { throw 'Set the dedicated bucket and unique prefix first.' }
$multipartKey = "$env:PAIR_PREFIX/multipart-sample.bin"
$runFolder = Join-Path $PWD ("lab-output\" + $env:PAIR_PREFIX + '-multipart-' + [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss'))
if (Test-Path -LiteralPath $runFolder) { throw 'Run folder already exists; choose a new run.' }
$null = New-Item -ItemType Directory -Path $runFolder
```

## 2. Generate exactly 12 MiB and split 5/5/2 MiB

Non-final parts must be at least 5 MiB and equal in size. This local deterministic pattern is for teaching, not customer data:

```powershell
$data = New-Object byte[] (12 * 1024 * 1024)
$block = New-Object byte[] 4096
for ($i = 0; $i -lt $block.Length; $i++) { $block[$i] = [byte]($i % 256) }
for ($offset = 0; $offset -lt $data.Length; $offset += $block.Length) {
    [Buffer]::BlockCopy($block, 0, $data, $offset, $block.Length)
}
$sourcePath = Join-Path $runFolder 'multipart-source.bin'
[IO.File]::WriteAllBytes($sourcePath, $data)
$partSizes = @((5 * 1024 * 1024), (5 * 1024 * 1024), (2 * 1024 * 1024))
$offset = 0
for ($partNumber = 1; $partNumber -le 3; $partNumber++) {
    $part = New-Object byte[] ($partSizes[$partNumber - 1])
    [Buffer]::BlockCopy($data, $offset, $part, 0, $part.Length)
    [IO.File]::WriteAllBytes((Join-Path $runFolder "part-$partNumber.bin"), $part)
    $offset += $part.Length
}
Get-ChildItem -LiteralPath $runFolder | Select-Object Name, Length
$sourceHash = (Get-FileHash $sourcePath -Algorithm SHA256).Hash
$sourceHash
```

Expect **12,582,912** source bytes and **5,242,880 /5,242,880 /2,097,152** part bytes. Record your measured hash. Do not rerun this block against an existing run's files; start a fresh run instead.

## 3. Create the upload and immediately record its ID

```powershell
$created = Invoke-R2Cli -ArgumentList @('s3api', 'create-multipart-upload', '--bucket', $env:R2_BUCKET,
    '--key', $multipartKey, '--content-type', 'application/octet-stream')
$uploadId = [string]$created.UploadId
if (-not $uploadId -or $created.Key -ne $multipartKey -or $created.Bucket -ne $env:R2_BUCKET) {
    throw 'Creation did not return the expected bucket/key/upload ID; inspect before continuing.'
}
$created | Select-Object Bucket, Key, UploadId
```

Record the upload ID before the next call. Do not repeat creation after an uncertain response without checking owned uploads. If the exercise fails, use **step 7's scoped abort**, not a new upload or bucket-wide cleanup.

## 4. Upload numbered parts and retain the returned ETags

```powershell
$completedParts = @()
for ($partNumber = 1; $partNumber -le 3; $partNumber++) {
    $partPath = Join-Path $runFolder "part-$partNumber.bin"
    $partResult = Invoke-R2Cli -ArgumentList @('s3api', 'upload-part', '--bucket', $env:R2_BUCKET,
        '--key', $multipartKey, '--upload-id', $uploadId, '--part-number', [string]$partNumber, '--body', $partPath)
    if (-not $partResult.ETag) { throw "Part $partNumber did not return an ETag." }
    $completedParts += @{ PartNumber = $partNumber; ETag = [string]$partResult.ETag }
    $completedParts[-1] | Format-Table PartNumber, ETag
}
```

If a part fails, stop and retain the successful part records. Retry only the failed part number with the same bytes, then add/update that part's ETag. Do not rerun the whole loop and mistake its fresh local array for preserved evidence. For a first classroom attempt, scoped abort/restart is simpler than manual resume. Dashboard Objects will not yet show a completed object.

Inspect the server's actual part list:

```powershell
$partList = Invoke-R2Cli -ArgumentList @('s3api', 'list-parts', '--bucket', $env:R2_BUCKET,
    '--key', $multipartKey, '--upload-id', $uploadId)
$partList.Parts | Select-Object PartNumber, Size, ETag
```

Require all three expected numbers/sizes and matching ETags before completion. ETags are completion references, not a source SHA-256.

## 5. Complete with ordered JSON from a UTF-8 file

Using a file avoids Windows native-command JSON quoting issues and PowerShell 5.1's default UTF-16 redirection. Preserve the returned ETag quotes via `ConvertTo-Json`:

```powershell
if ($completedParts.Count -ne 3) { throw 'Three successful part records are required.' }
$orderedParts = @($completedParts | Sort-Object { $_.PartNumber })
if (($orderedParts.PartNumber -join ',') -ne '1,2,3') { throw 'Part numbers must be 1,2,3.' }
$completionPath = Join-Path $runFolder 'complete.json'
$completionJson = @{ Parts = $orderedParts } | ConvertTo-Json -Depth 5 -Compress
[IO.File]::WriteAllText($completionPath, $completionJson, [Text.UTF8Encoding]::new($false))
$completed = Invoke-R2Cli -ArgumentList @('s3api', 'complete-multipart-upload', '--bucket', $env:R2_BUCKET,
    '--key', $multipartKey, '--upload-id', $uploadId, '--multipart-upload', "file://$completionPath")
if ($completed.Key -ne $multipartKey -or $completed.Bucket -ne $env:R2_BUCKET) {
    throw 'Completion result does not match the recorded bucket/key.'
}
$completed | Select-Object Bucket, Key, ETag
$objectInfo = Invoke-R2Cli -ArgumentList @('s3api', 'head-object', '--bucket', $env:R2_BUCKET, '--key', $multipartKey)
if ($objectInfo.ContentLength -ne 12582912) { throw 'Completed object has an unexpected byte count.' }
$objectInfo | Select-Object ContentLength, ContentType, ETag
```

AWS CLI checks S3 completion errors; successful part uploads alone are not completion. Refresh **Dashboard → your bucket → Objects → exact key** and verify **12,582,912 bytes**.

## 6. Download and independently hash actual bytes

```powershell
$downloadPath = Join-Path $runFolder 'multipart-downloaded.bin'
if (Test-Path -LiteralPath $downloadPath) { throw 'Choose a fresh download path.' }
$downloaded = Invoke-R2Cli -ArgumentList @('s3api', 'get-object', '--bucket', $env:R2_BUCKET,
    '--key', $multipartKey, $downloadPath)
$downloadHash = (Get-FileHash $downloadPath -Algorithm SHA256).Hash
Get-Item $sourcePath, $downloadPath | Select-Object Name, Length
Get-FileHash -LiteralPath $sourcePath, $downloadPath -Algorithm SHA256
if ((Get-Item $downloadPath).Length -ne 12582912 -or $sourceHash -ne $downloadHash) {
    throw 'Actual downloaded bytes do not match the source.'
}
```

Record equal source/downloaded hashes and sizes, upload ID, part evidence and completion result. You have now exercised actual multipart; a GUI-only upload would not provide this part-number/completion evidence.

## 7. Abort an unfinished upload OR delete a completed object

For failure **before successful completion**, abort only the recorded key/upload ID:

```powershell
$aborted = Invoke-R2Cli -ArgumentList @('s3api', 'abort-multipart-upload', '--bucket', $env:R2_BUCKET,
    '--key', $multipartKey, '--upload-id', $uploadId)
```

For a **successfully completed** upload, use object deletion instead:

```powershell
$deleted = Invoke-R2Cli -ArgumentList @('s3api', 'delete-object', '--bucket', $env:R2_BUCKET, '--key', $multipartKey)
```

Do not run both blindly. If completion's network result was uncertain, inspect the exact object's metadata and the recorded upload before deciding. Refresh the Dashboard and record cleanup; leave other uploads, objects and lifecycle settings alone. Clear [Windows session credentials](windows.md#finish-and-clear-this-session).

Sources: [R2 multipart limits](https://developers.cloudflare.com/r2/objects/upload-objects/), [R2 S3 compatibility](https://developers.cloudflare.com/r2/api/s3/api/), [AWS CLI create](https://docs.aws.amazon.com/cli/latest/reference/s3api/create-multipart-upload.html), [upload part](https://docs.aws.amazon.com/cli/latest/reference/s3api/upload-part.html), [complete](https://docs.aws.amazon.com/cli/latest/reference/s3api/complete-multipart-upload.html), [abort](https://docs.aws.amazon.com/cli/latest/reference/s3api/abort-multipart-upload.html).
