(function attachLaneLabCoachFeature(root) {
  function selectLargestNegativeChange(candidates) {
    return (Array.isArray(candidates) ? candidates : [])
      .slice()
      .sort((a, b) => Number(b?.severity?.(b.delta) || 0) - Number(a?.severity?.(a.delta) || 0))[0] || null;
  }

  root.LaneLabCoachFeature = Object.freeze({selectLargestNegativeChange});
})(window);
