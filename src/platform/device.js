(function attachLaneLabDevice(root) {
  const isNative = Boolean(root.Capacitor?.isNativePlatform?.() || root.Capacitor?.getPlatform?.() !== 'web');
  async function choosePhoto() {
    if (isNative && root.Capacitor?.Plugins?.Camera) {
      return root.Capacitor.Plugins.Camera.getPhoto({resultType:'uri', source:'PROMPT', quality:90});
    }
    return null;
  }
  function platform() { return isNative ? (root.Capacitor.getPlatform?.() || 'native') : 'web'; }
  root.LaneLabDevice = Object.freeze({isNative, platform, choosePhoto});
})(window);
