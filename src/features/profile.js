(function attachLaneLabProfileFeature(root) {
  function saveFromForm({storage, current, name, hand, style, goalAverage, photo}) {
    return root.LaneLabProfile.save(storage, {
      name, hand, style, goalAverage, photo: current?.photo || photo || ''
    });
  }

  root.LaneLabProfileFeature = Object.freeze({ saveFromForm });
})(window);
