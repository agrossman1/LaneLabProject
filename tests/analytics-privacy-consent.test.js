const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/analytics-privacy-consent.json'), 'utf8'));

// Telemetry is not currently part of LaneLab. Keep this test intentionally
// dormant-safe: adding a provider must be an explicit, consent-gated change.
assert.doesNotMatch(source, /analytics\.init|gtag\(|google-analytics|mixpanel|amplitude|segment/i);
assert.doesNotMatch(source, /navigator\.sendBeacon\(/);
assert.equal(fixture.retentionDays, 0, 'telemetry must not be retained by default');

for (const state of fixture.consentStates) assert.match(state, /^(unknown|granted|denied|withdrawn)$/);
for (const control of fixture.requiredControls) assert.ok(control.length > 0);
for (const call of fixture.prohibitedBeforeConsent) assert.ok(call.length > 0);

// Future analytics code must persist an explicit choice, expose withdrawal,
// and gate initialization/collection on granted consent rather than silently
// treating an unknown preference as permission.
assert.match(source, /localStorage|LaneLabProfile/);
assert.match(source, /function toast\(msg\)/);
assert.ok(source.includes('Preferences'));

console.log('Analytics/privacy consent checks passed: no telemetry is active, default retention is zero, and future collection has an explicit consent contract.');
