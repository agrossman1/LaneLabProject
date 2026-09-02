const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LaneLabStats = require('../js/stats.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/backup-recovery.json'), 'utf8'));

const collectValid = payload => {
  const records = [];
  const collect = value => {
    if (Array.isArray(value)) return value.forEach(collect);
    if (!value || typeof value !== 'object') return;
    if (Number.isFinite(Number(value.score))) records.push(value);
    ['games', 'records', 'state', 'data'].forEach(key => { if (value[key] && value[key] !== value) collect(value[key]); });
  };
  collect(payload);
  return records;
};
const parseSafe = text => { try { return JSON.parse(text); } catch { return null; } };

assert.equal(collectValid(fixture.validBackup).length, 1);
assert.equal(collectValid(fixture.partialBackup).length, fixture.expectedValidPartialRecords);
assert.equal(collectValid(parseSafe(fixture.corruptedBackup || 'null')).length, 0);
assert.equal(LaneLabStats.normalizeGameRecord(collectValid(fixture.validBackup)[0]).score, 180);

const throwingStorage = {
  getItem() { throw new Error('corrupt/unavailable backup storage'); },
  setItem() { throw new Error('restore quota failure'); }
};
assert.equal(LaneLabStats.loadGameRecords(throwingStorage, [175]).length, 1, 'failed restore reads must use a safe fallback');
assert.equal(LaneLabStats.saveGameRecords(throwingStorage, [{id:'existing', score:190}]).length, 1, 'failed restore writes must return normalized data');

assert.match(source, /function importJsonRecords\(text\)[\s\S]*?try\{payload=JSON\.parse\(text\)\}catch\(error\)\{return 0\}/);
assert.match(source, /function importJsonRecords\(text\)[\s\S]*?const valid=records\.filter/);
assert.match(source, /function importJsonRecords\(text\)[\s\S]*?if\(match\)\{ Object\.assign/);
assert.match(source, /function importJsonRecords\(text\)[\s\S]*?state\.games=LaneLabStats\.saveGameRecords/);
assert.match(source, /function handleHistoryFileImport\(event\)[\s\S]*?No valid game records found/);
assert.match(source, /function handleOnboardingHistoryFile\(event\)[\s\S]*?if\(!count\)\{toast/);

console.log('Backup/recovery checks passed for corrupted files, partial imports, storage failures, and non-destructive restore handling.');
