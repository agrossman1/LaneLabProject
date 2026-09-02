const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/print-share-export.json'), 'utf8'));

const quote = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
assert.equal(quote(fixture.htmlSample), '"<b>Ball & ""One""</b>"');
assert.equal(quote(null), '""');

const csvRow = ['id', '2026-09-02', 180, fixture.htmlSample].map(quote).join(',');
assert.match(csvRow, /"<b>Ball & ""One""<\/b>"/);
assert.equal(["header", csvRow].join('\r\n').split('\r\n').length, 2);

assert.match(source, /function exportAllGameData\(\)[\s\S]*?application\/json/);
assert.match(source, /link\.download=`lanelab-game-data-\$\{new Date\(\)\.toISOString\(\)\.slice\(0,10\)\}\.json`/);
assert.match(source, /function exportGameDataCsv\(\)[\s\S]*?text\/csv;charset=utf-8/);
assert.match(source, /link\.download=`lanelab-game-history-\$\{new Date\(\)\.toISOString\(\)\.slice\(0,10\)\}\.csv`/);
assert.match(source, /\.join\('\\r\\n'\)/);
assert.match(source, /URL\.revokeObjectURL\(url\)/);

// Exported values remain spreadsheet-safe even when names contain commas,
// quotes, markup, or line breaks; print/share consumers receive plain text.
assert.equal(quote('name,with,commas'), '"name,with,commas"');
assert.equal(quote('line 1\nline 2'), '"line 1\nline 2"');
assert.match(source, /\.historyScroll\{[^}]*overflow-y:auto/);
assert.match(source, /@media \(max-width:520px\)/);

assert.equal(fixture.jsonFilename.endsWith('.json'), true);
assert.equal(fixture.csvFilename.endsWith('.csv'), true);
assert.equal(fixture.csvMime, 'text/csv;charset=utf-8');
assert.equal(fixture.lineEnding, '\\r\\n');

console.log('Print/share/export checks passed for filenames, UTF-8 CSV encoding, spreadsheet quoting, cleanup, and responsive output.');
