import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  base: '/Bastshin_fin/',
  plugins: [
    react(),
    svgr({
      include: '**/*.svg',
      svgrOptions: {
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
        icon: true,
      },
    }),
    visualizer({
      open: true,
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      includeAssets: [
        'favicon.svg',
        'robots.txt',
        'apple-touch-icon.png'
      ],
      manifest: {
        name: 'My App',
        short_name: 'App',
        start_url: '/Bastshin_fin/',
        display: 'standalone',
        background_color: '#ffffff',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        navigationPreload: true,
        navigateFallback: '/Bastshin_fin/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,json}'
        ],
        runtimeCaching: [
          {
            urlPattern: /\/index\.html$/,
            handler: 'CacheFirst',
            options: { cacheName: 'html-shell' }
          },
          {
            urlPattern: /\/api\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache' }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }
            }
          }
        ]
      }
    }),
  ],

  server: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/nova-poshta': {
        target: 'https://api.novaposhta.ua/v2.0/json/',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/nova-poshta/, ''),
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/components/icons/')) return 'icons';
          if (/[\\/]node_modules[\\/]/.test(id)) {
            if (id.includes('framer-motion')) return 'animations';
            if (id.includes('@tanstack') || id.includes('zustand')) return 'state';
            if (id.includes('lucide-react') || id.includes('react-icons')) return 'icons';
            if (id.includes('clsx') || id.includes('tailwind-merge')) return 'utils';
            return 'vendor';
          }
        },
      }
    }
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'clsx',
      'tailwind-merge',
      'framer-motion'
    ],
    exclude: ['lucide-react'],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@icons': path.resolve(__dirname, './src/components/icons'),
    }
  }
});
