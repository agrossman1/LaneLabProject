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
      ? records.filter(record => {
          if (normalizeName(record?.ball) === target) return true;
          return Array.isArray(record?.frameThrows) && record.frameThrows.some(frame =>
            Array.isArray(frame?.throws) && frame.throws.some(item => normalizeName(item?.ball) === target)
          );
        })
      : [];
    const scores = games.map(game => Number(game.score)).filter(score => Number.isInteger(score));
    const rates = [];
    games.forEach(game => {
      const gameBallMatches = normalizeName(game?.ball) === target;
      const explicitRate = game?.ballStrikeRates && typeof game.ballStrikeRates === 'object'
        ? Object.entries(game.ballStrikeRates).find(([name]) => normalizeName(name) === target)?.[1]
        : undefined;
      if (Number.isFinite(Number(explicitRate))) { rates.push(Number(explicitRate)); return; }
      const notationRate = Array.isArray(game?.frames) && game.frames.length
        ? Math.round(game.frames.filter(frame => String(frame || '').trim().startsWith('X')).length / Math.min(10, game.frames.length) * 100)
        : null;
      const hasThrowData = Array.isArray(game?.frameThrows);
      if (hasThrowData && Array.isArray(game.frames)) {
        let opportunities = 0, strikes = 0;
        game.frameThrows.forEach((frame, index) => {
          const throws = Array.isArray(frame?.throws) ? frame.throws : [];
          throws.forEach((item, throwIndex) => {
            if (normalizeName(item?.ball) !== target) return;
            if (throwIndex === 0) {
              opportunities++;
              const notation = String(game.frames[index] || '');
              if (notation.startsWith('X')) strikes++;
            }
          });
        });
        if (opportunities) rates.push(Math.round(strikes / opportunities * 100));
        else if (gameBallMatches) {
          // Frame notation is the most reliable fallback for imported CSV
          // rows whose throw list is present but contains no ball metadata.
          if (notationRate !== null) rates.push(notationRate);
          else {
            const rate = Number(game.strikeRate);
            if (Number.isFinite(rate)) rates.push(rate);
          }
        }
      } else if (gameBallMatches) {
        const rate = Number(game.strikeRate);
        if (Number.isFinite(rate)) rates.push(rate);
        else if (notationRate !== null) rates.push(notationRate);
      }
    });

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
