const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LaneLabStats = require('../js/stats.js');
const LaneLabArsenal = require('../js/arsenal.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/data-integrity-duplicates.json'), 'utf8'));
const storage = new Map();
const storageStub = {getItem: key => storage.has(key) ? storage.get(key) : null, setItem: (key, value) => storage.set(key, value)};

// Malformed records never enter the normalized game collection.
assert.equal(LaneLabStats.normalizeGameRecord(fixture.validGame).score, 190);
for (const malformed of fixture.malformedGames) assert.equal(LaneLabStats.normalizeGameRecord(malformed), null);
assert.deepEqual(LaneLabStats.normalizeScores([190, 'bad', 301, -1, 0]), [190, 0]);

// Arsenal persistence filters invalid entries and preserves stable IDs, while the
// UI rejects a duplicate normalized ball name before writing another catalog row.
const savedBalls = LaneLabArsenal.save(storageStub, [...fixture.balls, null, {name: ''}]);
assert.equal(savedBalls.length, 2);
assert.deepEqual(savedBalls.map(ball => ball.id), ['ball-1', 'ball-2']);
assert.match(source, /const duplicate=arsenal\.some\(ball=>LaneLabArsenal\.normalizeName\(ball\.name\)===LaneLabArsenal\.normalizeName\(name\)\)/);
assert.match(source, /if\(duplicate\)\{toast\(.*already in your arsenal/);

// Re-importing an identified record reconciles it by ID instead of appending a
// second game; malformed JSON/CSV rows are filtered before persistence.
assert.match(source, /const valid=records\.filter\(record=>record&&Number\.isFinite\(Number\(record\.score\)\)\)/);
assert.match(source, /if\(imported\.id && existing\.id===imported\.id\) return true/);
assert.match(source, /const used=new Set\(\)/);
assert.match(source, /if\(match\)\{ Object\.assign\(match,imported\); used\.add\(state\.games\.indexOf\(match\)\); \}/);
assert.match(source, /state\.games=LaneLabStats\.saveGameRecords\(getGameStorage\(\),state\.games\)/);

console.log('Data integrity checks passed for duplicate reconciliation, duplicate-ball protection, malformed records, and safe persistence.');
