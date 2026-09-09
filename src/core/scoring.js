(function attachLaneLabScoring(root) {
  function previewScore(tokens) {
    return (Array.isArray(tokens) ? tokens : []).reduce((sum, token) => {
      const value = String(token || '').trim();
      if (value === 'X' || value.includes('/')) return sum + 10;
      return sum + (value.match(/\d/g) || []).reduce((total, digit) => total + Number(digit), 0);
    }, 0);
  }

  function isFrameComplete(frames, index) {
    const rolls = Array.isArray(frames?.[index]?.rolls) ? frames[index].rolls : [];
    if (index < 9) return (rolls.length === 1 && rolls[0] === 10) || rolls.length >= 2;
    if (rolls.length < 2) return false;
    if (rolls[0] === 10 || rolls[0] + rolls[1] === 10) return rolls.length >= 3;
    return rolls.length >= 2;
  }

  function cumulativeScores(frames) {
    const source = Array.isArray(frames) ? frames : [];
    const result = [];
    let cumulative = 0;
    for (let index = 0; index < 10; index += 1) {
      const rolls = Array.isArray(source[index]?.rolls) ? source[index].rolls : [];
      let score = null;
      if (index < 9) {
        if (rolls[0] === 10) {
          const bonus = source.slice(index + 1).flatMap(frame => Array.isArray(frame?.rolls) ? frame.rolls : []);
          if (bonus.length >= 2) score = 10 + bonus[0] + bonus[1];
        } else if (rolls.length >= 2 && rolls[0] + rolls[1] === 10) {
          const bonus = source.slice(index + 1).flatMap(frame => Array.isArray(frame?.rolls) ? frame.rolls : []);
          if (bonus.length >= 1) score = 10 + bonus[0];
        } else if (rolls.length >= 2) score = rolls[0] + rolls[1];
      } else if (isFrameComplete(source, 9)) {
        score = rolls.reduce((sum, value) => sum + value, 0);
      }
      result.push(score === null ? null : (cumulative += score));
    }
    return result;
  }

  root.LaneLabScoring = Object.freeze({ previewScore, isFrameComplete, cumulativeScores });
})(window);
