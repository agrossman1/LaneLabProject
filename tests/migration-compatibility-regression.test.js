const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const LaneLabStats = require('../js/stats.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/migration-compatibility-regression.json'), 'utf8'));
const plain = value => JSON.parse(JSON.stringify(value));

// Legacy JSON may be a raw record or nested under `games`.
const raw = LaneLabStats.normalizeGameRecord(fixture.legacyJson);
const wrapped = fixture.wrappedJson.games.map(record => LaneLabStats.normalizeGameRecord(record))[0];
assert.equal(raw.score, 165);
assert.equal(raw.hand, 'Right');
assert.equal(raw.ball, 'Hy-Road');
assert.equal(raw.frames.length, 10);
assert.equal(wrapped.score, 142);
assert.equal(wrapped.hand, 'Left');
assert.equal(wrapped.ball, 'Ascent');

// Legacy CSV headers (spaces, F1/F2 columns, Equipment, Strike Frames) still parse.
const parseStart = source.indexOf('function parseCsvLine(');
const parseEnd = source.indexOf('function importCsvRecords(', parseStart);
assert.ok(parseStart >= 0 && parseEnd > parseStart, 'CSV migration parser is missing');
const context = {};
vm.runInNewContext(source.slice(parseStart, parseEnd), context);
const csvRecord = context.importCsvText(fixture.legacyCsv)[0];
const migratedCsv = LaneLabStats.normalizeGameRecord(csvRecord);
assert.equal(migratedCsv.score, 138);
assert.equal(migratedCsv.hand, 'Right');
assert.equal(migratedCsv.ball, 'Hy-Road');
assert.deepEqual(plain(migratedCsv.frames.slice(0, 4)), ['X', '9/', '8-', 'X']);
assert.equal(migratedCsv.source, 'csv import');

// Keep the compatibility entry points and legacy aliases present.
assert.match(source, /Accept raw arrays, app exports, and wrapped records/);
assert.match(source, /indexOf\('score','gamescore','finalscore','totalscore','points'\)/);
assert.match(source, /indexOf\('ball','equipment'\)/);
assert.match(source, /indexOf\('strikes','strike','strikeframes'\)/);

console.log('Migration compatibility checks passed for legacy JSON and CSV formats.');
