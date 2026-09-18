import type { CapacitorConfig } from '@capacitor/cli'

/**
 * FIKR school app — Capacitor shell (Android first).
 * Web assets are built into `dist/` then synced with `npx cap sync`.
 */
const config: CapacitorConfig = {
  appId: 'com.fikr.platform',
  appName: 'FIKR',
  webDir: 'dist',
  server: {
    /** Capacitor WebView origin (also add to backend CORS_ORIGIN). */
    androidScheme: 'https',
    iosScheme: 'https',
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    StatusBar: {
      overlaysWebView: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}

export default config
