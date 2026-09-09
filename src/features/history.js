(function attachLaneLabHistoryFeature(root) {
  function formatDate(value) {
    if (!value) return 'Date unavailable';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return new Intl.DateTimeFormat(undefined, {month:'short', day:'numeric', year:'numeric'}).format(date);
  }

  function filterGames(games, range = 'all', now = Date.now()) {
    const list = (Array.isArray(games) ? games : []).map((game, index) => ({game, index}));
    const filtered = range === 'all' ? list : list.filter(({game}) => {
      const days = Number(range);
      return Number.isFinite(days) && game?.date && new Date(game.date).getTime() >= now - days * 24 * 60 * 60 * 1000;
    });
    return filtered.sort((a, b) => (new Date(b.game?.date || 0).getTime() - new Date(a.game?.date || 0).getTime()) || (b.index - a.index)).map(({game}) => game);
  }

  root.LaneLabHistoryFeature = Object.freeze({formatDate, filterGames});
})(window);
