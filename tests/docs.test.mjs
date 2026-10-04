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
