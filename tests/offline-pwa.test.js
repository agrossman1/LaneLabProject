const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/offline-pwa.json'), 'utf8'));

assert.equal(manifest.start_url, './');
assert.equal(manifest.display, 'standalone');
assert.match(source, /rel="manifest" href="\.\/manifest\.webmanifest"/);
assert.match(source, /'serviceWorker' in navigator[\s\S]*?register\('\.\/sw\.js'\)/);
assert.match(worker, /const CACHE_NAME = 'lanelab-shell-v8'/);
assert.match(worker, /cache\.addAll\(SHELL\)/);
assert.match(worker, /self\.skipWaiting\(\)/);
assert.match(worker, /self\.clients\.claim\(\)/);
assert.match(worker, /caches\.match\(event\.request\)/);
assert.match(worker, /catch\(\(\) => caches\.match\('\.\/index\.html'\)\)/);

fixture.cachedAssets.forEach(asset => {
  const local = asset === './' ? 'index.html' : asset.slice(2);
  assert.equal(fs.existsSync(path.join(root, local)), true, `${asset} must be cacheable offline`);
});
assert.equal(fixture.cacheName, 'lanelab-shell-v8');
assert.match(worker, /const isNavigation=event\.request\.mode==='navigate'/);
assert.equal(fs.existsSync(path.join(root, fixture.manifest)), true);
assert.equal(fs.existsSync(path.join(root, fixture.serviceWorker)), true);

console.log('Offline/PWA checks passed for manifest install metadata, cached shell assets, offline fallback, and service-worker updates.');
