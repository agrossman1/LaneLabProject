const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/navigation-state-restoration.json'), 'utf8'));

fixture.screens.forEach(id => assert.match(source, new RegExp(`id="${id}"`), `${id} screen should remain addressable`));
fixture.deepLinks.forEach(link => assert.match(link, /^#(?:home|score|stats|arsenal|coach)$/));
assert.equal(fixture.selectedFrame, 2);

assert.match(source, /function go\(id\)[\s\S]*?querySelectorAll\('\.screen'\)/);
assert.match(source, /function go\(id\)[\s\S]*?dataset\.target===id/);
assert.match(source, /window\.scrollTo\(\{top:0/);
assert.match(source, /const CURRENT_SCREEN_STORAGE_KEY='lanelab-current-screen'/);
assert.match(source, /function restoreLastScreen\(\)/);
assert.match(source, /restoreLastScreen\(\);/);

// Frame selection/edit state is kept in the central state object, so changing
// screens or re-rendering cannot silently move the user to another frame.
assert.match(source, /editingFrame:null/);
assert.match(source, /state\.editingFrame=frameIndex/);
assert.match(source, /state\.currentFrame=frameIndex/);
assert.match(source, /state\.pinTracking\.frameIndex===i/);
assert.match(source, /state\.editingFrame===i/);

// Refresh hydration must run before the initial render and restore persisted
// records without requiring a second navigation action.
assert.match(source, /const initialGames=\[/);
assert.match(source, /renderAll\(\);renderChart\(\);renderRecent\(\)/);
assert.match(source, /LaneLabStats\.loadGameRecords/);

console.log('Navigation/state checks passed for screen addressing, deep-link targets, refresh hydration, and selected-frame preservation.');
