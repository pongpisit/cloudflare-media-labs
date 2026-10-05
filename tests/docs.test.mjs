import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// GitHub heading slugs for the ordinary Markdown headings used in this project.
function headingIds(markdown) {
  const seen = new Map();
  return new Set([...markdown.matchAll(/^#{1,6}\s+(.+)$/gm)].map(([, heading]) => {
    const base = heading.toLowerCase().replace(/[^\p{L}\p{N}\p{M}_\s-]/gu, '').replace(/\s/g, '-');
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  }));
}

test('participant Markdown links resolve to existing files and section anchors', async () => {
  const files = ['README.md'];
  for (const directory of ['docs', 'samples']) {
    for (const name of await readdir(path.join(root, directory))) {
      if (name.endsWith('.md')) files.push(`${directory}/${name}`);
    }
  }
  for (const file of files) {
    const absolute = path.join(root, file);
    const markdown = (await readFile(absolute, 'utf8')).replace(/```[\s\S]*?```/g, '');
    for (const [, href] of markdown.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
      if (/^[a-z]+:/i.test(href)) continue;
      const [relative, fragment] = href.split('#');
      const destination = relative ? path.resolve(path.dirname(absolute), decodeURIComponent(relative)) : absolute;
      assert.ok(destination.startsWith(`${root}${path.sep}`), `${file}: link leaves repository: ${href}`);
      const info = await stat(destination).catch(() => null);
      assert.ok(info, `${file}: missing link target ${href}`);
      if (fragment && info.isFile() && destination.endsWith('.md')) {
        assert.ok(headingIds(await readFile(destination, 'utf8')).has(decodeURIComponent(fragment)),
          `${file}: missing heading anchor ${href}`);
      }
    }
  }
});

test('beginner product guides preserve browser-only tasks and the 110-minute practice budget', async () => {
  for (const [product, minutes] of [['images', 35], ['stream', 40], ['r2', 35]]) {
    const markdown = await readFile(path.join(root, `docs/beginner-${product}.md`), 'utf8');
    assert.doesNotMatch(markdown, /```|\$env:|curl\.exe|--request|npm (?:run|ci|install)|git clone/,
      `${product}: learner guide includes commands`);
    assert.match(markdown, /\*\*Do this\*\*/);
    assert.match(markdown, /\*\*You should see:/);
    assert.match(markdown, /\*\*If it does not work:/);
    assert.match(markdown, /clean up/i);
    const sections = [...markdown.matchAll(/^## \d+\. .+ — (\d+) minutes$/gm)];
    assert.equal(sections.reduce((sum, [, duration]) => sum + Number(duration), 0), minutes,
      `${product}: numbered timeboxes must fit the lab`);
    assert.match(markdown, /only.*(?:recorded|own|personally created)|(?:recorded|own).*only/i);
  }
  const r2 = await readFile(path.join(root, 'docs/beginner-r2.md'), 'utf8');
  assert.match(r2, /actual R2 download/);
  assert.match(r2, /not the original selected twice/);
  const stream = await readFile(path.join(root, 'docs/beginner-stream.md'), 'utf8');
  assert.match(stream, /if that control is available/);
  assert.match(stream, /instructor attaches the file/);
  assert.match(stream, /You do not create a token or run commands/);
});

test('beginner caption checks match the supplied WebVTT rather than invented text', async () => {
  const captions = await readFile(path.join(root, 'samples/captions-en.vtt'), 'utf8');
  const cues = captions.trim().split(/\r?\n\s*\r?\n/).filter(block => block.includes('-->'))
    .map(block => block.split(/\r?\n/).filter(line => !line.includes('-->') && !/^\d+$/.test(line)).join(' '));
  assert.equal(cues.length, 4);
  const guide = await readFile(path.join(root, 'docs/beginner-stream.md'), 'utf8');
  assert.ok(guide.includes(cues[0]), 'First-cue review must use the actual sample');
  assert.ok(guide.includes(cues.at(-1)), 'Final-cue review must use the actual sample');
});

test('first-time setup teaches creation before upload with scoped credentials and recorded ownership', async () => {
  const images=await readFile(path.join(root,'docs/beginner-images.md'),'utf8');
  const r2=await readFile(path.join(root,'docs/beginner-r2.md'),'utf8');
  const setup=await readFile(path.join(root,'docs/beginner-setup.md'),'utf8');
  const worksheet=await readFile(path.join(root,'docs/beginner-worksheet.md'),'utf8');
  assert.ok(images.indexOf('## 1. Create two views')<images.indexOf('## 2. Upload your picture'));
  assert.match(images,/before uploading|before upload/);assert.match(images,/reopen.*actual saved/);
  assert.ok(r2.indexOf('## 1. Create your private bucket')<r2.indexOf('## 2. Upload your files'));
  assert.match(r2,/3–63 lowercase.*no leading\/trailing hyphen/);
  assert.match(r2,/Standard.*default storage class/);
  assert.match(r2,/instructor created \/ shared fallback/);
  assert.match(r2,/Only if you created.*completely empty/);
  assert.match(r2,/Never use.*Empty Bucket.*shared storage/);
  assert.doesNotMatch(setup,/```|\$env:|curl\.exe|npm (?:run|ci|install)/,'Setup explanation needs no commands or secret entry');
  assert.match(setup,/authorized administrator\/instructor/);
  assert.match(setup,/Specific account.*approved workshop account/);
  assert.match(setup,/TTL\/expiry/);assert.match(setup,/once-shown secret/);
  assert.match(setup,/after the bucket exists/);assert.match(setup,/Object Read & Write/);
  assert.match(setup,/only the recorded workshop bucket/);
  assert.match(setup,/not Cloudflare REST.*do not create\/configure\/delete buckets/);
  assert.match(setup,/read-only check/);assert.match(setup,/revokes only/);
  for(const term of ['Variants created by','before upload','Bucket created by','shared fallback','REST token created by','R2 credentials created by','revoked','not performed'])assert.ok(worksheet.includes(term),`Worksheet lacks ${term}`);
});
