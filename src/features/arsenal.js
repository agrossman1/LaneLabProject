(function attachLaneLabArsenalFeature(root) {
  function statsFor(records, ball) {
    return root.LaneLabArsenal.calculateStats(Array.isArray(records) ? records : [], ball);
  }
  function normalizeBall(value, index = 0) {
    return root.LaneLabArsenal.normalizeBall(value, index);
  }
  root.LaneLabArsenalFeature = Object.freeze({statsFor, normalizeBall});
})(window);
