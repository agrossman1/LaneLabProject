const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LaneLabStats = require('../js/stats.js');

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/import-regression.json'), 'utf8'));
const games = fixture.games.map((game, index) => LaneLabStats.normalizeGameRecord(game, index));

assert.equal(games.length, 3);
assert.deepEqual(
  { hand: games[0].hand, ball: games[0].ball, source: games[0].source },
  { hand: 'Right', ball: 'Hy-Road', source: 'manual' }
);
assert.equal(games[0].frames[0], 'X');
assert.ok(Array.isArray(games[0].pinData));
assert.equal(games[1].source, 'csv import');
assert.equal(games[2].hand, null);
assert.equal(games[2].ball, null);
assert.equal(games[2].frameThrows[0].throws[0].hand, null);
assert.equal(games[2].frameThrows[0].throws[0].ball, null);

console.log(`Importer regression checks passed for ${games.length} fixture games.`);
