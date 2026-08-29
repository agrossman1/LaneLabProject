(function attachLaneLabStats(root) {
  const STORAGE_KEY = 'lanelab-game-scores-v1';
  const MAX_RECENT_GAMES = 10;

  function normalizeScores(scores) {
    if (!Array.isArray(scores)) return [];

    return scores
      .map(Number)
      .filter(score => Number.isInteger(score) && score >= 0 && score <= 300);
  }

  function calculateAverage(scores) {
    const validScores = normalizeScores(scores);
    if (!validScores.length) return null;

    const total = validScores.reduce((sum, score) => sum + score, 0);
    return Math.round(total / validScores.length);
  }

  function loadScores(storage, fallbackScores = []) {
    try {
      const savedScores = JSON.parse(storage?.getItem(STORAGE_KEY));
      if (Array.isArray(savedScores)) {
        return normalizeScores(savedScores).slice(0, MAX_RECENT_GAMES);
      }
    } catch (error) {}

    return normalizeScores(fallbackScores).slice(0, MAX_RECENT_GAMES);
  }

  function saveScores(storage, scores) {
    const normalizedScores = normalizeScores(scores).slice(0, MAX_RECENT_GAMES);

    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(normalizedScores));
    } catch (error) {}

    return normalizedScores;
  }

  const api = Object.freeze({
    STORAGE_KEY,
    MAX_RECENT_GAMES,
    normalizeScores,
    calculateAverage,
    loadScores,
    saveScores
  });

  if (root) root.LaneLabStats = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window === 'undefined' ? null : window);
