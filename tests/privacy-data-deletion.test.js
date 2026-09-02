const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/privacy-data-deletion.json'), 'utf8'));

// The JSON backup is a complete, documented export rather than an accidental
// dump of globals. Keep this allow-list explicit so new private fields cannot
// silently become part of the portable file.
const exportKeys = Object.keys(fixture.exportedPayload);
assert.deepEqual(exportKeys.sort(), [...fixture.allowedExportKeys].sort());
for (const key of fixture.sensitiveKeys) assert.equal(Object.prototype.hasOwnProperty.call(fixture.exportedPayload, key), false);
assert.match(source, /const payload=\{schemaVersion:1,exportedAt:new Date\(\)\.toISOString\(\),profile, games:state\.games, recentScores:state\.recent\}/);
assert.match(source, /new Blob\(\[JSON\.stringify\(payload,null,2\)\],\{type:'application\/json'\}\)/);
assert.match(source, /link\.download=`lanelab-game-data-\$\{new Date\(\)\.toISOString\(\)\.slice\(0,10\)\}\.json`/);

// Deletion must clear both app storage areas, in-memory collections, and the
// onboarding marker before redirecting. This protects against stale data being
// shown after a reset and makes the operation recoverable through re-onboarding.
assert.match(source, /function resetAllGameData\(\)\{[\s\S]*?window\.localStorage\.clear\(\)/);
assert.match(source, /function resetAllGameData\(\)\{[\s\S]*?window\.sessionStorage\?\.clear\(\)/);
assert.match(source, /function resetAllGameData\(\)\{[\s\S]*?setItem\('lanelab-force-onboarding','true'\)/);
assert.match(source, /function resetAllGameData\(\)\{[\s\S]*?state\.games=\[\];[\s\S]*?state\.recent=\[\];/);
assert.match(source, /window\.location\.replace\(`\$\{window\.location\.pathname\}\?reset=\$\{Date\.now\(\)\}&onboarding=1`\)/);

// The destructive action is only wired to the explicitly labelled menu item;
// requiring type=button avoids accidental form submission, and the visible
// scope text is the confirmation safeguard that works reliably on mobile.
assert.match(source, /<button type="button" class="menuBtn" onclick="resetAllGameData\(\)">[\s\S]*?<b>Reset entire app<\/b>[\s\S]*?Clear all LaneLab data and start over/);
for (const key of fixture.appStorageKeys) assert.ok(key.startsWith('lanelab-'), `unexpected storage key in deletion scope: ${key}`);

console.log('Privacy/deletion checks passed for export scope, sensitive-field exclusion, complete clearing, onboarding recovery, and destructive-action safeguards.');
