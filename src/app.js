// LaneLab web/native shell bootstrap. Feature functions remain available on
// window for the static build, while startup sequencing lives here so a
// Capacitor host can reuse the same hydration entrypoint.
(function startLaneLabApp(root) {
  function registerServiceWorker() {
    if (!('serviceWorker' in root.navigator)) return;
    root.navigator.serviceWorker.register('./sw.js').then(reg => reg.update()).catch(() => {});
  }

  function init() {
    // Capacitor Android can render the WebView edge-to-edge. Add a native
    // marker so the header gets a small status-bar clearance there only.
    if (root.Capacitor?.isNativePlatform?.()) root.document.documentElement.classList.add('native-shell');
    root.loadSavedTheme?.();
    root.preloadBallCatalogImages?.();
    const gameDateInput = root.document.getElementById('gameDate');
    if (gameDateInput) gameDateInput.value = root.localDateInputValue?.() || '';
    root.restoreCurrentGame?.();
    root.renderAll?.();
    root.renderChart?.(); root.renderRecent?.(); root.renderGameBreakdown?.();
    root.renderProfile?.(); root.renderSessionMetrics?.();
    root.syncAverageDisplays?.(); root.syncGameSummaries?.();
    root.renderPersonalStats?.(); root.renderArsenal?.();
    root.restoreLastScreen?.(); root.maybeStartOnboarding?.();
    registerServiceWorker();
  }

  if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})(window);
