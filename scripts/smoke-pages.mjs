// Read-only live check of the hosted lab pages. No credentials; fixture URLs are intercepted.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const base = (process.env.PAGES_BASE || 'https://pongpisit.github.io/cloudflare-media-labs/').replace(/\/?$/, '/');
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const errors = [], checks = [];
const ok = name => { checks.push(name); console.log(`PASS ${name}`); };
try {
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = request.url();
    if (url.startsWith(base) || url.startsWith('data:')) return request.continue();
    if (url.startsWith('https://imagedelivery.net/')) return request.respond({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#f6821f"/></svg>' });
    if (url.startsWith('https://customer-test.cloudflarestream.com/')) return request.respond({ status: 200, contentType: 'text/html', body: '<!doctype html><title>fixture</title>' });
    errors.push(`unexpected request ${url}`); request.abort();
  });
  for (const [width, height] of [[1280, 800], [390, 844]]) {
    await page.setViewport({ width, height });
    await page.goto(base, { waitUntil: 'networkidle0' });
    assert.equal(await page.$$eval('.card', nodes => nodes.length), 3);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), `landing overflow ${width}`);
    for (const id of ['images', 'stream', 'r2']) {
      await page.goto(`${base}${id}/`, { waitUntil: 'networkidle0' });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), `${id} overflow ${width}`);
      assert.equal(await page.$$eval('input:not([type=checkbox])', nodes => nodes.filter(node => !node.labels.length).length), 0);
      assert.match(await page.$eval('#lab-label', node => node.value), /^[a-z]+-[a-z]+$/);
      for (const href of await page.$$eval('.downloads a', nodes => nodes.map(node => node.href))) assert.equal((await fetch(href)).status, 200, href);
    }
  }
  ok('landing page and three lab pages load at desktop and phone widths with labelled fields, lab names and downloadable samples');
  await page.goto(`${base}stream/`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.querySelector('video').readyState >= 1);
  assert.equal(await page.$eval('video', video => video.duration), 20);
  await page.waitForFunction(() => document.querySelector('video track').track.cues?.length === 4);
  await page.type('#stream-url', 'https://customer-test.cloudflarestream.com/EXAMPLE/iframe'); await page.click('#stream-form button');
  assert.equal(await page.$eval('#player iframe', node => node.referrerPolicy), 'strict-origin-when-cross-origin');
  ok('hosted Stream page plays the 20-second sample with four caption cues and builds the player frame (fixture, not real playback)');
  await page.goto(`${base}images/`, { waitUntil: 'networkidle0' });
  await page.type('#image-url', 'https://imagedelivery.net/hash/id/public'); await page.type('#card-name', 'lab-card'); await page.type('#detail-name', 'lab-detail'); await page.click('#image-form button');
  assert.deepEqual(await page.$$eval('[data-real-link]', links => links.map(link => link.href)), ['https://imagedelivery.net/hash/id/lab-card', 'https://imagedelivery.net/hash/id/lab-detail']);
  ok('hosted Images page builds card and detail links from an actual-shaped delivery URL (fixture)');
  assert.deepEqual(errors, []);
  ok('no console or page errors, no unexpected external requests');
} finally { await browser.close(); }
console.log(`Hosted lab pages verified: ${base} (${checks.length} groups)`);
