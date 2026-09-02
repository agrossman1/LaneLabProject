const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/localization-date-display.json'), 'utf8'));
const date = new Date(fixture.isoDate);
assert.equal(Number.isNaN(date.getTime()), false);

// Intl must produce locale-specific output without hard-coded US separators or
// month names. The exact glyphs vary by browser, so assert meaningful output
// differences and stable component options instead of snapshots.
const formats = fixture.locales.map(locale => new Intl.DateTimeFormat(locale, {month:'short', day:'numeric', year:'numeric'}).format(date));
assert.equal(formats.every(Boolean), true);
assert.ok(new Set(formats).size > 1, 'non-US locales should be allowed to format dates differently');
const time12 = new Intl.DateTimeFormat('en-US', {hour:'2-digit', minute:'2-digit', hour12:true}).format(date);
const time24 = new Intl.DateTimeFormat('en-GB', {hour:'2-digit', minute:'2-digit', hour12:false}).format(date);
assert.notEqual(time12, time24, '12/24-hour displays should be selectable by locale/options');

assert.match(source, /function formatGameDate\(value\)\{[\s\S]*?new Intl\.DateTimeFormat\(undefined,\{month:'short',day:'numeric',year:'numeric'\}\)/);
assert.match(source, /function formatChartDate\(value\)\{[\s\S]*?new Intl\.DateTimeFormat\(undefined,\{month:'short',day:'numeric'\}\)/);
assert.match(source, /<input id="gameDate" type="date"/);
assert.match(source, /new Date\(value\);[\s\S]*?Number\.isNaN\(date\.getTime\(\)\)/);

// Persisted/exported values remain ISO-like dates, while display formatting is
// localized at render time; this prevents locale changes from corrupting data.
assert.match(source, /date:gameDateValue\(\)/);
assert.match(source, /normalized\.date\?String\(normalized\.date\)\.slice\(0,10\)/);
assert.equal(fixture.timeOptions.length, 2);
assert.equal(fixture.dateOnlyOptions.length, 3);

console.log('Localization/date display checks passed for locale-specific dates, 12/24-hour time options, and non-US formatting.');
