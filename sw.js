// ============================================================================
// 🎮 BERTHOPLAY — SERVICE WORKER PWA (VERSION v0 PRE-RELEASE OFF-LINE & PUSH)
// ============================================================================

const CACHE_NAME = 'berthoplay-v0-pre-release';

// 🛡️ TOUS LES FICHIERS CLIENT EN CACHE (SANS AUCUN FICHIER ADMIN FANTÔME)
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/public/manifest.json',
  '/public/logo.png',
  '/public/pwa-512x512.svg',
  '/src/main.js',
  '/src/auth.js',
  '/src/chat.js',
  '/src/chat-list.js',
  '/src/clans.js',
  '/src/calls.js',
  '/src/comments.js',
  '/src/ecosystem.js',
  '/src/i18n.js',
  '/src/ui-dialogs.js',
  '/src/services/sound-effects.js',
  '/src/services/voice-recorder.js',
  '/src/services/webrtc-service.js',
  '/src/services/push-notifications.js',
  '/src/services/anti-cheat.js',
  '/src/core/GameState.js',
  '/src/views/account.js',
  '/src/views/feed.js',
  '/src/views/legale.js',
  '/src/views/settings.js',
  '/src/views/stats.js',
  '/src/games/bike.js',
  '/src/games/billiards.js',
  '/src/games/bubble.js',
  '/src/games/car.js',
  '/src/games/checkers.js',
  '/src/games/chess.js',
  '/src/games/horde.js',
  'https://unpkg.com/three@0.160.0/build/three.module.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[BerthoPlay SW] Mise en cache critique v0 Pre-Release...');
      return Promise.all(
        CORE_ASSETS.map((path) =>
          cache.add(path).catch((err) => console.warn(`Échec cache pour ${path}:`, err))
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes API dynamiques pour ne jamais les bloquer en cache
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) return;
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html');
        });
    })
  );
});

// 📢 ÉCOUTEUR DE NOTIFICATIONS PUSH SYSTÈME HORS-APPLICATION
self.addEventListener('push', (event) => {
  let data = { title: 'BerthoPlay', message: 'Nouveau message ou notification !' };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {}
  
  const options = {
    body: data.message || data.body,
    icon: '/public/logo.png',
    badge: '/public/logo.png',
    vibrate: [100, 50, 100],
    data: { url: data.targetUrl || '/' }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});