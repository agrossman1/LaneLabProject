(function attachLaneLabSchema(root) {
  const CURRENT_VERSION = 2;

  function asArray(value) { return Array.isArray(value) ? value : []; }

  // Normalize every supported export shape into the current envelope. This is
  // deliberately independent of the UI so web and future native clients can
  // share the same migration rules.
  function migrate(input) {
    const source = input && typeof input === 'object' ? input : {};
    const profile = source.profile || source.player || {};
    const games = asArray(source.games || source.records || source.data)
      .filter(item => item && typeof item === 'object');
    const arsenal = asArray(source.arsenal || source.balls || profile.balls);
    const recentScores = asArray(source.recentScores || source.recent)
      .map(Number).filter(Number.isFinite);
    return {
      ...source,
      schemaVersion: CURRENT_VERSION,
      profile,
      arsenal,
      games,
      recentScores,
    };
  }

  root.LaneLabSchema = Object.freeze({ CURRENT_VERSION, migrate });
})(window);
