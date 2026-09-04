const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LaneLabStats = require('../js/stats.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/persistence-reload-regression.json'), 'utf8'));
const storage = new Map();
const storageStub = {
  getItem: key => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, value)
};
const plain = value => JSON.parse(JSON.stringify(value));

const saved = LaneLabStats.saveGameRecords(storageStub, fixture.records);
assert.equal(saved.length, 2);
assert.ok(storage.has(LaneLabStats.RECORDS_STORAGE_KEY));
const reloaded = LaneLabStats.loadGameRecords(storageStub, []);
assert.deepEqual(plain(reloaded), plain(saved));
assert.deepEqual(reloaded.map(game => game.score), [172, 148]);
assert.equal(reloaded[1].source, 'csv import');
assert.equal(reloaded[1].hand, 'Ambidextrous');
assert.equal(reloaded[1].ball, 'Hy-Road, Ascent');
assert.deepEqual(plain(reloaded[1].ballStrikeRates), {"Hy-Road": 50, "Ascent": 33});
assert.deepEqual(plain(reloaded[1].pinData[0]), plain(fixture.records[1].pinData[0]));

const scores = LaneLabStats.saveScores(storageStub, saved.map(game => game.score));
assert.deepEqual(scores, [172, 148]);
assert.deepEqual(LaneLabStats.loadScores(storageStub, []), scores);

// Guard the app boot path so a refresh continues to hydrate persisted records.
assert.match(source, /LaneLabStats\.loadGameRecords\(getGameStorage\(\),\[\]\)/);
assert.match(source, /state\.games=LaneLabStats\.saveGameRecords\(getGameStorage\(\),state\.games\)/);
assert.match(source, /const CURRENT_GAME_STORAGE_KEY='lanelab-current-game'/);
assert.match(source, /function persistCurrentGame\(\)/);
assert.match(source, /function restoreCurrentGame\(\)/);
assert.match(source, /restoreCurrentGame\(\);/);

console.log('Persistence/reload checks passed for saved records, scores, metadata, and refresh hydration.');
