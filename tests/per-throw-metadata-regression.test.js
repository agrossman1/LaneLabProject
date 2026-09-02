const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LaneLabStats = require('../js/stats.js');

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/per-throw-metadata-regression.json'), 'utf8'));
const normalized = LaneLabStats.normalizeGameRecord(fixture.game);
const plain = value => JSON.parse(JSON.stringify(value));

assert.equal(normalized.hand, fixture.expected.hand);
assert.equal(normalized.ball, fixture.expected.ball);
assert.deepEqual(plain(normalized.frameThrows[0].throws), fixture.expected.throwsInFrame1);

const combinations = normalized.frameThrows
  .flatMap(frame => frame.throws)
  .filter(item => item.hand && item.ball)
  .map(item => `${item.hand}|${item.ball}`);
assert.deepEqual([...new Set(combinations)], fixture.expected.uniqueCombinations);
assert.equal(combinations.filter(item => item === 'Right|Hy-Road').length, 2);
assert.equal(combinations.filter(item => item === 'Left|Ascent').length, 2);

console.log('Per-throw metadata checks passed for mixed hands and balls within one game.');
