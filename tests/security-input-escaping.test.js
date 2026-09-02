const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const LaneLabArsenal = require('../js/arsenal.js');
const LaneLabProfile = require('../js/profile.js');
const LaneLabStats = require('../js/stats.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/security-input-escaping.json'), 'utf8'));
const escapeFunction = source.split(/\r?\n/).find(line => line.startsWith('function escapeHtml'));
assert.ok(escapeFunction, 'the app must define one shared HTML escaping function');
const escapeHtml = vm.runInNewContext(`(()=>{${escapeFunction}; return escapeHtml;})()`);

const escaped = escapeHtml(fixture.playerName);
assert.equal(escaped, '&lt;img src=x onerror=alert(1)&gt; &amp; &#039;quoted&#039;');
assert.equal(escaped.includes('<'), false);
assert.equal(escaped.includes('>'), false);

const ball = LaneLabArsenal.normalizeBall({name: fixture.ballName, role: fixture.role, weight: 15});
assert.equal(ball.name, fixture.ballName, 'valid text should be preserved for display escaping');
assert.equal(escapeHtml(ball.name).includes('<script>'), false);
assert.equal(escapeHtml(ball.role).includes('<svg'), false);

const profile = LaneLabProfile.normalizeProfile({name: fixture.playerName, hand: 'Right', style: 'One-handed'});
assert.equal(profile.name, fixture.playerName);
assert.equal(profile.hand, 'Right');
assert.equal(profile.style, 'One-handed');

const imported = LaneLabStats.normalizeGameRecord({
  id: '<game onclick=alert(1)>', score: 180, hand: fixture.importedHand, ball: fixture.ballName,
  date: '2026-09-01T12:00:00.000Z', frames: ['9-'], frameThrows: [{throws: [{hand: fixture.importedHand, ball: fixture.ballName}]}]
});
assert.equal(imported.id, '<game onclick=alert(1)>');
assert.equal(escapeHtml(imported.id).includes('<'), false);
assert.equal(escapeHtml(imported.id).includes('&lt;game'), true);
assert.equal(escapeHtml(imported.ball).includes('<script>'), false);
assert.equal(escapeHtml(fixture.metadata).includes('<'), false);
assert.equal(escapeHtml(fixture.metadata).includes('&lt;a'), true);

assert.match(source, /function escapeHtml\(str\)/);
assert.match(source, /escapeHtml\(details\)/);
assert.match(source, /escapeHtml\(ball\.name\)/);
assert.match(source, /profileAvatarMarkup\([\s\S]*?escapeHtml\(name\)/);
assert.match(source, /escapeHtml\(String\(item\)\)/);

console.log('Security/input checks passed for hostile names, imported text, HTML characters, and metadata escaping.');
