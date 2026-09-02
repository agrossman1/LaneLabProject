const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LaneLabStats = require('../js/stats.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/history-editing-regression.json'), 'utf8'));
const before = LaneLabStats.normalizeGameRecord(fixture.before);
const editedRecord = {...fixture.before, score: fixture.editedScore};
const after = LaneLabStats.normalizeGameRecord(editedRecord);
const plain = value => JSON.parse(JSON.stringify(value));

assert.equal(before.id, after.id);
assert.equal(after.score, fixture.editedScore);
for (const field of ['date', 'source', 'hand', 'ball', 'frames', 'pinData', 'frameThrows', 'ballStrikeRates']) {
  assert.deepEqual(plain(after[field]), plain(before[field]), `editing score dropped ${field}`);
}

const editStart = source.indexOf('function editHistoryGame(');
const editEnd = source.indexOf('function deleteHistoryGame(', editStart);
assert.ok(editStart >= 0 && editEnd > editStart, 'History edit handler is missing');
const editHandler = source.slice(editStart, editEnd);
assert.match(editHandler, /value===null\) return/);
assert.match(editHandler, /Number\.isInteger\(score\)/);
assert.match(editHandler, /score<0\|\|score>300/);
assert.match(editHandler, /saveGameRecords\(getGameStorage\(\),state\.games\)/);
assert.match(editHandler, /state\.recent=LaneLabStats\.saveScores/);

console.log('Game-history editing checks passed for metadata preservation, score updates, and validation safeguards.');
