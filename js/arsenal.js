(function attachLaneLabArsenal(root) {
  const STORAGE_KEY = 'lanelab-arsenal-v1';
  const MAX_BALLS = 30;

  function normalizeName(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizeBall(ball, index = 0) {
    if (!ball || typeof ball !== 'object') return null;
    const name = typeof ball.name === 'string' ? ball.name.trim().slice(0, 80) : '';
    const weight = Number(ball.weight);
    if (!name) return null;

    return {
      id: typeof ball.id === 'string' && ball.id.trim() ? ball.id.trim() : `ball-${index}-${normalizeName(name).replace(/ /g, '-')}`,
      name,
      weight: Number.isFinite(weight) && weight >= 6 && weight <= 16 ? weight : 15,
      role: typeof ball.role === 'string' && ball.role.trim() ? ball.role.trim().slice(0, 40) : 'Benchmark',
      image: typeof ball.image === 'string' && ball.image.trim() ? ball.image.trim() : null
    };
  }

  function load(storage, fallbackBalls = []) {
    try {
      const saved = JSON.parse(storage?.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) return saved.map(normalizeBall).filter(Boolean).slice(0, MAX_BALLS);
    } catch (error) {}
    return fallbackBalls.map(normalizeBall).filter(Boolean).slice(0, MAX_BALLS);
  }

  function save(storage, balls) {
    const normalized = Array.isArray(balls)
      ? balls.map(normalizeBall).filter(Boolean).slice(0, MAX_BALLS)
      : [];
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {}
    return normalized;
  }

  function calculateStats(records, ballName) {
    const target = normalizeName(ballName);
    const games = Array.isArray(records)
      ? records.filter(record => normalizeName(record?.ball) === target)
      : [];
    const scores = games.map(game => Number(game.score)).filter(score => Number.isInteger(score));
    const rates = games.map(game => Number(game.strikeRate)).filter(rate => Number.isFinite(rate));

    return {
      games: scores.length,
      average: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null,
      high: scores.length ? Math.max(...scores) : null,
      strikeRate: rates.length ? Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length) : null
    };
  }

  const api = Object.freeze({STORAGE_KEY, MAX_BALLS, normalizeName, normalizeBall, load, save, calculateStats});
  if (root) root.LaneLabArsenal = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window === 'undefined' ? null : window);
