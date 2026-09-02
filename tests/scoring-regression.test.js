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

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/scoring-regression.json'), 'utf8'));
for (const testCase of fixture.cases) {
  context.state.frames = testCase.rolls.map(rolls => ({ rolls: rolls.slice(), throws: [] }));
  assert.deepEqual(Array.from(context.frameCumulativeScores()), testCase.cumulative, testCase.name);
}

console.log(`Scoring regression checks passed for ${fixture.cases.length} cases.`);
