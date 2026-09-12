const MAX_GAMES = 250;

function migrateLaneLabExport(input) {
  const source = input && typeof input === 'object' ? input : {};
  const profile = source.profile || source.player || {};
  const games = Array.isArray(source.games || source.records || source.data)
    ? (source.games || source.records || source.data).filter(item => item && typeof item === 'object').slice(-MAX_GAMES)
    : [];
  const arsenal = Array.isArray(source.arsenal || source.balls) ? (source.arsenal || source.balls) : [];
  return {
    profile: { name: typeof profile.name === 'string' ? profile.name.trim().slice(0, 40) : '', hand: profile.hand || 'Ambidextrous', style: profile.style || 'Two-handed', goalAverage: Number(profile.goalAverage) || 180 },
    games,
    arsenal: arsenal.filter(ball => ball && typeof ball === 'object').map(ball => ({ id: String(ball.id || ball.name || Date.now()), name: String(ball.name || 'Unnamed ball').slice(0, 60) }))
  };
}

module.exports = { migrateLaneLabExport };
