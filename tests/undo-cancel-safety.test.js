const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/undo-cancel-safety.json'), 'utf8'));
assert.equal(fixture.checks.length, 4);

const undoStart = source.indexOf('function undoRoll(');
const undoEnd = source.indexOf('function resetGame(', undoStart);
assert.ok(undoStart >= 0 && undoEnd > undoStart, 'Undo handler is missing');
const context = {state: {frames: Array.from({length: 10}, () => ({rolls: [], throws: []})), currentFrame: 1, completed: true}, renderAll() {}};
vm.runInNewContext(source.slice(undoStart, undoEnd), context);
context.state.frames[0].rolls = fixture.framesBeforeUndo[0].slice();
context.state.frames[1].rolls = fixture.framesBeforeUndo[1].slice();
context.undoRoll();
assert.deepEqual(context.state.frames.slice(0, 2).map(frame => frame.rolls), fixture.framesAfterUndo);
assert.equal(context.state.completed, false, 'Undo must reopen a completed game');

// Cancel/close paths must only change UI state and selection, never save records.
for (const handler of ['closeBallModal', 'closeBallDetails', 'closeGameDetail', 'closeAvatarPicker']) {
  assert.match(source, new RegExp(`function ${handler}\\(`), `Missing close handler: ${handler}`);
}
assert.match(source, /function closeBallModal\(\)\{document\.getElementById\('ballModal'\)\.classList\.remove\('show'\)\}/);
assert.match(source, /function closeBallDetails\([\s\S]*?selectedBallId=null/);
assert.match(source, /function closeGameDetail\(\)\{document\.getElementById\('gameDetailModal'\)\.classList\.remove\('show'\)\}/);
assert.match(source, /function editHistoryGame\([\s\S]*?if\(value===null\) return/);

// Recording remains explicit: score persistence is reached through saveGame ->
// recordGameScore, not merely by entering rolls or opening an editor.
assert.match(source, /function saveGame\([\s\S]*?recordGameScore\(score/);
assert.match(source, /function recordRoll\([\s\S]*?renderAll\(\)/);
assert.match(source, /function recordRoll\([\s\S]*?if\(state\.completed && editingIndex===null\) return/);

console.log('Undo/cancel safety checks passed for undo, modal closes, cancel actions, and unsaved-change protection.');
