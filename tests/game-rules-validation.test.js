const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const LaneLabStats = require('../js/stats.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/game-rules-validation.json'), 'utf8'));
const start = source.indexOf('function isFrameComplete(');
const end = source.indexOf('function resetGame(', start);
assert.ok(start >= 0 && end > start, 'Scoring rule functions are missing');
const context = {state: {frames: []}};
vm.runInNewContext(source.slice(start, end), context);

const frames = rolls => Array.from({length: 10}, (_, index) => ({rolls: (rolls[index] || []).slice(), throws: []}));
context.state.frames = frames(fixture.perfectGame.frames);
assert.equal(context.frameCumulativeScores()[9], fixture.perfectGame.score, 'Perfect game must score 300');
assert.equal(context.isFrameComplete(9), true, '10th-frame bonus balls must complete the frame');

context.state.frames = frames(fixture.tenthFrame.frames);
assert.equal(context.frameCumulativeScores()[9], fixture.tenthFrame.score, '10th-frame bonus scoring is incorrect');

// A zero-pin roll is the scorecard representation used for a foul/gutter result.
context.state.frames = frames(fixture.foulAsZero.frames);
assert.equal(context.rollDisplay(0, 0), '-', 'Zero-pin/foul roll must display as a dash');
assert.equal(context.frameCumulativeScores()[0], 9, 'Foul/no-pin roll must contribute zero pins');

// Incomplete games remain unfinished and do not produce a final score.
context.state.frames = frames([[10], [9], [], [], [], [], [], [], [], []]);
assert.equal(context.frameCumulativeScores()[9], null, 'Incomplete game must not receive a final score');
assert.equal(context.isFrameComplete(1), false, 'A one-ball open frame is incomplete');

for (const score of fixture.invalidScores) assert.equal(LaneLabStats.normalizeScores([score]).length, 0, `Invalid score accepted: ${score}`);
assert.deepEqual(LaneLabStats.normalizeScores([0, 300]), [0, 300], 'Valid score limits were rejected');

// Parser and keypad guards prevent impossible pin totals and extra rolls in frames 1–9.
assert.match(source, /function parseFrameNotation\([\s\S]*?first\+second>10/);
assert.match(source, /function parseFrameNotation\([\s\S]*?if\(token==='X'\) return \[10\]/);
assert.match(source, /function parseFrameNotation\([\s\S]*?if\(token\.length>3\) return null/);
assert.match(source, /function currentMaxPins\([\s\S]*?return 10-r\[0\]/);

console.log('Game-rules validation passed for perfect games, 10th-frame bonuses, fouls/zero pins, incomplete games, impossible totals, and score limits.');
