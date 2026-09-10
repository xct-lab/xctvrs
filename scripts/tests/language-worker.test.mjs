import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../language-worker.js';

const env = { ASSETS: { async fetch(request) {
  const path = new URL(request.url).pathname;
  return new Response(path.endsWith('/404') ? 'translated missing page' : 'page', {
    status: path.endsWith('/missing') ? 404 : 200,
  });
} } };
function run(path, { cf, cookie, method = 'GET' } = {}) {
  const request = new Request('https://xctvrs.ca' + path, { method, headers: cookie ? { cookie } : {} });
  Object.defineProperty(request, 'cf', { value: cf });
  return worker.fetch(request, env);
}
test('Quebec defaults to French; other and unknown locations to English', async () => {
  for (const [cf, language] of [[{country:'CA',regionCode:'QC'},'fr'], [{country:'CA',regionCode:'ON'},'en'], [undefined,'en']]) {
    const result = await run('/issues/?topic=video', {cf});
    assert.equal(result.headers.get('location'), `https://xctvrs.ca/${language}/issues/?topic=video`);
    assert.match(result.headers.get('cache-control'), /no-store/);
  }
});
test('Saved preference overrides geography; invalid preference is ignored', async () => {
  for (const [cookie,language] of [['xctvrs_language=en','en'],['other=1; xctvrs_language=fr; third=1','fr'],['xctvrs_language=invalid','fr']]) {
    const result = await run('/', {cf:{country:'CA',regionCode:'QC'},cookie});
    assert.equal(result.headers.get('location'), `https://xctvrs.ca/${language}/`);
  }
});
test('Switch stays on the same page and stores a secure preference', async () => {
  const result = await run('/fr/petition/?lang=en&topic=quality');
  assert.equal(result.headers.get('location'), 'https://xctvrs.ca/en/petition/?topic=quality');
  for (const flag of ['xctvrs_language=en','Secure','HttpOnly','SameSite=Lax','Path=/']) assert.ok(result.headers.get('set-cookie').includes(flag));
});
test('Explicit language routes override cookie and do not set cookies', async () => {
  const result = await run('/en/petition/', {cookie:'xctvrs_language=fr'});
  assert.equal(result.status,200);
  assert.equal(result.headers.get('content-language'),'en-CA');
  assert.equal(result.headers.get('set-cookie'),null);
  assert.equal((await run('/fr')).headers.get('location'),'https://xctvrs.ca/fr/');
});
test('HEAD, assets, localized 404, and unsupported methods', async () => {
  assert.equal(await (await run('/fr/',{method:'HEAD'})).text(),'');
  assert.equal((await run('/assets/site.css')).status,200);
  const missing = await run('/fr/missing');
  assert.equal(missing.status,404);
  assert.equal(missing.headers.get('content-language'),'fr-CA');
  assert.equal(await missing.text(),'translated missing page');
  assert.equal((await run('/',{method:'POST'})).status,405);
});
