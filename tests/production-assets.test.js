const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const worker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const shellMatch = worker.match(/const SHELL\s*=\s*\[((?:.|\r|\n)*?)\];/);
assert(shellMatch, 'sw.js must define a SHELL asset list');
const cachedAssets = [...shellMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(match => match[1]);
assert(cachedAssets.length > 0, 'service-worker cache list must not be empty');

for (const asset of cachedAssets) {
  assert(asset.startsWith('./'), `cache entry must be relative: ${asset}`);
  const relative = asset === './' ? 'index.html' : asset.slice(2);
  assert(fs.existsSync(path.join(root, relative)), `service-worker cache entry is missing: ${asset}`);
}

const required = ['index.html', 'manifest.webmanifest', 'privacy.html', 'support.html', 'sw.js', 'src/app.js', 'src/data/storage.js', 'src/data/transfer.js', 'src/platform/device.js'];
for (const asset of required) {
  assert(fs.existsSync(path.join(root, asset)), `required production asset is missing: ${asset}`);
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
for (const icon of manifest.icons || []) {
  assert(fs.existsSync(path.join(root, icon.src.replace(/^\.\//, ''))), `manifest icon is missing: ${icon.src}`);
}

console.log(`Production asset checks passed for ${cachedAssets.length} service-worker entries and ${required.length} required assets.`);
