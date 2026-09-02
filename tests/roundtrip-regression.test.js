const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const LaneLabStats = require('../js/stats.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const parseStart = source.indexOf('function parseCsvLine(');
const parseEnd = source.indexOf('function importCsvRecords(', parseStart);
assert.ok(parseStart >= 0 && parseEnd > parseStart, 'Could not locate CSV importer');
const context = {};
vm.runInNewContext(source.slice(parseStart, parseEnd), context);
assert.equal(typeof context.importCsvText, 'function');

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/roundtrip-regression.json'), 'utf8'));
const game = fixture.game;
const quote = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
const detailHeaders = Array.from({length: 10}, (_, index) => {
  const frame = index + 1;
  return [`frame_${frame}_pins_left_after_first`, `frame_${frame}_pins_knocked_down_second`, `frame_${frame}_pins_left_after_second`,
    ...Array.from({length: 3}, (_, throwIndex) => [`frame_${frame}_throw_${throwIndex + 1}_hand`, `frame_${frame}_throw_${throwIndex + 1}_ball`]).flat()];
}).flat();
const headers = ['id', 'date', 'score', ...Array.from({length: 10}, (_, i) => `frame_${i + 1}`),
  'strike_frames', 'strike_rate', 'spare_frames', 'open_frames', 'hand', 'ball', 'ball_strike_rates', ...detailHeaders];
const details = Array.from({length: 10}, (_, index) => {
  const pins = game.pinData[index] || {};
  const list = value => Array.isArray(value) ? value.join('-') : '';
  const throws = game.frameThrows[index]?.throws || [];
  return [list(pins.pinsLeftAfterFirst), list(pins.pinsKnockedDownSecond), list(pins.pinsLeftAfterSecond),
    ...Array.from({length: 3}, (_, throwIndex) => [throws[throwIndex]?.hand || '', throws[throwIndex]?.ball || '']).flat()];
}).flat();
const row = [game.id, game.date.slice(0, 10), game.score, ...game.frames, 4, game.strikeRate, 2, 2,
  game.hand, game.ball, JSON.stringify(game.ballStrikeRates), ...details];
const csv = [headers, row].map(values => values.map(quote).join(',')).join('\n');
const imported = context.importCsvText(csv);
assert.equal(imported.length, 1);
const normalized = LaneLabStats.normalizeGameRecord(imported[0]);
const plain = value => JSON.parse(JSON.stringify(value));
assert.deepEqual(plain(normalized.frames), game.frames);
assert.deepEqual(plain(normalized.pinData.slice(0, 2)), game.pinData);
const compactThrows = frames => plain(frames).map(frame => ({
  throws: frame.throws.filter(item => item && (item.hand || item.ball))
}));
assert.deepEqual(compactThrows(normalized.frameThrows.slice(0, 2)), game.frameThrows);
assert.deepEqual(plain(normalized.ballStrikeRates), game.ballStrikeRates);
assert.equal(normalized.hand, 'Ambidextrous');
assert.equal(normalized.ball, 'Hy-Road, Ascent');
assert.equal(normalized.strikeRate, game.strikeRate);
const summary = LaneLabStats.summarizeGames([normalized]);
assert.equal(summary.strikeRate, 50);
assert.equal(summary.spareRate, 60);

// Guard the exporter schema so future column changes cannot silently drop data.
for (const requiredColumn of ['ball_strike_rates', 'pins_left_after_first', 'pins_knocked_down_second', 'throw_${throwIndex+1}_hand', 'throw_${throwIndex+1}_ball']) {
  assert.ok(source.includes(requiredColumn), `CSV schema is missing ${requiredColumn}`);
}

console.log('Import/export round-trip checks passed for frames, pin data, hands, balls, and statistics.');
