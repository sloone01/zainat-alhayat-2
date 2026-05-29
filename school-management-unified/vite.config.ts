import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
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
    ],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:3002',
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
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    }
  }
})
