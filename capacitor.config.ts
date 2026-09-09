import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lanelab.app',
  appName: 'LaneLab',
  webDir: '.',
  bundledWebRuntime: false,
  plugins: { SplashScreen: { launchShowDuration: 500, launchAutoHide: true, backgroundColor: '#0b1020', showSpinner: false } },
};

export default config;
