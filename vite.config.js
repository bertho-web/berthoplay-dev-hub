import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    target: 'es2020',           // couvre Safari iOS 14+, pas seulement les navigateurs récents
    outDir: 'dist',
    cssMinify: true,
    // Pas de manualChunks : chaque jeu et chaque vue est déjà chargé par
    // import() dynamique. Les regrouper obligerait à télécharger les sept jeux
    // pour en lancer un seul.
    chunkSizeWarningLimit: 700
  },

  plugins: [
    VitePWA({
      // injectManifest : notre service worker + le précache généré par Workbox.
      // generateSW ne permettrait pas de garder nos gestionnaires push.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      injectManifest: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,jpg,mp4}'],
        // bg.mp4 fait ~490 Ko : au-dessus du plafond Workbox par défaut (2 Mo
        // suffisent ici, mais on le déclare pour rester explicite).
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024
      },

      includeAssets: [
        'pwa-192x192.png',
        'pwa-512x512.png',
        'apple-touch-icon.png',
        'bg.mp4',
        'bg-poster.jpg',
        'robots.txt'
      ],

      manifest: {
        name: 'BerthoPlay — Console Web Haute Performance',
        short_name: 'BerthoPlay',
        description: 'Console Web PWA : jeux 3D, rétrogaming, messagerie, causeries vocales, clans et réseau social de gamers.',
        id: '/',
        start_url: '/',
        scope: '/',
        lang: 'fr',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        theme_color: '#0A0810',
        background_color: '#0A0810',
        categories: ['games', 'social', 'entertainment'],
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },

      devOptions: {
        enabled: false,   // un SW en dev masque les changements de code
        type: 'module'
      }
    })
  ]
});
