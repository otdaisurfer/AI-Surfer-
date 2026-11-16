// Run against a local `wrangler pages dev dist` server after `npm run build`.
// This deliberately makes no API requests or authenticated requests.
import assert from 'node:assert/strict';

const base = new URL(process.argv[2] || 'http://127.0.0.1:8788');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(base.hostname), 'Use a local Pages server');
let failures = 0;
const checks = [
  ...['/', '/wave-check', '/wave-check/', '/pricing', '/pricing/', '/services', '/services/',
    '/privacy', '/terms', '/login', '/members', '/wave-starter/success',
    '/blog/', '/blog/our-story/', '/blog/building-ai-surfer-one-wave-at-a-time-episode-1/',
    '/robots.txt', '/sitemap.xml', '/ocean_tide_logo.png'].map(path => [path, 200]),
  ...['/about', '/contact', '/routing-check-missing', '/blog/no-such-episode/'].map(path => [path, 404]),
  ['/home?utm_source=check', 301, '/?utm_source=check'],
  ['/home/?utm_source=check', 301, '/?utm_source=check'],
  ['/reviews?utm_source=check', 301, '/pricing?utm_source=check'],
  ['/reviews/?utm_source=check', 301, '/pricing?utm_source=check'],
  ['/wave-audit', 302, '/wave-check'],
];
for (const method of ['GET', 'HEAD']) {
  for (const [path, status, destination] of checks) {
    try {
      const response = await fetch(new URL(path, base), { method, redirect: 'manual' });
      assert.equal(response.status, status);
      if (destination) assert.equal(new URL(response.headers.get('location'), base).href, new URL(destination, base).href);
      if (method === 'HEAD') assert.equal((await response.text()).length, 0);
      console.log(`PASS ${method} ${path}`);
    } catch (error) {
      failures++;
      console.error(`FAIL ${method} ${path}: ${error.message}`);
    }
  }
}
console.log(`${checks.length * 2} checks; ${failures} failures`);
process.exitCode = failures ? 1 : 0;
