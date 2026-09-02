const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LaneLabStats = require('../js/stats.js');
const LaneLabProfile = require('../js/profile.js');
const LaneLabArsenal = require('../js/arsenal.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/storage-failure-recovery.json'), 'utf8'));
const failingStorage = {
  getItem() { throw new Error('storage unavailable'); },
  setItem() { throw new Error('quota exceeded'); }
};

// Reads fall back safely when storage is unavailable or contains invalid data.
assert.deepEqual(LaneLabStats.loadScores(failingStorage, fixture.fallbackScores), fixture.fallbackScores);
assert.deepEqual(LaneLabStats.loadGameRecords(failingStorage, [fixture.fallbackProfile]), []);
assert.deepEqual(LaneLabProfile.load(failingStorage), LaneLabProfile.DEFAULT_PROFILE);
assert.deepEqual(LaneLabArsenal.load(failingStorage, fixture.fallbackBalls), fixture.fallbackBalls.map(LaneLabArsenal.normalizeBall));

// Writes swallow quota errors and still return normalized values, allowing the UI
// to remain usable without pretending a failed write was durable.
assert.doesNotThrow(() => LaneLabStats.saveScores(failingStorage, fixture.fallbackScores));
assert.doesNotThrow(() => LaneLabStats.saveGameRecords(failingStorage, []));
assert.doesNotThrow(() => LaneLabProfile.save(failingStorage, fixture.fallbackProfile));
assert.doesNotThrow(() => LaneLabArsenal.save(failingStorage, fixture.fallbackBalls));

assert.match(source, /function getGameStorage\(\)[\s\S]*?catch\(error\)\{return null\}/);
assert.match(source, /function toggleTheme\([\s\S]*?catch\(e\)\{\}/);
assert.match(source, /function loadSavedTheme\([\s\S]*?catch\(e\)\{\}/);
assert.match(source, /function recordGameScore\([\s\S]*?LaneLabStats\.saveGameRecords\(getGameStorage\(\)/);

console.log('Storage failure recovery checks passed for unavailable storage, quota errors, safe fallbacks, and no-crash persistence.');
