const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/mobile-layout-regression.json'), 'utf8'));
assert.equal(fixture.breakpoint, 520);

// Pin-rack geometry: keep ten-pin layout stable and place zero pins in the
// lower-left corner instead of adding a tall extra action row.
assert.match(source, /\.pinRack\{[^}]*grid-template-columns:repeat\(7,42px\);grid-template-rows:repeat\(4,42px\)/);
assert.match(source, /\.zeroPinButton\{[^}]*grid-column:1;grid-row:4/);
assert.match(source, /\.zeroPinButton\{[^}]*display:flex;align-items:center;justify-content:center/);
assert.match(source, /class="pinButton zeroPinButton" aria-label="0 pins"/);

// Mobile ball controls stay compact and right-aligned without clipping labels.
assert.match(source, /@media \(max-width:520px\)\{[\s\S]*?\.scoreChoices\{grid-template-columns:auto 1fr/);
assert.match(source, /\.scoreChoices \.choiceGroup:nth-child\(2\)\{[^}]*justify-content:flex-end/);
assert.match(source, /\.choiceGroup \.ballChoice\{[^}]*min-width:0;max-width:124px/);
assert.match(source, /\.choiceGroup \.ballChoice b\{font-size:10px\}/);

// Touch interactions must not be cancelled by page scrolling or native gestures.
assert.match(source, /html,body,\.app\{touch-action:manipulation\}/);
assert.match(source, /button,input,select\{[\s\S]*?touch-action:manipulation/);
assert.match(source, /\.pinButton\{[^}]*touch-action:none/);

console.log('Mobile layout checks passed for pin rack, zero-pin placement, ball controls, and touch behavior.');
