const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/accessibility-audit.json'), 'utf8'));

assert.deepEqual(fixture.requirements, ['screen readers', 'reduced motion', 'color contrast', 'enlarged text', 'focus order']);
assert.ok(fixture.minTouchTargetPx >= 44);
fixture.contrastTokens.forEach(token => assert.match(source, new RegExp(`${token}:`)));
assert.match(source, /role="dialog" aria-modal="true"/);
assert.match(source, /aria-labelledby="onboardingTitle"/);
assert.match(source, /aria-live="polite"/);
assert.match(source, /aria-label="Open profile"/);
assert.match(source, /aria-label="0 pins"/);
assert.match(source, /:focus-visible\{outline:3px solid var\(--accent\)/);
assert.match(source, /tabindex="0"/);
assert.doesNotMatch(source, /tabindex="[1-9]/);
assert.match(source, /min-height:44px/);
assert.match(source, /@media \(prefers-reduced-motion:reduce\)[\s\S]*?animation:none[\s\S]*?transition:none/);

console.log('Accessibility audit checks passed for screen readers, reduced motion, contrast tokens, enlarged text targets, and focus order.');
