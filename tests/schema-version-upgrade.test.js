const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LaneLabStats = require('../js/stats.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/schema-version-upgrade.json'), 'utf8'));
const normalized = fixture.versions.map((record, index) => LaneLabStats.normalizeGameRecord(record, index));

assert.deepEqual(normalized.map(record => record.score), fixture.expectedScores);
assert.equal(normalized[0].frames[0], 'X');
assert.equal(normalized[1].frames[1], '9/');
assert.equal(normalized[2].hand, 'Left');
assert.equal(normalized[2].ball, 'Ascent');
assert.equal(Object.hasOwn(normalized[2], 'futureField'), false, 'unknown future fields must not corrupt the canonical record');

// Applying normalization repeatedly must be safe and produce the same record.
normalized.forEach(record => assert.deepEqual(LaneLabStats.normalizeGameRecord(record), record));
const storage = {value: JSON.stringify(fixture.versions), getItem() { return this.value; }, setItem(key, value) { this.value = value; }};
assert.equal(LaneLabStats.loadGameRecords(storage).length, fixture.versions.length);
assert.equal(LaneLabStats.saveGameRecords(storage, normalized).length, fixture.versions.length);

assert.match(source, /schemaVersion:1/);
assert.match(source, /Accept raw arrays, app exports, and wrapped records/);
assert.match(source, /function importJsonRecords\(text\)[\s\S]*?\['games','records','state','data'\]/);
assert.match(source, /function normalizeGameRecord|normalizeGameRecord\(/);

console.log(`Schema upgrade checks passed for ${fixture.versions.length} schema versions, idempotent normalization, and unknown-field tolerance.`);
