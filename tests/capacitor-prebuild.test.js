const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const config = fs.readFileSync(path.join(root, 'capacitor.config.ts'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
assert.match(config, /appId:\s*'com\.lanelab\.app'/);
assert.match(config, /webDir:\s*'\.'/);
assert.ok(pkg.dependencies?.['@capacitor/core']);
assert.ok(pkg.devDependencies?.['@capacitor/cli'] || pkg.dependencies?.['@capacitor/cli']);
for (const file of ['src/app.js','src/platform/device.js','src/data/transfer.js','assets/lanelab-icon.svg','assets/lanelab-splash.svg','privacy.html','support.html']) {
  assert.equal(fs.existsSync(path.join(root, file)), true, `missing Capacitor/release asset: ${file}`);
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(html, /src\/platform\/device\.js/);
assert.match(html, /src\/data\/transfer\.js/);
assert.match(html, /src\/app\.js/);
console.log('Capacitor prebuild checks passed for config, native boundaries, release assets, and startup wiring.');
