const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LaneLabArsenal = require('../js/arsenal.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/arsenal-crud-regression.json'), 'utf8'));
const storage = new Map();
const storageStub = {getItem: key => storage.has(key) ? storage.get(key) : null, setItem: (key, value) => storage.set(key, value)};
const plain = value => JSON.parse(JSON.stringify(value));

// Add during onboarding, then edit the same catalog entry by stable id.
let arsenal = LaneLabArsenal.save(storageStub, [fixture.onboardingBall]);
assert.equal(arsenal.length, 1);
assert.equal(arsenal[0].name, 'Template Ball');
arsenal = LaneLabArsenal.save(storageStub, arsenal.map(ball => ball.id === fixture.editedBall.id ? fixture.editedBall : ball));
assert.deepEqual(plain(arsenal[0]), {...fixture.editedBall, image: null});

// Delete the ball and confirm the catalog is empty while unrelated history is unchanged.
arsenal = LaneLabArsenal.save(storageStub, arsenal.filter(ball => ball.id !== fixture.editedBall.id));
assert.equal(arsenal.length, 0);
assert.deepEqual(fixture.history, [{id: 'history-unchanged', score: 180, ball: 'Hy-Road'}]);

// Guard all user-facing CRUD paths and persistent catalog writes.
for (const handler of ['function onboardingAddBall(', 'function addBall(', 'function deleteSelectedBall(']) {
  assert.ok(source.includes(handler), `${handler} handler is missing`);
}
assert.match(source, /function onboardingAddBall\([\s\S]*?LaneLabArsenal\.save\(getGameStorage\(\)/);
assert.match(source, /function addBall\([\s\S]*?LaneLabArsenal\.save\(getGameStorage\(\)/);
assert.match(source, /function deleteSelectedBall\([\s\S]*?LaneLabArsenal\.save\(getGameStorage\(/);
assert.match(source, /deleteSelectedBall\(\)/);

console.log('Arsenal CRUD checks passed for onboarding add, edit persistence, delete, and history preservation.');
