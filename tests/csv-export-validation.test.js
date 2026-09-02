const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const LaneLabStats = require('../js/stats.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/roundtrip-regression.json'), 'utf8'));
const start = source.indexOf('function exportGameDataCsv(');
const end = source.indexOf('function resetAllGameData(', start);
assert.ok(start >= 0 && end > start, 'CSV export function is missing');

let exportedText = '';
class CaptureBlob {
  constructor(parts) { exportedText = String(parts?.[0] || ''); }
}
const context = {
  state: {games: [fixture.game]},
  LaneLabStats,
  gameFrameNotation: game => game.frames,
  document: {
    createElement: () => ({click() {}, remove() {}}),
    body: {appendChild() {}}
  },
  URL: {createObjectURL: () => 'blob:test', revokeObjectURL() {}},
  Blob: CaptureBlob,
  toast() {}
};
vm.runInNewContext(source.slice(start, end), context);
context.exportGameDataCsv();
assert.ok(exportedText, 'Exporter did not create CSV content');

const parseLine = line => {
  const cells = []; let cell = ''; let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { cell += '"'; i++; continue; }
      quoted = !quoted; continue;
    }
    if (char === ',' && !quoted) { cells.push(cell); cell = ''; continue; }
    cell += char;
  }
  cells.push(cell); return cells;
};
const [headerLine, rowLine] = exportedText.split(/\r?\n/);
const headers = parseLine(headerLine);
const row = parseLine(rowLine);
assert.equal(row.length, headers.length, 'CSV row does not match header column count');
const values = Object.fromEntries(headers.map((header, index) => [header, row[index]]));

const required = ['id', 'date', 'score', ...Array.from({length: 10}, (_, i) => `frame_${i + 1}`),
  'strike_frames', 'strike_rate', 'spare_frames', 'open_frames', 'hand', 'ball', 'ball_strike_rates'];
for (const column of required) assert.ok(headers.includes(column), `Missing required CSV column: ${column}`);
for (const column of ['frame_1_pins_left_after_first', 'frame_1_pins_knocked_down_second', 'frame_1_pins_left_after_second', 'frame_1_throw_1_hand', 'frame_1_throw_1_ball']) {
  assert.ok(headers.includes(column), `Missing detail CSV column: ${column}`);
}
assert.equal(values.id, fixture.game.id);
assert.equal(Number(values.score), fixture.game.score);
assert.equal(values.frame_1, fixture.game.frames[0]);
assert.equal(values.hand, fixture.game.hand);
assert.equal(values.ball, fixture.game.ball);
assert.deepEqual(JSON.parse(values.ball_strike_rates), {'Hy-Road': 100, Ascent: 0});
assert.equal(values.frame_1_pins_left_after_first, '');
assert.equal(values.frame_1_throw_1_hand, 'Right');
assert.equal(values.frame_1_throw_1_ball, 'Hy-Road');
assert.equal(values.frame_2_pins_left_after_first, '1');
assert.equal(values.frame_2_pins_knocked_down_second, '1');
assert.equal(values.frame_2_pins_left_after_second, '');
assert.equal(values.frame_2_throw_1_hand, 'Left');
assert.equal(values.frame_2_throw_1_ball, 'Ascent');

console.log(`CSV export validation passed for ${headers.length} columns and all representative values.`);
