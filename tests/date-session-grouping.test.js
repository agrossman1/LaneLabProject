const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LaneLabStats = require('../js/stats.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const statsSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'stats.js'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/date-session-grouping.json'), 'utf8'));
const games = fixture.games.map((game, index) => LaneLabStats.normalizeGameRecord(game, index));

// ISO timestamps normalize consistently, while games on the same calendar date
// belong to one session and midnight creates a new date bucket.
assert.equal(games[0].date, '2026-09-02T06:59:00.000Z');
assert.equal(games[1].date, '2026-09-02T07:01:00.000Z');
const sessions = LaneLabStats.groupSessions(games);
assert.equal(sessions.length, 2, 'UTC-normalized dates should group by the stored calendar day');
assert.equal(sessions[0].games.length, 2);

const invalid = LaneLabStats.normalizeGameRecord(fixture.invalidDate);
assert.equal(invalid.date, null, 'Invalid dates must not become fake timestamps');
const comparison = LaneLabStats.compareSessions([...games, {...games[2], date: '2026-09-03T01:00:00.000Z'}]);
assert.equal(comparison.currentDate, '2026-09-04');
assert.equal(comparison.previousDate, '2026-09-03');

assert.match(source, /function localDateInputValue\(date=new Date\(\)\)[\s\S]*?getTimezoneOffset\(\)/);
assert.match(source, /function gameDateValue\(\)[\s\S]*?T12:00:00/);
assert.match(source, /function renderCoach\([\s\S]*?LaneLabStats\.groupSessions/);
assert.match(statsSource, /const parsedDate\s*=\s*record\.date\s*\?\s*new Date\(record\.date\)\s*:\s*null/);
assert.match(statsSource, /!Number\.isNaN\(parsedDate\.getTime\(\)/);

console.log('Date/session checks passed for timezone normalization, midnight grouping, invalid dates, and Coach latest-session selection.');
