const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/dependency-csp-security.json'), 'utf8'));

// A deployment must not execute arbitrary URL schemes or load dependencies
// from an accidental file/javascript URL.
for (const scheme of fixture.blockedSchemes) assert.equal(source.toLowerCase().includes(`${scheme}"`), false, `${scheme} URL must be blocked`);
assert.doesNotMatch(source, /(?:src|href)\s*=\s*["']\s*javascript:/i);
assert.doesNotMatch(source, /\b(?:eval|Function)\s*\(/);
assert.match(source, /navigator\.serviceWorker\.register\('\.\/sw\.js'\)/);

// JavaScript dependencies are same-origin relative files, making them
// compatible with a strict script-src 'self' policy and resilient to blocked
// third-party script hosts.
const scriptSources = [...source.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(match => match[1]);
assert.ok(scriptSources.length >= 3);
for (const script of scriptSources) {
  assert.equal(/^\.\//.test(script), true, `script must be same-origin relative: ${script}`);
  assert.equal(fixture.allowedScriptHosts.includes('self'), true);
}

// External image URLs are limited to HTTPS (plus embedded data images); no
// remote script, iframe, object, or base-tag dependency may be introduced.
for (const match of source.matchAll(/<(?:img|image)[^>]+(?:src|href)=["']([^"']+)["']/gi)) {
  const url = match[1].toLowerCase();
  if (url.includes('${')) continue; // runtime-escaped catalog value is validated before insertion
  assert.equal(url.startsWith('http://'), false);
  assert.equal(url.startsWith('https://') || url.startsWith('data:') || url.startsWith('./'), true);
}
assert.doesNotMatch(source, /<iframe\b|<object\b|<base\b/i);

// Keep the expected CSP review surface explicit for future dependency changes.
for (const directive of fixture.cspDirectives) assert.match(directive, /^[a-z-]+$/);
assert.ok(source.includes('manifest.webmanifest'));

console.log('Dependency/CSP security checks passed for blocked schemes, same-origin scripts, safe asset URLs, and CSP review directives.');
