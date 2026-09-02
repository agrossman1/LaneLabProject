(function attachLaneLabProfile(root) {
  const STORAGE_KEY = 'lanelab-profile-v1';
  const DEFAULT_PROFILE = Object.freeze({
    name: '',
    hand: 'Ambidextrous',
    style: 'Two-handed',
    goalAverage: 180,
    photo: ''
  });
  const HANDS = new Set(['Ambidextrous', 'Right', 'Left']);
  const STYLES = new Set(['Two-handed', 'One-handed', 'Spinner']);

  function normalizeProfile(profile = {}) {
    const name = typeof profile.name === 'string' && profile.name.trim()
      ? profile.name.trim().slice(0, 40)
      : DEFAULT_PROFILE.name;
    const goal = Number(profile.goalAverage);

    return {
      name,
      hand: HANDS.has(profile.hand) ? profile.hand : DEFAULT_PROFILE.hand,
      style: STYLES.has(profile.style) ? profile.style : DEFAULT_PROFILE.style,
      goalAverage: Number.isInteger(goal) && goal >= 0 && goal <= 300
        ? goal
        : DEFAULT_PROFILE.goalAverage,
      photo: typeof profile.photo === 'string' ? profile.photo : DEFAULT_PROFILE.photo
    };
  }

  function load(storage) {
    try {
      const saved = JSON.parse(storage?.getItem(STORAGE_KEY));
      if (saved && typeof saved === 'object') return normalizeProfile(saved);
    } catch (error) {}
    return normalizeProfile(DEFAULT_PROFILE);
  }

  function save(storage, profile) {
    const normalized = normalizeProfile(profile);
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {}
    return normalized;
  }

  function initials(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'LL';
    return (parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts.at(-1)[0]).toUpperCase();
  }

  const api = Object.freeze({STORAGE_KEY, DEFAULT_PROFILE, normalizeProfile, load, save, initials});
  if (root) root.LaneLabProfile = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window === 'undefined' ? null : window);
