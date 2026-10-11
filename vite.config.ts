import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Project Pages is /<repo>/; user/organization Pages is /.
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = repo && !repo.endsWith('.github.io') ? `/${repo}/` : '/';
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        id: base,
        name: 'MeetingPilot',
        short_name: 'MeetingPilot',
        description: 'Plan, run and follow up on meetings without losing your place.',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#10172a',
        theme_color: '#10172a',
        icons: [
          { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],
        navigateFallback: `${base}index.html`
      }
    })
  ],
  test: { environment: 'node', include: ['tests/**/*.test.ts'] }
});
