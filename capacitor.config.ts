import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ee.isic.card',
  appName: 'ISIC Card',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // For live-reload during development, uncomment:
    // url: 'http://192.168.1.xxx:5173',
    // cleartext: true,
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
