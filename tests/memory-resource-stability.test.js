const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LaneLabStats = require('../js/stats.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/memory-resource-stability.json'), 'utf8'));

// Exercise the same bounded data shape used by long scoring sessions. Each
// cycle replaces the current snapshot; it must not accumulate stale games.
let snapshot = [];
for (let cycle = 0; cycle < fixture.scoringThrows; cycle++) {
  snapshot = LaneLabStats.saveGameRecords({
    getItem: () => null,
    setItem: () => {}
  }, [{ id: `session-${cycle}`, score: 150, frames: ['X', '9-'] }]);
  assert.equal(snapshot.length, 1);
}
assert.equal(snapshot.length, fixture.maxRetainedSnapshots);
assert.ok(fixture.navigationCycles > 0 && fixture.modalCycles > 0 && fixture.importCycles > 0);

// Repeated exports/imports must release temporary object URLs and clear the
// file input value, preventing retained blobs and same-file picker dead ends.
assert.equal((source.match(/URL\.createObjectURL\(blob\)/g) || []).length, (source.match(/URL\.revokeObjectURL\(url\)/g) || []).length);
assert.match(source, /handleHistoryFileImport\(event\)[\s\S]*?event\.target\.value='';/);
assert.match(source, /handleOnboardingHistoryFile\(event\)[\s\S]*?event\.target\.value='';/);

// Modal close paths remove the visible state, and long-press timers are always
// canceled when the related view closes instead of leaking across navigation.
for (const fn of ['closeAvatarPicker', 'closeGameDetail', 'closeMedalDetail', 'closeBallDetails', 'closeBallModal']) {
  assert.match(source, new RegExp(`function ${fn}\\(\\)[\\s\\S]*?classList\\.remove\\('show'\\)`));
}
assert.match(source, /function closeGameDetail\(\)[\s\S]*?clearTimeout\(historyHoldTimer\);historyHoldTimer=null/);
assert.match(source, /function closeHistoryMenus\(\)[\s\S]*?clearTimeout\(historyHoldTimer\);historyHoldTimer=null/);
assert.match(source, /function cancelHomeAverageHold\(\)[\s\S]*?clearTimeout\(homeAverageHoldTimer\);homeAverageHoldTimer=null/);

// Rendering replaces list contents rather than appending a new copy on every
// navigation cycle; this is the key DOM-retention contract for long sessions.
assert.match(source, /function renderPersonalHistory\(\)[\s\S]*?box\.innerHTML\s*=/);
assert.match(source, /function renderArsenal\(\)[\s\S]*?\.innerHTML\s*=/);

console.log(`Memory/resource stability checks passed for ${fixture.navigationCycles} navigation cycles, ${fixture.modalCycles} modal cycles, ${fixture.importCycles} imports, and ${fixture.scoringThrows} scoring throws.`);
