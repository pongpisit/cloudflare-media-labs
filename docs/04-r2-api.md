# R2 API extension — inspect actual multipart requests

This optional instructor/API route uses **direct S3 HTTP calls**, not npm or a custom backend. Prepare curl 7.76.0+ with `--aws-sigv4` and `--fail-with-body` (verify `curl --help all`), Python 3 standard library, a dedicated private Standard bucket and its Object Read & Write S3 credentials. Run from the extracted repository root. Load credentials privately as in [setup](setup.md); keep them out of evidence.

Set `R2_ENDPOINT`, `R2_BUCKET` and `PAIR_PREFIX` to your actual values. Use the correct jurisdiction endpoint. The following key is ASCII; check in the Dashboard that it does not already exist. Record it **before** starting, and never use another team's key.

```sh
: "${R2_ENDPOINT:?Set endpoint}" "${R2_BUCKET:?Set dedicated bucket}" "${PAIR_PREFIX:?Set unique prefix}"
: "${R2_ACCESS_KEY_ID:?Load S3 key privately}" "${R2_SECRET_ACCESS_KEY:?Load S3 secret privately}"
export MULTIPART_KEY="$PAIR_PREFIX/multipart-sample.bin"
OBJECT_URL="$R2_ENDPOINT/$R2_BUCKET/$MULTIPART_KEY"
```

curl uses SigV4 scope **auto/s3**. These are S3 XML responses, not Cloudflare REST `success` envelopes. The `UNSIGNED-PAYLOAD` header is signed and supported for S3 payload handling. Do not substitute a general Cloudflare bearer token.

## 1. Generate a local 12 MiB source and three parts

```sh
python3 - <<'PY'
from pathlib import Path
import hashlib
out = Path('lab-output')
out.mkdir(exist_ok=True)
data = bytes(range(256)) * (12 * 1024 * 1024 // 256)
files = {'multipart-source.bin': data,
         'part-1.bin': data[:5*1024*1024],
         'part-2.bin': data[5*1024*1024:10*1024*1024],
         'part-3.bin': data[10*1024*1024:]}
for name, body in files.items():
    with (out / name).open('xb') as f:
        f.write(body)
print(len(data), hashlib.sha256(data).hexdigest())
PY
```

Files are created exclusively; an existing name stops the generator rather than overwriting. Use a fresh output directory for a new run. This fixture is deliberately 5/5/2 MiB; multipart is not required for a 12 MiB production object. Record the source hash, not an assumed constant from another fixture generator.

## 2. Create the multipart upload

```sh
curl --fail-with-body --silent --show-error --request POST \
  --aws-sigv4 'aws:amz:auto:s3' \
  --user "$R2_ACCESS_KEY_ID:$R2_SECRET_ACCESS_KEY" \
  --header 'x-amz-content-sha256: UNSIGNED-PAYLOAD' \
  "$OBJECT_URL?uploads=" --output lab-output/create-upload.xml
```

Inspect the XML; stop if it contains an error. Extract and record the exact upload ID, then encode it for the query:

```sh
UPLOAD_ID=$(python3 -c 'import xml.etree.ElementTree as E; r=E.parse("lab-output/create-upload.xml").getroot(); v=r.find("{*}UploadId"); assert v is not None and v.text; print(v.text)')
: "${UPLOAD_ID:?Creation did not return an upload ID; inspect response before continuing}"
export UPLOAD_ID
ENCODED_UPLOAD_ID=$(python3 -c 'import os; from urllib.parse import quote; print(quote(os.environ["UPLOAD_ID"], safe=""))')
```

Do not repeat creation after an uncertain network outcome without checking owned uploads. Keep this ID for scoped abort if anything fails.

## 3. Upload numbered parts and retain ETags

```sh
for PART in 1 2 3; do
  curl --fail-with-body --silent --show-error --request PUT \
    --aws-sigv4 'aws:amz:auto:s3' \
    --user "$R2_ACCESS_KEY_ID:$R2_SECRET_ACCESS_KEY" \
    --header 'x-amz-content-sha256: UNSIGNED-PAYLOAD' \
    --data-binary "@lab-output/part-$PART.bin" \
    --dump-header "lab-output/part-$PART.headers" --output /dev/null \
    "$OBJECT_URL?partNumber=$PART&uploadId=$ENCODED_UPLOAD_ID" || break
done
```

