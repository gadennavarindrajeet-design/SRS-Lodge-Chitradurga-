import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Detect if running in AI Studio or similar restricted environment
// The platform automatically sets DISABLE_HMR=true in the preview environment
const shouldDisableHMR = process.env.DISABLE_HMR === 'true';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // automatically update service worker
      includeAssets: ['favicon.svg', 'robots.txt'],
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // Increase limit to 5MB
      },
      manifest: {
        name: 'LodgeEase',
        short_name: 'LodgeEase',
        description: 'SaaS lodge management platform',
        theme_color: '#2563EB',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    // Disable HMR in AI Studio to prevent WebSocket connection errors
    // HMR remains enabled in local development where DISABLE_HMR is not set
    hmr: shouldDisableHMR ? false : undefined,
    allowedHosts: true
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    allowedHosts: true
  },
  build: {
    sourcemap: true
  }
});
