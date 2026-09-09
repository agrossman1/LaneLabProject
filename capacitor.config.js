module.exports = {
  appId: 'com.lanelab.app',
  appName: 'LaneLab',
  // Capacitor requires a dedicated web-assets directory. `cap:sync` populates
  // it from the browser source before copying assets into the native project.
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 500,
      launchAutoHide: true,
      backgroundColor: '#0b1020',
      showSpinner: false,
    },
  },
};
