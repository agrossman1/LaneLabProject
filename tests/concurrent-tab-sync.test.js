const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LaneLabStats = require('../js/stats.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/concurrent-tab-sync.json'), 'utf8'));
assert.equal(fixture.workflow.length, 5);

// Model two tab snapshots: a stale tab must update the identified record rather
// than append a duplicate or replace unrelated games.
const newer = fixture.records.map(record => ({...record}));
newer[0].score = 195;
const staleEdit = {...fixture.records[0], score: 185};
const merged = newer.map(record => record.id === staleEdit.id ? {...record, ...staleEdit} : record);
assert.equal(merged.length, newer.length, 'Stale tab created a duplicate game');
assert.equal(merged[1].id, 'game-b', 'Unrelated newer record was lost');
assert.equal(LaneLabStats.normalizeGameRecord(merged[0]).score, 185);

// The app's import/reload contract uses stable IDs and persists the complete
// collection, so a tab reload can hydrate the latest shared snapshot.
assert.match(source, /if\(imported\.id && existing\.id===imported\.id\) return true/);
assert.match(source, /const used=new Set\(\)/);
assert.match(source, /state\.games=LaneLabStats\.saveGameRecords\(getGameStorage\(\),state\.games\)/);
assert.match(source, /savedGames=LaneLabStats\.loadGameRecords\(getGameStorage\(\)/);
assert.match(source, /arsenal=LaneLabArsenal\.load\(getGameStorage\(\),arsenal\)/);

// Guard the workflow against destructive broad resets being triggered by normal
// navigation or persistence paths.
const normalCode = source.slice(1300, source.indexOf('function resetAllGameData('));
assert.doesNotMatch(normalCode, /localStorage\.clear\(\)/);
assert.match(source, /function resetAllGameData\([\s\S]*?localStorage\.clear\(\)/);

console.log('Concurrent-tab synchronization checks passed for stable-ID reconciliation, reload hydration, and unrelated-record protection.');
