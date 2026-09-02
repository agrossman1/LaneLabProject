const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LaneLabArsenal = require('../js/arsenal.js');

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/arsenal-metrics-regression.json'), 'utf8'));
const records = fixture.records;
const plain = value => JSON.parse(JSON.stringify(value));

for (const ballName of ['Hy-Road', 'Ascent']) {
  const stats = LaneLabArsenal.calculateStats(records, ballName);
  const expected = fixture.expected[ballName];
  assert.deepEqual(plain(stats), {
    games: expected.games,
    average: expected.average,
    high: expected.high,
    strikeRate: expected.strikeRate
  }, `${ballName} usage and strike metrics`);
}

// Template expectations for metrics that depend on throw-level attribution.
const spareRateForBall = ballName => {
  let opportunities = 0;
  let makes = 0;
  records.forEach(game => (game.frameThrows || []).forEach((frame, index) => {
    const first = frame.throws?.[0];
    if (!first || LaneLabArsenal.normalizeName(first.ball) !== LaneLabArsenal.normalizeName(ballName)) return;
    const notation = String(game.frames?.[index] || '');
    if (!notation.startsWith('X')) {
      opportunities++;
      if (notation.includes('/')) makes++;
    }
  }));
  return opportunities ? Math.round(makes / opportunities * 100) : null;
};
assert.equal(spareRateForBall('Hy-Road'), fixture.expected['Hy-Road'].spareRate);
assert.equal(spareRateForBall('Ascent'), fixture.expected.Ascent.spareRate);

const multiBallGames = records.filter(game => {
  const balls = new Set((game.frameThrows || []).flatMap(frame => (frame.throws || []).map(item => LaneLabArsenal.normalizeName(item.ball))).filter(Boolean));
  return balls.size > 1;
}).length;
assert.equal(multiBallGames, fixture.expected.multiBallGames);

console.log('Arsenal metrics checks passed for usage, strike rate, spare rate, and multi-ball games.');
