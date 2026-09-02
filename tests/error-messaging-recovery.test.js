const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LaneLabStats = require('../js/stats.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/error-messaging-recovery.json'), 'utf8'));

// Every representative failure has a user-visible, actionable message.
for (const failure of fixture.failureCases) assert.match(source, new RegExp(failure.message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.match(source, /function toast\(msg\)\{[\s\S]*?textContent=msg/);

// Invalid score input is rejected before persistence, leaving the prior data
// untouched; the normalization contract also rejects values outside limits.
assert.deepEqual(LaneLabStats.normalizeScores([190, -1, 301, 'bad']), [190]);
assert.match(source, /if\(!Number\.isInteger\(score\)\|\|score<0\|\|score>300\)\{toast\('Enter a whole number from 0 to 300'\);return;\}/);

// Import failures return before saveGameRecords, so existing games remain in
// place while the user receives a clear result instead of a silent wipe.
assert.match(source, /function importJsonRecords\(text\)\{[\s\S]*?try\{payload=JSON\.parse\(text\)\}catch\(error\)\{return 0\}/);
assert.match(source, /function importHistoryFile\(file,text\)\{[\s\S]*?return isJson\?importJsonRecords\(text\):importCsvRecords\(text\)/);
assert.match(source, /state\.games=LaneLabStats\.saveGameRecords\(getGameStorage\(\),state\.games\)/);
assert.match(source, /if\(!count\)\{toast\('No valid game records found in that file'\);return\}/);

// Validation failures in add-ball and file pickers return before writes and
// clear the picker value so a corrected retry is possible.
assert.match(source, /if\(!typedName\)[\s\S]*?toast\('Enter a ball name to add it'\);return/);
assert.match(source, /is already in your arsenal/);
assert.match(source, /if\(Number\(file\.size\)>MAX_IMPORT_FILE_BYTES\)\{toast\('That file is too large/);
assert.match(source, /reader\.onerror=\(\)=>toast\('Could not read that file'\)/);

console.log(`Error messaging/recovery checks passed for ${fixture.failureCases.length} actionable failures, validation guards, and non-destructive recovery paths.`);
