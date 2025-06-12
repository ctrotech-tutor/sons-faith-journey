
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'THE SONS - Faith-Based Bible Reading Challenge',
        short_name: 'THE SONS',
        description: 'Join THE SONS 90-day Bible Reading & Meditation Challenge starting June 1st',
        theme_color: '#6A0DAD',
        background_color: '#6A0DAD',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: './icon/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: './icon/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: './icon/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB limit instead of default 2MB
      },
      injectRegister: 'auto',
      strategies: 'generateSW',
      devOptions: {
        enabled: true,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
