(function attachLaneLabTransfer(root) {
  function exportPayload({schemaVersion, exportedAt, profile, arsenal, games, recentScores}) {
    return {schemaVersion, exportedAt, profile, arsenal, games, recentScores};
  }
  function downloadJson(payload, filename, doc = root.document) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
    const url = root.URL.createObjectURL(blob), link = doc.createElement('a');
    link.href = url; link.download = filename; doc.body.appendChild(link); link.click(); link.remove(); root.URL.revokeObjectURL(url);
  }
  root.LaneLabTransfer = Object.freeze({exportPayload, downloadJson});
})(window);
