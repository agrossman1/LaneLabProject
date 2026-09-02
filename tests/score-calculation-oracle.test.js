const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/score-calculation-oracle.json'), 'utf8'));
const start = source.indexOf('function isFrameComplete(');
const end = source.indexOf('function resetGame(', start);
assert.ok(start >= 0 && end > start, 'scoring functions must remain extractable for oracle checks');
const context = {state: {frames: []}};
vm.runInNewContext(source.slice(start, end), context);

function oracle(frames) {
  const rolls = frames.flat();
  let cursor = 0;
  const totals = [];
  let cumulative = 0;
  for (let frame = 0; frame < 10; frame++) {
    const first = rolls[cursor++];
    let points;
    if (first === 10) {
      points = 10 + (rolls[cursor] ?? 0) + (rolls[cursor + 1] ?? 0);
    } else {
      const second = rolls[cursor++];
      if (first + second === 10) points = 10 + (rolls[cursor] ?? 0);
      else points = first + second;
    }
    cumulative += points;
    totals.push(cumulative);
  }
  return totals;
}

for (const testCase of fixture.cases) {
  const expected = oracle(testCase.rolls);
  assert.deepEqual(expected, testCase.cumulative, `${testCase.name} fixture must match the independent oracle`);
  context.state.frames = testCase.rolls.map(rolls => ({rolls: rolls.slice(), throws: []}));
  assert.deepEqual(Array.from(context.frameCumulativeScores()), expected, testCase.name);
}

assert.match(source, /function frameCumulativeScores\(\)[\s\S]*?if\(r\[0\]===10\)/);
assert.match(source, /function frameCumulativeScores\(\)[\s\S]*?r\[0\]\+r\[1\]===10/);
assert.match(source, /function frameCumulativeScores\(\)[\s\S]*?isFrameComplete\(9\)/);

console.log(`Score calculation oracle passed for ${fixture.cases.length} known-valid frame and bonus combinations.`);
