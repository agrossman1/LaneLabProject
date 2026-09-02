const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LaneLabStats = require('../js/stats.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/multi-device-conflict.json'), 'utf8'));
assert.equal(fixture.conflictPolicy, 'stable-id-with-newer-revision-wins');

// Model the future sync merge contract: stable IDs prevent duplicates, a newer
// revision wins, stale updates are ignored, and unrelated records survive.
const merge = (local, incoming) => {
  const result = local.map(record => ({...record}));
  for (const update of incoming) {
    const index = result.findIndex(record => record.id === update.id);
    if (index < 0) result.push({...update});
    else if (Number(update.revision) > Number(result[index].revision)) result[index] = {...result[index], ...update};
  }
  return result;
};
const afterStale = merge(fixture.records, [fixture.staleUpdate]);
assert.equal(afterStale.length, fixture.records.length);
assert.equal(afterStale.find(record => record.id === 'game-a').score, 180);
const afterNewer = merge(afterStale, [fixture.newerUpdate]);
assert.equal(afterNewer.find(record => record.id === 'game-a').score, 190);
assert.equal(afterNewer.find(record => record.id === 'game-b').score, 165);
assert.equal(LaneLabStats.normalizeGameRecord(afterNewer[0]).score, 190);

// Current local/import reconciliation already uses stable IDs and persists the
// complete collection; retain these guards until an account sync layer exists.
assert.match(source, /if\(imported\.id && existing\.id===imported\.id\) return true/);
assert.match(source, /const used=new Set\(\)/);
assert.match(source, /state\.games=LaneLabStats\.saveGameRecords\(getGameStorage\(\),state\.games\)/);
assert.match(source, /savedGames=LaneLabStats\.loadGameRecords\(getGameStorage\(\)/);
assert.doesNotMatch(source, /function mergeRemoteData[\s\S]*?localStorage\.clear\(\)/);

console.log('Multi-device conflict checks passed for stable IDs, stale-update protection, newer revisions, and unrelated-record preservation.');
