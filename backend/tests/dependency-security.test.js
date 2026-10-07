const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const proxyaddr = require('proxy-addr');
const { ipKeyGenerator, rateLimit } = require('express-rate-limit');
const { match } = require('path-to-regexp');
const lock = require('../package-lock.json');

for (const [name, minimum] of Object.entries({ 'proxy-addr': '2.0.8', 'body-parser': '2.3.0', 'path-to-regexp': '8.4.0', qs: '6.16.0', 'ip-address': '10.7.1', 'express-rate-limit': '8.6.0' })) {
  test(`security dependency ${name} meets the patched compatible floor`, () => {
    const installed = lock.packages[`node_modules/${name}`].version.split('.').map(Number);
    const required = minimum.split('.').map(Number);
    assert.equal(installed[0], required[0]);
    assert(installed[1] > required[1] || (installed[1] === required[1] && installed[2] >= required[2]));
  });
}
test('critical proxy fix does not trust arbitrary IPv4 through a malformed mapped-IPv6 subnet', () => {
  assert.equal(proxyaddr.compile('::ffff:10.0.0.0/8')('203.0.113.9'), false);
  const valid = proxyaddr.compile('10.0.0.0/8');
  assert.equal(valid('10.2.3.4'), true);
  assert.equal(valid('203.0.113.9'), false);
});
test('current production proxy/query defaults remain unchanged and reject spoofed forwarding identity', () => {
  const app = express();
  assert.equal(app.get('trust proxy'), false);
  assert.equal(app.get('query parser'), 'simple');
  assert.equal(proxyaddr({ socket: { remoteAddress: '192.0.2.1' }, headers: { 'x-forwarded-for': '203.0.113.9' } }, app.get('trust proxy fn')), '192.0.2.1');
});
test('rate-limit IP grouping remains stable with the patched parser', () => {
  assert.equal(ipKeyGenerator('192.0.2.1'), '192.0.2.1');
  assert.equal(ipKeyGenerator('::ffff:192.0.2.1'), '192.0.2.1');
  assert.equal(ipKeyGenerator('2001:db8:1234:5600::1'), ipKeyGenerator('2001:db8:1234:56ff::2'));
});
test('JSON size configuration cannot silently disable enforcement', () => {
  assert.throws(() => express.json({ limit: 'not-a-limit' }), TypeError);
  assert.doesNotThrow(() => express.json());
});
test('patched router preserves the static production endpoint matches', () => {
  for (const route of ['/health', '/api/ask', '/api/copilot', '/api/sbar']) {
    assert(match(route)(route));
    assert.equal(match(route)(route + '/other'), false);
  }
});
test('provider integrations do not enable the vulnerable SDK filesystem memory tool', () => {
  for (const file of ['server.js', 'ask-clinical-edge.js']) {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    assert(!/helpers\/(?:beta\/)?memory|toolRunner|memory_20250818/.test(source));
  }
});
test('HTTP JSON limit and rate-limit behavior survive patched dependencies without a provider', async () => {
  const app = express();
  app.use(express.json());
  app.post('/bounded', (_req, res) => res.json({ status: 'ok' }));
  app.get('/limited', rateLimit({ windowMs: 60000, max: 2, standardHeaders: true, legacyHeaders: false }), (_req, res) => res.json({ status: 'ok' }));
  app.use((error, _req, res, _next) => res.status(error.status || 500).json({ error: 'request_rejected' }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const normal = await fetch(base + '/bounded', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ synthetic: true }) });
    assert.equal(normal.status, 200);
    const large = await fetch(base + '/bounded', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ synthetic: 'x'.repeat(110000) }) });
    assert.equal(large.status, 413);
    for (const status of [200, 200, 429]) assert.equal((await fetch(base + '/limited')).status, status);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
