const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/accessibility-keyboard-regression.json'), 'utf8'));
assert.deepEqual(fixture.activationKeys, ['Enter', 'Space']);

// Native buttons remain keyboard operable; frame cards get equivalent semantics.
assert.match(source, /div\.setAttribute\('role','button'\)/);
assert.match(source, /div\.tabIndex=0/);
assert.match(source, /event\.key==='Enter'\|\|event\.key===' '/);
assert.match(source, /div\.onclick=\(\)=>editGameFrame\(i\)/);

// Keep visible focus styling on every interactive surface.
assert.match(source, /\.frame:focus-visible/);
assert.match(source, /\.key:focus-visible/);
assert.match(source, /\.pinButton:focus-visible/);
assert.match(source, /\.cta:focus-visible/);

for (const label of fixture.requiredLabels) {
  assert.ok(source.includes(`aria-label=\"${label}\"`) || source.includes(`>${label}<`), `Missing accessible label: ${label}`);
}
assert.match(source, /class=\"pinButton zeroPinButton\" aria-label=\"0 pins\"/);
assert.match(source, /onclick=\"saveTrackedThrow\(\)\"/);
assert.match(source, /onclick=\"skipPinTracking\(\)\"/);

console.log('Accessibility and keyboard checks passed for buttons, frames, pin tracking, focus, and labels.');
