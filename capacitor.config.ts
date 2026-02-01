import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.unpredictable.runner',
  appName: 'Unpredictable',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
