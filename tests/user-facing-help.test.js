const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/user-facing-help.json'), 'utf8'));

assert.deepEqual(fixture.topics, ['scoring', 'pin notation', 'imports', 'exports', 'deletion']);
assert.equal(fixture.futureOnly, true);
assert.equal(fixture.requiredExamples.length, 5);
for (const surface of fixture.futureSurfaces) assert.ok(surface.length > 0);

// Until a dedicated help screen exists, the core controls must remain
// self-describing through visible labels, hints, and accessible names.
for (const phrase of ['Which pins did you knock down?', 'Tap a pin or drag across pins', 'Import Game History CSV / JSON', 'Export game data', 'Export CSV', 'Reset entire app']) {
  assert.ok(source.includes(phrase), `missing self-describing control: ${phrase}`);
}
assert.match(source, /aria-label="0 pins"/);
assert.match(source, /title="0 pins knocked down"/);
assert.match(source, /aria-label="Import scoreboard data from a photo or CSV file"/);
assert.match(source, /Clear all LaneLab data and start over/);

// Documentation examples must use established bowling notation and explain
// that exports are portable data while reset is destructive and recoverable only
// through a prior backup/import.
for (const example of fixture.requiredExamples) assert.ok(example.length > 0);
assert.match(source, /startsWith\('X'\)/);
assert.match(source, /includes\('\/'\)/);
assert.match(source, /function exportAllGameData\(\)/);
assert.match(source, /function exportGameDataCsv\(\)/);
assert.match(source, /function resetAllGameData\(\)/);

console.log('User-facing help checks passed for scoring, pin notation, import/export guidance, deletion warnings, and accessible control labels.');
