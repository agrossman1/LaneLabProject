(function attachLaneLabStats(root) {
  const STORAGE_KEY = 'lanelab-game-scores-v1';
  const RECORDS_STORAGE_KEY = 'lanelab-game-records-v1';
  const MAX_RECENT_GAMES = 10;
  const MAX_GAME_RECORDS = 250;

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

  function frameIsOpen(frame) {
    const token = String(frame || '').trim();
    return Boolean(token) && !token.startsWith('X') && !token.includes('/');
  }

  function frameHasSpareOpportunity(frame) {
    const token = String(frame || '').replace(/\s+/g, '').trim();
    if (!token) return false;
    // A regular frame (including an open frame or spare) creates one chance
    // whenever its first ball is not a strike and a second ball is recorded.
    if (!token.startsWith('X')) return token.length >= 2;
    // In the 10th, a strike starts a fresh rack. X9/ therefore contains a
    // spare opportunity on the second rack; XX9 does not.
    return token.length >= 3 && token[1] !== 'X';
  }

  function groupSessions(games) {
    const groups = new Map();
    (Array.isArray(games) ? games : []).forEach(game => {
      const key = game?.date ? String(game.date).slice(0, 10) : 'undated';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(game);
    });
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, list]) => ({date, games: list}));
  }

  function summarizeGames(games) {
    const list = (Array.isArray(games) ? games : []).filter(game => Number.isFinite(Number(game?.score)));
    const frames = list.flatMap(game => Array.isArray(game.frames) ? game.frames.slice(0, 10) : []);
    const pinFrames = list.flatMap(game => Array.isArray(game.pinData) ? game.pinData.slice(0, 10) : []);
    const pinFrameMetrics = pinFrames.reduce((metrics, frame) => {
      const first = Array.isArray(frame?.pinsLeftAfterFirst) ? frame.pinsLeftAfterFirst : null;
      const second = Array.isArray(frame?.pinsLeftAfterSecond) ? frame.pinsLeftAfterSecond : null;
      if (!first || first.length === 0 || first.length === 10 && second === null) return metrics;
      metrics.spareOpportunities += 1;
      if (second && second.length === 0) metrics.spares += 1;
      if (second && second.length > 0) metrics.openFrames += 1;
      return metrics;
    }, {spareOpportunities: 0, spares: 0, openFrames: 0});
    const frameCount = list.reduce((sum, game) => sum + (Array.isArray(game.frames) && game.frames.length ? game.frames.length : 10), 0);
    const scores = list.map(game => Number(game.score));
    const strikes = list.reduce((sum, game) => {
      const gameFrames = Array.isArray(game.frames) ? game.frames.filter(Boolean) : [];
      return sum + (gameFrames.length ? gameFrames.filter(frame => String(frame).trim().startsWith('X')).length : (Number.isFinite(Number(game.strikes)) ? Number(game.strikes) : 0));
    }, 0);
    const spares = list.reduce((sum, game) => {
      const gameFrames = Array.isArray(game.frames) ? game.frames.filter(Boolean) : [];
      if (gameFrames.length) return sum + gameFrames.filter(frame => String(frame).includes('/')).length;
      const gamePinFrames = Array.isArray(game.pinData) ? game.pinData : [];
      const pinMakes = gamePinFrames.filter(frame => Array.isArray(frame?.pinsLeftAfterFirst) && frame.pinsLeftAfterFirst.length > 0 && Array.isArray(frame?.pinsLeftAfterSecond) && frame.pinsLeftAfterSecond.length === 0).length;
      return sum + (gamePinFrames.length ? pinMakes : (Number.isFinite(Number(game.spares)) ? Number(game.spares) : 0));
    }, 0);
    // A spare rate is conversion rate: count only frames where a spare was possible.
    // Strike frames do not create a spare opportunity and must not dilute the result.
    const spareChances = list.reduce((sum, game) => {
      const gameFrames = Array.isArray(game.frames) ? game.frames.filter(Boolean) : [];
      if (gameFrames.length) return sum + gameFrames.filter(frameHasSpareOpportunity).length;
      const gamePinFrames = Array.isArray(game.pinData) ? game.pinData : [];
      const pinChances = gamePinFrames.filter(frame => Array.isArray(frame?.pinsLeftAfterFirst) && frame.pinsLeftAfterFirst.length > 0).length;
      return sum + (gamePinFrames.length ? pinChances : (Number.isFinite(Number(game.spareOpportunities)) ? Number(game.spareOpportunities) : 0));
    }, 0);
    const pinLeaves = [];
    list.forEach(game => (Array.isArray(game.pinData) ? game.pinData : []).forEach(frame => {
      const pins = Array.isArray(frame?.pinsLeftAfterFirst) ? frame.pinsLeftAfterFirst.map(Number).filter(pin => pin >= 1 && pin <= 10).sort((a, b) => a - b) : null;
      if (!pins || pins.length === 0 || pins.length === 10) return;
      const after = Array.isArray(frame?.pinsLeftAfterSecond) ? frame.pinsLeftAfterSecond : null;
      pinLeaves.push({key: pins.join('-'), pins, converted: Array.isArray(after) && after.length === 0});
    }));
    const leaveMap = new Map();
    pinLeaves.forEach((item, index) => {
      const value = leaveMap.get(item.key) || {key: item.key, pins: item.pins, attempts: 0, makes: 0, last: index};
      value.attempts += 1; if (item.converted) value.makes += 1; value.last = index; leaveMap.set(item.key, value);
    });
    const singles = pinLeaves.filter(item => item.pins.length === 1);
    return {
      games: list.length, average: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
      openFrames: list.reduce((sum, game) => {
        const gameFrames = Array.isArray(game.frames) ? game.frames.filter(Boolean) : [];
        if (gameFrames.length) return sum + gameFrames.filter(frameIsOpen).length;
        return sum + (Array.isArray(game.pinData) ? game.pinData.filter(frame => Array.isArray(frame?.pinsLeftAfterFirst) && Array.isArray(frame?.pinsLeftAfterSecond) && frame.pinsLeftAfterSecond.length > 0).length : 0);
      }, 0), openPerGame: list.length ? list.reduce((sum, game) => {
        const gameFrames = Array.isArray(game.frames) ? game.frames.filter(Boolean) : [];
        if (gameFrames.length) return sum + gameFrames.filter(frameIsOpen).length;
        return sum + (Array.isArray(game.pinData) ? game.pinData.filter(frame => Array.isArray(frame?.pinsLeftAfterFirst) && Array.isArray(frame?.pinsLeftAfterSecond) && frame.pinsLeftAfterSecond.length > 0).length : 0);
      }, 0) / list.length : null,
      strikeRate: frameCount ? strikes / frameCount * 100 : null, spareRate: spareChances ? spares / spareChances * 100 : null,
      singleAttempts: singles.length, singleMakes: singles.filter(item => item.converted).length,
      singlePct: singles.length ? singles.filter(item => item.converted).length / singles.length * 100 : null,
      leaves: [...leaveMap.values()].sort((a, b) => b.attempts - a.attempts || b.last - a.last)
    };
  }

  function compareSessions(games) {
    const sessions = groupSessions(games);
    return {current: summarizeGames(sessions.at(-1)?.games || []), previous: sessions.length > 1 ? summarizeGames(sessions.at(-2).games) : null, currentDate: sessions.at(-1)?.date || null, previousDate: sessions.at(-2)?.date || null};
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

  function normalizeGameRecord(record, index = 0) {
    if (!record || typeof record !== 'object') return null;

    const score = normalizeScores([record.score])[0];
    if (score === undefined) return null;

    const parsedDate = record.date ? new Date(record.date) : null;
    const date = parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toISOString()
      : null;
    const text = value => typeof value === 'string' && value.trim()
      ? value.trim().slice(0, 80)
      : null;
    const frameToken = (frame, frameIndex) => {
      if (typeof frame === 'string') return frame.slice(0, 20);
      if (!frame || !Array.isArray(frame.rolls)) return null;
      const rolls = frame.rolls.map(Number).filter(value => Number.isFinite(value));
      if (!rolls.length) return null;
      const mark = value => value === 0 ? '-' : String(value);
      if (rolls[0] === 10) {
        if (frameIndex !== 9) return 'X';
        return rolls.map((value, rollIndex) => {
          if (value === 10) return 'X';
          if (rollIndex > 0 && rolls[rollIndex - 1] !== 10 && rolls[rollIndex - 1] + value === 10) return '/';
          return mark(value);
        }).join('');
      }
      const first = Math.min(10, Math.max(0, rolls[0]));
      const second = rolls.length > 1 ? Math.min(10 - first, Math.max(0, rolls[1])) : null;
      return mark(first) + (second === null ? '' : (first + second === 10 ? '/' : mark(second)));
    };
    const frames = Array.isArray(record.frames)
      ? record.frames.slice(0, 10).map(frameToken).filter(Boolean)
      : null;
    const pinData = Array.isArray(record.pinData)
      ? record.pinData.slice(0, 10).map(frame => {
          if (!frame || typeof frame !== 'object') return null;
          const list = value => Array.isArray(value) ? value.map(Number).filter(pin => Number.isInteger(pin) && pin >= 1 && pin <= 10) : null;
          return {
            pinsLeftAfterFirst: list(frame.pinsLeftAfterFirst),
            pinsKnockedDownSecond: list(frame.pinsKnockedDownSecond),
            pinsLeftAfterSecond: list(frame.pinsLeftAfterSecond)
          };
        })
      : null;
    const percentage = value => {
      const number = Number(value);
      return Number.isFinite(number) && number >= 0 && number <= 100
        ? Math.round(number)
        : null;
    };

    return {
      id: text(record.id) || `game-${index}-${score}`,
      date,
      score,
      hand: text(record.hand),
      ball: text(record.ball),
      source: text(record.source) || 'manual',
      frames,
      pinData,
      strikes: Number.isInteger(Number(record.strikes)) && Number(record.strikes) >= 0
        ? Math.min(12, Number(record.strikes))
        : null,
      spares: Number.isInteger(Number(record.spares)) && Number(record.spares) >= 0
        ? Math.min(10, Number(record.spares))
        : null,
      spareOpportunities: Number.isInteger(Number(record.spareOpportunities)) && Number(record.spareOpportunities) >= 0
        ? Math.min(10, Number(record.spareOpportunities))
        : null,
      metricsProvided: record.metricsProvided && typeof record.metricsProvided === 'object'
        ? {strikes:record.metricsProvided.strikes===true,spares:record.metricsProvided.spares===true,spareOpportunities:record.metricsProvided.spareOpportunities===true}
        : null,
      strikeRate: percentage(record.strikeRate),
      spareRate: percentage(record.spareRate)
    };
  }

  function scoreRecords(scores) {
    return normalizeScores(scores).map((score, index) => normalizeGameRecord({
      id: `previous-${index}-${score}`,
      score,
      source: 'previous'
    }, index));
  }

  function loadGameRecords(storage, fallbackScores = []) {
    try {
      const savedRecords = JSON.parse(storage?.getItem(RECORDS_STORAGE_KEY));
      if (Array.isArray(savedRecords)) {
        return savedRecords
          .map(normalizeGameRecord)
          .filter(Boolean)
          .slice(0, MAX_GAME_RECORDS);
      }
    } catch (error) {}

    return scoreRecords(fallbackScores).slice(0, MAX_GAME_RECORDS);
  }

  function saveGameRecords(storage, records) {
    const normalizedRecords = Array.isArray(records)
      ? records.map(normalizeGameRecord).filter(Boolean).slice(0, MAX_GAME_RECORDS)
      : [];

    try {
      storage?.setItem(RECORDS_STORAGE_KEY, JSON.stringify(normalizedRecords));
    } catch (error) {}

    return normalizedRecords;
  }

  function createGameRecord(score, details = {}) {
    const now = details.date ? new Date(details.date) : new Date();
    const id = details.id || `game-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`;
    return normalizeGameRecord({...details, id, date: now.toISOString(), score});
  }

  const api = Object.freeze({
    STORAGE_KEY,
    RECORDS_STORAGE_KEY,
    MAX_RECENT_GAMES,
    MAX_GAME_RECORDS,
    normalizeScores,
    calculateAverage,
    frameIsOpen,
    groupSessions,
    summarizeGames,
    compareSessions,
    loadScores,
    saveScores,
    normalizeGameRecord,
    loadGameRecords,
    saveGameRecords,
    createGameRecord
  });

  if (root) root.LaneLabStats = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window === 'undefined' ? null : window);
