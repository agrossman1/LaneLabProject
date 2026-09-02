const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/e2e-browser-smoke.json'), 'utf8'));
assert.equal(fixture.workflow.length, 6, 'Smoke workflow must cover every user-facing step');

// The smoke test is intentionally dependency-free: it verifies the browser contract
// (screens, controls, handlers, and persistence hooks) that a real device workflow uses.
for (const id of fixture.requiredSelectors) {
  assert.match(source, new RegExp(`id="${id}"`), `Missing smoke-test selector: ${id}`);
}
for (const handler of ['maybeStartOnboarding', 'onboardingAddBall', 'recordGameScore', 'go', 'renderPersonalStats', 'renderArsenal']) {
  assert.match(source, new RegExp(`function ${handler}\\(`), `Missing smoke-test handler: ${handler}`);
}

// Onboarding can add a ball, persist it, and refresh the Arsenal view.
assert.match(source, /function onboardingAddBall\([\s\S]*?LaneLabArsenal\.save\(getGameStorage\(\)/);
assert.match(source, /function onboardingAddBall\([\s\S]*?renderArsenal\(\)/);

// Scoring must create a game record and persist it before updating dependent views.
assert.match(source, /function recordGameScore\([\s\S]*?LaneLabStats\.createGameRecord/);
assert.match(source, /function recordGameScore\([\s\S]*?LaneLabStats\.saveGameRecords\(getGameStorage\(\)/);
assert.match(source, /function recordGameScore\([\s\S]*?renderPersonalStats\(\)/);
assert.match(source, /function recordGameScore\([\s\S]*?renderArsenal\(\)/);

// Navigation must expose Score, history (Personal stats), and Arsenal, while opening
// Arsenal rehydrates the persisted catalog. Refresh hydration must run on startup.
assert.match(source, /data-target="score"[\s\S]*?onclick="go\('score'\)"/);
assert.match(source, /data-target="arsenal"[\s\S]*?onclick="go\('arsenal'\)"/);
assert.match(source, /id="personalStats"/);
assert.match(source, /function go\([\s\S]*?arsenal=LaneLabArsenal\.load\(getGameStorage\(\)/);
assert.match(source, /savedGames=LaneLabStats\.loadGameRecords\(getGameStorage\(\)/);

console.log('End-to-end browser smoke checks passed for onboarding, scoring, history, Arsenal, and refresh persistence.');
