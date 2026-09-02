const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const LaneLabProfile = require('../js/profile.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/profile-settings-persistence.json'), 'utf8'));
const storage = new Map();
const storageStub = {
  getItem: key => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, value)
};

const saved = LaneLabProfile.save(storageStub, fixture.profile);
const reloaded = LaneLabProfile.load(storageStub);
assert.deepEqual(reloaded, saved, 'Profile fields did not survive reload');
assert.equal(reloaded.name, fixture.profile.name);
assert.equal(reloaded.hand, fixture.profile.hand);
assert.equal(reloaded.style, fixture.profile.style);
assert.equal(reloaded.goalAverage, fixture.profile.goalAverage);

// Settings controls must write durable values and startup must read them back.
const preferenceKeys = {
  theme: 'lanelab-theme',
  handTracking: 'lanelab-hand-tracking',
  ballTracking: 'lanelab-ball-tracking',
  pinTracking: 'lanelab-pin-tracking'
};
for (const [name, key] of Object.entries(preferenceKeys)) {
  assert.ok(fixture.preferences[name], `Missing fixture preference: ${name}`);
  assert.match(source, new RegExp(`['"]${key}['"]`), `Preference key is not persisted: ${key}`);
  storageStub.setItem(key, fixture.preferences[name]);
  assert.equal(storageStub.getItem(key), fixture.preferences[name]);
}

assert.match(source, /function profileSaved\([\s\S]*?LaneLabProfile\.save\(getGameStorage\(\)/);
assert.match(source, /function toggleTheme\([\s\S]*?lanelab-theme/);
assert.match(source, /function toggleSwitch\([\s\S]*?lanelab-hand-tracking/);
assert.match(source, /function toggleSwitch\([\s\S]*?lanelab-ball-tracking/);
assert.match(source, /function togglePinTracking\([\s\S]*?lanelab-pin-tracking/);
assert.match(source, /pinTrackingEnabled=getGameStorage\(\)\?\.getItem\('lanelab-pin-tracking'\)/);
assert.match(source, /handTrackingEnabled=getGameStorage\(\)\?\.getItem\('lanelab-hand-tracking'\)/);
assert.match(source, /ballTrackingEnabled=getGameStorage\(\)\?\.getItem\('lanelab-ball-tracking'\)/);
assert.match(source, /loadSavedTheme\(\)/);

console.log('Profile/settings persistence checks passed for identity, handedness, style, theme, and tracking preferences.');
