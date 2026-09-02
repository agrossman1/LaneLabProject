const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = source.indexOf('function generateCoachRecommendation(');
const end = source.indexOf('function renderCoach(', start);
assert.ok(start >= 0 && end > start, 'Coach recommendation function is missing');
const context = {};
vm.runInNewContext(source.slice(start, end), context);
assert.equal(typeof context.generateCoachRecommendation, 'function');

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/coach-recommendations-regression.json'), 'utf8'));
for (const testCase of fixture.cases) {
  const recommendation = context.generateCoachRecommendation(testCase.current, testCase.previous);
  assert.equal(recommendation.label, testCase.expectedKey, testCase.name);
  assert.match(recommendation.explanation.toLowerCase(), new RegExp(testCase.explanationIncludes));
  assert.ok(recommendation.why && recommendation.why.length > 20, `${testCase.name} lacks an explanation`);
}

// The implementation must compare all four tracked changes, not hard-code open frames.
assert.match(source, /const candidates=\[/);
for (const metric of ["key:'score'", "key:'strike'", "key:'spare'", "key:'open'"]) {
  assert.ok(source.includes(metric), `Coach candidate ${metric} is missing`);
}
assert.match(source, /const worst=candidates\.sort/);

console.log(`Coach recommendation checks passed for ${fixture.cases.length} negative-change cases.`);
