import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { generateFixture, outputPath, FIXTURE_BYTES, FIXTURE_SHA256 } from '../scripts/lab-fixture.mjs';

test('fixture is 12 MiB, independently hashed, deterministic and safely reused', async () => {
  const first = await generateFixture();
  assert.equal((await stat(first.path)).size, FIXTURE_BYTES);
  const bytes = await readFile(first.path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), FIXTURE_SHA256);
  for (const index of [0, 255, 256, 1048577, FIXTURE_BYTES - 1]) assert.equal(bytes[index], index % 256);
  assert.equal((await generateFixture()).reused, true);
});
test('download outputs cannot escape the local generated-output directory', () => {
  for (const filename of ['../outside.txt', '.env', 'lab-output/../README.md', 'lab-output']) assert.throws(() => outputPath(filename));
  assert.match(outputPath('lab-output/verified.bin'), /verified\.bin$/);
});
