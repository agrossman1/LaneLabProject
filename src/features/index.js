(function attachLaneLabFeatures(root) {
  // Stable feature boundary for the browser shell and future native adapters.
  // Existing compatibility modules remain the implementation while each
  // feature is migrated incrementally, avoiding duplicate state stores.
  root.LaneLabFeatures = Object.freeze({
    stats: () => root.LaneLabStats,
    arsenal: () => root.LaneLabArsenal,
    profile: () => root.LaneLabProfile,
    history: () => root.LaneLabHistory || null,
    coach: () => ({ recommend: root.generateCoachRecommendation })
  });
})(window);
