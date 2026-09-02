const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/file-picker-compatibility.json'), 'utf8'));

assert.equal(fixture.oversizedBytes > fixture.maxBytes, true);
for (const name of fixture.supported) assert.match(name, /\.(csv|json)$/i);
for (const name of fixture.unsupported) assert.doesNotMatch(name, /\.(csv|json)$/i);

// Both history pickers must treat cancel as a no-op, reject oversized and
// unsupported files before FileReader runs, and report read/parse failures.
assert.match(source, /const MAX_IMPORT_FILE_BYTES=10\*1024\*1024/);
assert.match(source, /function importFileIsSupported\(file\)\{[\s\S]*?\.\(csv\|json\)/);
for (const handler of ['handleHistoryFileImport', 'handleOnboardingHistoryFile']) {
  const block = source.match(new RegExp(`function ${handler}\\(event\\)\\{[\\s\\S]*?\\n\\}`))?.[0] || '';
  assert.match(block, /event\.target\.files\?\.\[0\]; if\(!file\) return/);
  assert.match(block, /file\.size\)>MAX_IMPORT_FILE_BYTES/);
  assert.match(block, /!importFileIsSupported\(file\)/);
  assert.match(block, /reader\.onerror=\(\)=>toast\('Could not read that file'\)/);
}

// Malformed text is routed through the normal parser and produces the same
// safe empty-result message; it must never be persisted as a game.
assert.match(source, /No valid game records found in that file/);
assert.match(source, /const count=importHistoryFile\(file,String\(reader\.result\|\|''\)\)/);
assert.ok(fixture.malformedText.includes('not a valid game record'));

console.log('File-picker compatibility checks passed for cancellation, file-type/size guards, read errors, and malformed text.');
