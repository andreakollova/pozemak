import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.hockeyrefresh.app',
  appName: 'Hockey Refresh',
  webDir: 'out',
  server: {
    url: 'https://www.hockeyrefresh.com/api/native-init',
    cleartext: false,
    allowNavigation: ['hockeyrefresh.com', '*.hockeyrefresh.com'],
  },
  ios: {
    contentInset: 'never',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#080808',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#003ad0',
    },
  },
}

export default config
