const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/onboarding-reset-regression.json'), 'utf8'));
assert.equal(fixture.requiredBehaviors.length, 5);

const onboardingStart = source.indexOf('function maybeStartOnboarding(');
const onboardingEnd = source.indexOf('let historyRange=', onboardingStart);
assert.ok(onboardingStart >= 0 && onboardingEnd > onboardingStart, 'Onboarding startup guard is missing');
const onboarding = source.slice(onboardingStart, onboardingEnd);
assert.match(onboarding, /resetParams\.has\('reset'\)/);
assert.match(onboarding, /!hasExistingProfile && !savedGames\.length && !complete/);
assert.match(onboarding, /laneLabOnboardingComplete/);
assert.match(source, /function maybeStartOnboarding\(\)[\s\S]*?maybeStartOnboarding\(\);/);

// Import remains wired to the onboarding file control and JSON parser.
assert.match(source, /id="csvHistoryInput"[^>]*accept="\.csv,\.json/);
assert.match(source, /function importJsonRecords\(text\)/);

const currentResetStart = source.indexOf('function resetGame(');
const currentResetEnd = source.indexOf('function finalScore(', currentResetStart);
assert.ok(currentResetStart >= 0 && currentResetEnd > currentResetStart, 'Current-game reset is missing');
const currentReset = source.slice(currentResetStart, currentResetEnd);
assert.match(currentReset, /state\.frames=Array\.from\(\{length:10\}/);
assert.match(currentReset, /state\.currentFrame=0/);
assert.match(currentReset, /state\.completed=false/);
assert.match(currentReset, /state\.pinTracking=null/);
assert.match(currentReset, /state\.editingFrame=null/);

const fullResetStart = source.indexOf('function resetAllGameData(');
const fullResetEnd = source.indexOf('function go(', fullResetStart);
assert.ok(fullResetStart >= 0 && fullResetEnd > fullResetStart, 'Full-app reset is missing');
const fullReset = source.slice(fullResetStart, fullResetEnd);
assert.match(fullReset, /localStorage\.clear\(\)/);
assert.match(fullReset, /sessionStorage\?\.clear\(\)/);
assert.match(fullReset, /lanelab-force-onboarding/);
assert.match(fullReset, /onboarding=1/);

console.log('Onboarding/reset checks passed for first visit, import, refresh, current-game reset, and full reset.');
