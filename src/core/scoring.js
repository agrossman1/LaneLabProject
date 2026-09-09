(function attachLaneLabScoring(root) {
  function previewScore(tokens) {
    return (Array.isArray(tokens) ? tokens : []).reduce((sum, token) => {
      const value = String(token || '').trim();
      if (value === 'X' || value.includes('/')) return sum + 10;
      return sum + (value.match(/\d/g) || []).reduce((total, digit) => total + Number(digit), 0);
    }, 0);
  }

  root.LaneLabScoring = Object.freeze({ previewScore });
})(window);