Inspect **all three** success responses and their `ETag` headers. If a part fails, retry only that number with the same source bytes; retain successful parts. Do not proceed to completion with missing/failed parts. The Dashboard's object list will not show a completed object yet.

## 4. Build and send ordered completion XML

```sh
python3 - <<'PY'
from pathlib import Path
import xml.etree.ElementTree as E
root = E.Element('CompleteMultipartUpload')
for number in (1, 2, 3):
    lines = Path(f'lab-output/part-{number}.headers').read_text().splitlines()
    statuses = [line for line in lines if line.startswith('HTTP/')]
    assert statuses and 200 <= int(statuses[-1].split()[1]) < 300
    tags = [line.split(':', 1)[1].strip() for line in lines if line.lower().startswith('etag:')]
    assert tags and tags[-1]
    part = E.SubElement(root, 'Part')
    E.SubElement(part, 'PartNumber').text = str(number)
    E.SubElement(part, 'ETag').text = tags[-1]
with Path('lab-output/complete.xml').open('xb') as f:
    f.write(E.tostring(root, encoding='utf-8', xml_declaration=True))
PY

curl --fail-with-body --silent --show-error --request POST \
  --aws-sigv4 'aws:amz:auto:s3' \
  --user "$R2_ACCESS_KEY_ID:$R2_SECRET_ACCESS_KEY" \
  --header 'x-amz-content-sha256: UNSIGNED-PAYLOAD' \
  --header 'Content-Type: application/xml' \
  --data-binary @lab-output/complete.xml \
  "$OBJECT_URL?uploadId=$ENCODED_UPLOAD_ID" --output lab-output/completed.xml
```

Inspect `completed.xml`: require a `CompleteMultipartUploadResult`, matching key and no embedded `Error`. S3 completion can return an error body even under HTTP 200. Refresh the Dashboard and check **12,582,912 bytes**. Uploaded parts alone are not completion evidence.

## 5. Download and compare the actual object

Use **… → Download** in the Dashboard or the authenticated GET:

```sh
curl --fail-with-body --silent --show-error \
  --aws-sigv4 'aws:amz:auto:s3' \
  --user "$R2_ACCESS_KEY_ID:$R2_SECRET_ACCESS_KEY" \
  --header 'x-amz-content-sha256: UNSIGNED-PAYLOAD' \
  "$OBJECT_URL" --output lab-output/multipart-downloaded.bin

shasum -a 256 lab-output/multipart-source.bin lab-output/multipart-downloaded.bin
```

Use fresh local response/output names and keep the source unchanged. The two SHA-256 values and sizes must match. Linux uses `sha256sum`; PowerShell uses `Get-FileHash`. Multipart ETags are completion references, not the content SHA-256.

## 6. Scoped abort or object cleanup

For a failed/incomplete upload, abort only the recorded upload ID:

```sh
curl --fail-with-body --silent --show-error --request DELETE \
  --aws-sigv4 'aws:amz:auto:s3' \
  --user "$R2_ACCESS_KEY_ID:$R2_SECRET_ACCESS_KEY" \
  --header 'x-amz-content-sha256: UNSIGNED-PAYLOAD' \
  "$OBJECT_URL?uploadId=$ENCODED_UPLOAD_ID"
```

Aborting is not deletion of a completed object. For successful completion, delete only `MULTIPART_KEY` through the Dashboard. Record cleanup; leave unrelated keys/buckets/lifecycle rules alone.

Sources: [R2 multipart/ETags](https://developers.cloudflare.com/r2/objects/upload-objects/), [S3 compatibility](https://developers.cloudflare.com/r2/api/s3/api/), [curl SigV4](https://curl.se/docs/manpage.html#--aws-sigv4), [S3 API completion](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html).
