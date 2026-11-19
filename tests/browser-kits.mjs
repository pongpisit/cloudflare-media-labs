import assert from 'node:assert/strict';
import { mkdtemp, readFile, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
import { labEntries, root } from '../scripts/lab-kits.mjs';

const output = await mkdtemp(path.join(tmpdir(), 'browser-kits-'));
for (const id of ['images','stream','r2']) {
  for (const entry of await labEntries(id, `${id}-lab`)) { const destination=path.join(output,entry.name);await mkdir(path.dirname(destination),{recursive:true});await writeFile(destination,entry.data); }
}
const browser = await puppeteer.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const failures=[],errors=[],external=[];
let checks=0;
try {
  const page = await browser.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.setRequestInterception(true);
  page.on('request',request=>{
    if (!request.url().startsWith('https:')) return request.continue();
    external.push(request.url());
    if (request.url().startsWith('https://imagedelivery.net/')) return request.respond({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#f6821f"/></svg>'});
    if (request.url().startsWith('https://customer-test.cloudflarestream.com/')) return request.respond({status:200,contentType:'text/html',body:'<!doctype html><title>Intercepted player fixture, not real playback</title><p>DOM test fixture</p>'});
    failures.push(`Unexpected external request: ${request.url()}`);return request.abort();
  });
  const open=async id=>{await page.goto(pathToFileURL(path.join(output,`${id}-lab/START-HERE.html`)).href);};
  for (const [width,height] of [[1280,800],[390,844]]) {
    await page.setViewport({width,height});
    for (const id of ['images','stream','r2']) {
      await open(id);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),`${id} ${width}: page overflow`);
      assert.equal(await page.$$eval('input',nodes=>nodes.filter(node=>!node.labels.length).length),0);
      assert.equal(await page.$$eval('iframe,[data-real-image]:not([hidden]),[data-real-link]:not([hidden])',nodes=>nodes.length),0);
      if(id==='images') assert.equal(await page.$$eval('#connection-status,#image-form,#dimension-form,#image-file,#clear,#lab-label,#regen-label,#names-status,script',nodes=>nodes.length),0,'Images kit is instructional only: no status, forms, label/dimension tools, clear button or inline JS');
      else {
        assert.ok(await page.$eval('#connection-status',node=>node.textContent.startsWith('Not connected yet')));
        assert.equal(await page.$$eval('#lab-label,#regen-label,#names-status,#name-bucket',nodes=>nodes.length),0,`${id}: no generated lab names UI`);
      }
      if(id==='stream') {
        await page.waitForFunction(()=>document.querySelector('video').readyState>=1);
        assert.equal(await page.$eval('video',video=>video.duration),20);
        await page.waitForFunction(()=>document.querySelector('video track').track.cues?.length===4);
        const file=await readFile(path.join(root,'samples/captions-en.vtt'),'utf8');assert.match(file,/Welcome to this sample media publishing lesson/);
      }
      checks++;
    }
  }
  await page.setViewport({width:1280,height:800});

  await open('stream');await page.type('#stream-url','https://customer-test.cloudflarestream.com/EXAMPLE/iframe');await page.click('#stream-form button');
  assert.equal(await page.$eval('#player iframe',node=>node.referrerPolicy),'strict-origin-when-cross-origin');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  assert.equal(await page.$eval('#player',node=>node.children.length),1,'switching tabs must not erase an active connection');
  await page.click('#clear');assert.equal(await page.$eval('#player',node=>node.children.length),0);assert.equal(await page.$eval('#stream-url',node=>node.value),'');checks++;

  await open('r2');const original=await page.$('#original-file'),download=await page.$('#downloaded-file');
  await original.uploadFile(path.join(root,'samples/sample-document.txt'));await download.uploadFile(path.join(root,'samples/sample-document.txt'));await page.click('#compare-form button');
  assert.equal(await page.$eval('#compare-status',node=>node.dataset.state),'error');
  await page.click('#download-confirm');await page.click('#compare-form button');await page.waitForFunction(()=>document.querySelector('#compare-status').textContent.startsWith('MATCH'));
  await download.uploadFile(path.join(root,'samples/captions-en.vtt'));assert.equal(await page.$eval('#download-confirm',node=>node.checked),false);await page.click('#download-confirm');await page.click('#compare-form button');await page.waitForFunction(()=>document.querySelector('#compare-status').textContent.startsWith('MISMATCH'));
  await page.click('#clear');assert.equal(await page.$eval('#original-file',node=>node.files.length),0);checks++;

  await open('stream');await page.emulateMediaType('print');assert.equal(await page.$eval('.actions',node=>getComputedStyle(node).display),'none');await page.emulateMediaType('screen');checks++;
  assert.deepEqual(failures,[]);assert.deepEqual(errors,[]);
  console.log(`PASS ${checks} browser kit groups: file:// desktop/phone layouts, labelled fields, bundled video, disconnected defaults (Stream/R2), instructional-only Images kit, no lab names UI, Stream fixture/reset, R2 provenance gate/hash match/mismatch and print. ${external.length} intercepted fixture requests; no live product operations.`);
} finally {await browser.close();}
