import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Allow .env.*.local to retarget the dev proxy (e.g. at a staging backend).
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  // Assigning undefined to process.env coerces it to the string "undefined",
  // which Vite's proxy then resolves against its dummy.org fallback base —
  // silently sending every /api request to the real dummy.org. Only set when present.
  const devProxyTarget = env.VITE_DEV_PROXY_TARGET || process.env.VITE_DEV_PROXY_TARGET
  if (devProxyTarget) {
    process.env.VITE_DEV_PROXY_TARGET = devProxyTarget
  }
  return ({
  // Web (dev + normal build): absolute `/` so deep routes like /roles load assets correctly.
  // Capacitor mobile build (`vite build --mode mobile`): relative `./` for the WebView.
  base: mode === 'mobile' ? './' : '/',
  plugins: [
    vue(),
    // Keep Vue DevTools off during marketing screenshot captures.
    ...(process.env.VITE_DISABLE_VUE_DEVTOOLS === '1' ? [] : [vueDevTools()]),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  /** Pre-bundle TipTap so lazy routes (notification templates) do not hit flaky on-demand dep optimization. */
  optimizeDeps: {
    include: [
      '@tiptap/vue-3',
      '@tiptap/starter-kit',
      '@tiptap/extension-table',
      '@tiptap/extension-text-style',
      '@tiptap/extension-color',
      'vue-codemirror',
      'codemirror',
      '@codemirror/lang-html',
      '@codemirror/view',
      '@codemirror/state',
      'js-beautify',
      'maplibre-gl',
    ],
    exclude: [],
  },
  server: {
    // Listen on all interfaces so the dev server is reachable from outside the VPS.
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:3002',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: process.env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:3002',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    }
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3002',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3002',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    }
  }
})
})
