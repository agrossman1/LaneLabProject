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
      strikes: Number.isInteger(Number(record.strikes)) && Number(record.strikes) >= 0
        ? Math.min(12, Number(record.strikes))
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
