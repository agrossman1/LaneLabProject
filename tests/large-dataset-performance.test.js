const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {performance} = require('node:perf_hooks');
const LaneLabStats = require('../js/stats.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/large-dataset-performance.json'), 'utf8'));
const balls = Array.from({length: fixture.ballCount}, (_, index) => `Ball ${index + 1}`);
const frames = Array.from({length: fixture.frameCount}, (_, index) => index % 3 === 0 ? 'X' : '9-');
const makeFrameThrows = gameIndex => Array.from({length: fixture.frameCount}, (_, frameIndex) => ({
  throws: [
    {hand: frameIndex % 2 ? 'L' : 'R', ball: balls[(gameIndex + frameIndex) % balls.length]},
    {hand: frameIndex % 2 ? 'R' : 'L', ball: balls[(gameIndex + frameIndex + 1) % balls.length]}
  ]
}));
const records = Array.from({length: fixture.gameCount}, (_, index) => LaneLabStats.normalizeGameRecord({
  id: `perf-${index}`,
  date: `2026-01-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`,
  score: 120 + (index % 101),
  frames,
  frameThrows: makeFrameThrows(index)
}, index)).filter(Boolean);

assert.equal(records.length, fixture.gameCount, 'large histories should normalize without dropping valid games');
assert.equal(new Set(records.flatMap(game => game.frameThrows.flatMap(frame => frame.throws.map(item => item.ball)))).size, fixture.ballCount);

const started = performance.now();
const sessions = LaneLabStats.groupSessions(records);
const summary = LaneLabStats.summarizeGames(records);
const elapsed = performance.now() - started;
assert.equal(sessions.length, 28, 'long histories should remain groupable by date');
assert.equal(summary.games, fixture.gameCount);
assert.equal(summary.strikeRate, 40);
assert.ok(elapsed < fixture.renderBudgetMs, `large dataset stats should complete within ${fixture.renderBudgetMs}ms (took ${Math.round(elapsed)}ms)`);

const storage = {
  values: new Map(),
  getItem(key) { return this.values.get(key) || null; },
  setItem(key, value) { this.values.set(key, value); }
};
const persisted = LaneLabStats.saveGameRecords(storage, records);
assert.equal(persisted.length, fixture.maxPersistedGames, 'persistence should cap records instead of growing without bound');
assert.equal(LaneLabStats.loadGameRecords(storage).length, fixture.maxPersistedGames);

assert.match(source, /\.historyScroll\{[^}]*max-height:[^}]*overflow-y:auto/);
assert.match(source, /function renderPersonalHistory\(\)[\s\S]*?box\.innerHTML\s*=/);

console.log(`Large dataset checks passed for ${fixture.gameCount} games, ${fixture.ballCount} balls, bounded persistence, and stats performance (${Math.round(elapsed)}ms).`);
