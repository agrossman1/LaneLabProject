const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/responsive-visual-regression.json'), 'utf8'));
assert.deepEqual(fixture.viewports.map(view => view.name), ['desktop', 'tablet', 'mobile']);
assert.deepEqual(fixture.viewports.map(view => view.width), [1440, 768, 390]);

// Every screenshot target must exist in the DOM so visual checks cannot silently
// capture an empty or renamed screen.
for (const id of fixture.screens) assert.match(source, new RegExp(`id="${id}"`), `Missing visual-regression screen: ${id}`);

// The app and navigation are width-constrained at every viewport; desktop/tablet
// get a wider shell while mobile keeps the compact shell inside the viewport.
assert.match(source, /\.app\{[\s\S]*?width:min\(100%,430px\)/);
assert.match(source, /@media \(min-width:700px\)[\s\S]*?\.app\{width:min\(100%,820px\)/);
assert.match(source, /\.nav\{[\s\S]*?width:min\(100%,430px\)/);
assert.match(source, /@media \(min-width:700px\)[\s\S]*?\.nav\{width:min\(100%,820px\)/);

// Mobile-specific controls must shrink/reflow rather than clip their labels.
assert.match(source, /@media \(max-width:520px\)[\s\S]*?\.scoreChoices\{grid-template-columns:auto 1fr/);
assert.match(source, /@media \(max-width:520px\)[\s\S]*?\.choiceGroup \.ballChoice\{[^}]*min-width:0/);
assert.match(source, /\.ballChoice b\{[^}]*overflow-wrap:anywhere;white-space:normal/);
assert.match(source, /\.onboardingCard\{[^}]*max-height:90vh;overflow:auto/);

// Fixed/scrolling regions are intentional and must not create page-wide horizontal
// overflow; screenshot baselines should remain stable after navigation.
assert.match(source, /html,body,\.app\{touch-action:manipulation\}/);
assert.match(source, /\.historyScroll\{[^}]*overflow-y:auto/);
assert.match(source, /\.app\{[^}]*position:relative/);

console.log('Responsive visual checks passed for desktop, tablet, and mobile viewport contracts.');
