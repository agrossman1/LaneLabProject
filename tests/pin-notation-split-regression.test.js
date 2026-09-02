const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = source.indexOf('function normalizeBowlingNotation(');
const end = source.indexOf('let historyHoldTimer=', start);
assert.ok(start >= 0 && end > start, 'Pin notation functions are missing');
const context = {};
vm.runInNewContext(source.slice(start, end), context);
assert.equal(typeof context.gameFrameNotation, 'function');
assert.equal(context.circledPinCount(7), '⑦');
assert.equal(context.pinLeaveIsSplit([7, 10]), true);
assert.equal(context.pinLeaveIsSplit([4, 5]), false);
assert.equal(context.pinLeaveIsSplit([1, 7, 10]), false);

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/pin-notation-split-regression.json'), 'utf8'));
for (const testCase of fixture.cases) {
  const notation = Array.from(context.gameFrameNotation(testCase.game));
  assert.deepEqual(notation, testCase.expected, testCase.name);
}

console.log(`Pin notation and split checks passed for ${fixture.cases.length} cases.`);
