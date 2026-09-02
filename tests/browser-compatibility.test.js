const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LaneLabArsenal = require('../js/arsenal.js');
const LaneLabProfile = require('../js/profile.js');
const LaneLabStats = require('../js/stats.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/browser-compatibility.json'), 'utf8'));
assert.deepEqual(fixture.browsers, ['Chrome', 'Safari/iOS', 'Firefox', 'Edge']);

// Private browsing and quota policies can make every storage operation throw.
const unavailableStorage = {
  getItem() { throw new Error('private browsing storage unavailable'); },
  setItem() { throw new Error('quota exceeded'); },
  clear() { throw new Error('storage unavailable'); }
};
assert.deepEqual(LaneLabProfile.load(unavailableStorage).name, '');
assert.equal(LaneLabProfile.save(unavailableStorage, {name: 'Test', hand: 'Right'}).hand, 'Right');
assert.equal(LaneLabArsenal.load(unavailableStorage, [{name: 'Fallback Ball'}]).length, 1);
assert.equal(LaneLabArsenal.save(unavailableStorage, [{name: 'Safe Ball'}]).length, 1);
assert.deepEqual(LaneLabStats.loadScores(unavailableStorage, [180]), [180]);
assert.equal(LaneLabStats.saveScores(unavailableStorage, [200])[0], 200);
assert.equal(LaneLabStats.loadGameRecords(unavailableStorage, [170]).length, 1);
assert.equal(LaneLabStats.saveGameRecords(unavailableStorage, [{score: 160}]).length, 1);

// Cross-browser interaction contracts: touch and Safari's prefixed visual effect.
assert.match(source, /html,body,\.app\{touch-action:manipulation\}/);
assert.match(source, /\.pinButton\{[^}]*touch-action:none/);
assert.match(source, /-webkit-backdrop-filter:blur/);
assert.match(source, /function getGameStorage\(\)[\s\S]*?try\{return window\.localStorage\}catch/);
assert.match(source, /navigator\.vibrate\)/);
assert.match(source, /window\.sessionStorage\?\.clear\(\)/);

console.log(`Browser compatibility checks passed for ${fixture.browsers.join(', ')}, touch behavior, Safari styling, and private-browsing storage fallback.`);
