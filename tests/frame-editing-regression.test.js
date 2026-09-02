const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = source.indexOf('function isFrameComplete(');
const end = source.indexOf('function resetGame(', start);
assert.ok(start >= 0 && end > start, 'Could not locate scoring functions in index.html');

const context = { state: { frames: [] } };
vm.runInNewContext(source.slice(start, end), context);
assert.equal(typeof context.frameCumulativeScores, 'function');

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/frame-editing-regression.json'), 'utf8'));
for (const testCase of fixture.cases) {
  context.state.frames = testCase.before.map(rolls => ({ rolls: rolls.slice(), throws: [] }));
  const before = Array.from(context.frameCumulativeScores());
  context.state.frames = testCase.after.map(rolls => ({ rolls: rolls.slice(), throws: [] }));
  const after = Array.from(context.frameCumulativeScores());
  assert.deepEqual(after, testCase.expectedAfter, testCase.name);
  assert.notDeepEqual(after, before, `${testCase.name} did not change the score state`);
  assert.ok(after.some((score, index) => score !== before[index]), `${testCase.name} did not recalculate totals`);
}

// Keep the user-facing editor affordances covered by the template as well.
assert.match(source, /onclick="restartEditedFrame\(\)"/);
assert.match(source, /state\.pinTracking\.editing/);
assert.match(source, /state\.frames\[frameIndex\]=\{rolls:\[\],throws:\[\]\}/);

console.log(`Frame-editing regression checks passed for ${fixture.cases.length} cases.`);
