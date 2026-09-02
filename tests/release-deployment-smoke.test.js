const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/release-deployment-smoke.json'), 'utf8'));
const commit = cp.execFileSync('git', ['rev-parse', '--verify', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim();

assert.match(commit, /^[0-9a-f]{40}$/i, 'the release must be traceable to a concrete Git commit');
assert.equal(fs.existsSync(path.join(root, fixture.entrypoint)), true);
fixture.requiredScripts.forEach(script => {
  assert.equal(fs.existsSync(path.join(root, script)), true, `${script} must ship with the Pages build`);
  assert.match(source, new RegExp(`src=["']\\./${script.replaceAll('/', '\\/')}(?:\\?[^"']*)?["']`));
});
fixture.requiredSelectors.forEach(selector => {
  const idOrClass = selector.slice(1);
  assert.match(source, new RegExp(selector.startsWith('#') ? `(?:id|class)=["'][^"']*${idOrClass}` : `class=["'][^"']*${idOrClass}`));
});

// Resolve every local script/style/image reference so a published build does
// not silently lose an asset because of a bad relative path.
const localRefs = [...source.matchAll(/(?:src|href)=["'](\.\/[^"'#?]+)["']/gi)]
  .map(match => match[1].replaceAll('\\', '/'))
  .filter(ref => !ref.startsWith('./#') && !ref.includes('${'));
assert.ok(localRefs.length > 0, 'the smoke test should inspect local asset references');
localRefs.forEach(ref => assert.equal(fs.existsSync(path.join(root, ref.slice(2))), true, `${ref} must resolve`));
assert.match(source, /<meta name="viewport" content="width=device-width/);
assert.match(source, /<title>LaneLab/);
assert.equal(fixture.deployment, 'GitHub Pages');

console.log(`Release smoke checks passed for commit ${commit.slice(0, 7)}: entrypoint, required assets, selectors, and local references resolve.`);
