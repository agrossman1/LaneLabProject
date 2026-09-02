const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LaneLabArsenal = require('../js/arsenal.js');
const LaneLabProfile = require('../js/profile.js');
const LaneLabStats = require('../js/stats.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/empty-state-coverage.json'), 'utf8'));

const profile = LaneLabProfile.normalizeProfile(fixture.emptyProfile);
assert.equal(profile.name, '');
assert.equal(profile.hand, 'Ambidextrous');
assert.equal(LaneLabArsenal.load({getItem: () => null}, []).length, 0, 'a new user starts with no balls when no fallback arsenal is supplied');
assert.deepEqual(LaneLabStats.summarizeGames([]), {
  games: 0, average: null, openFrames: 0, openPerGame: null, strikeRate: null, spareRate: null,
  singleAttempts: 0, singleMakes: 0, singlePct: null, leaves: []
});

const incomplete = LaneLabStats.normalizeGameRecord(fixture.incompleteGame);
const missingMetadata = LaneLabStats.normalizeGameRecord(fixture.missingMetadataGame);
assert.equal(incomplete.frames.length, 2, 'incomplete games retain recorded frames');
assert.equal(missingMetadata.hand, null);
assert.equal(missingMetadata.ball, null);
assert.equal(LaneLabStats.summarizeGames([incomplete]).games, 1);

assert.match(source, /coachSummary[\s\S]*?Complete a bowling session to get a personalized recommendation/);
assert.match(source, /function renderPersonalHistory\(\)[\s\S]*?No games in this date range/);
assert.match(source, /Your arsenal is empty[\s\S]*?Add a ball to start tracking equipment stats/);
assert.match(source, /Record games to see your averages/);
assert.match(source, /No games recorded yet/);
assert.match(source, /No exact pin data/);
assert.match(source, /value===null\?'—'/);

console.log('Empty-state checks passed for new users, no balls/games, incomplete games, missing metadata, and empty statistics.');
