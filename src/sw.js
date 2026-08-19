// ============================================================================
// BERTHOPLAY — SERVICE WORKER (stratégie injectManifest)
// ----------------------------------------------------------------------------
// Workbox précache les fichiers RÉELLEMENT produits par le build (avec leurs
// empreintes). L'ancienne liste écrite à la main pointait vers /src/*.js, des
// chemins qui n'existent pas en production : le hors-ligne ne fonctionnait pas.
//
// Stratégies :
//   navigation  -> réseau d'abord, repli sur la coque en cache (jamais bloqué
//                  sur une version périmée)
//   assets buil -> précache (immuables, empreinte dans le nom)
//   fontes      -> cache d'abord (elles ne changent jamais)
//   médias      -> cache d'abord, plafonné
//   API         -> jamais mis en cache
// ============================================================================

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Injecté au build par vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

/**
 * Garde-fou : ne jamais traiter autre chose que http(s).
 *
 * Les extensions du navigateur émettent des requêtes en `chrome-extension://`
 * (ou `moz-extension://`, `safari-web-extension://`). L'API Cache refuse ces
 * schémas et lève `TypeError: Request scheme 'chrome-extension' is unsupported`
 * — c'est exactement ce qui faisait tomber l'ancien service worker écrit à la
 * main. Toutes les règles ci-dessous passent par ce filtre.
 */
const isCacheable = ({ url }) => url.protocol === 'http:' || url.protocol === 'https:';

// --- Navigation : réseau d'abord ------------------------------------------
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'), {
    denylist: [/^\/api\//, /\/[^/?]+\.[^/]+$/]
  })
);

// --- Fontes auto-hébergées -------------------------------------------------
registerRoute(
  ({ request, url }) => isCacheable({ url }) && (request.destination === 'font' || url.pathname.startsWith('/fonts/')),
  new CacheFirst({
    cacheName: 'bertho-fonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 24, maxAgeSeconds: 60 * 60 * 24 * 365 })
    ]
  })
);

// --- Images & vidéo d'ambiance --------------------------------------------
registerRoute(
  ({ request, url }) => isCacheable({ url }) && (request.destination === 'image' || request.destination === 'video'),
  new CacheFirst({
    cacheName: 'bertho-media',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30, purgeOnQuotaError: true })
    ]
  })
);

// --- Moteur 3D servi par CDN ----------------------------------------------
registerRoute(
  ({ url }) => isCacheable({ url }) && url.origin === 'https://unpkg.com',
  new CacheFirst({
    cacheName: 'bertho-three',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 90 })
    ]
  })
);

// --- API : le réseau fait foi, jamais de réponse périmée -------------------
registerRoute(
  ({ url }) => isCacheable({ url }) && url.pathname.startsWith('/api/'),
  new NetworkFirst({ cacheName: 'bertho-api', networkTimeoutSeconds: 8 })
);

// ============================================================================
// NOTIFICATIONS PUSH
// ============================================================================

self.addEventListener('push', (event) => {
  let data = { title: 'BerthoPlay', message: 'Nouvelle activité sur la console.' };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(data.title || 'BerthoPlay', {
      body: data.message || data.body || '',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [90, 45, 90],
      tag: data.tag || 'berthoplay',
      renotify: true,
      data: { url: data.targetUrl || '/' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      // Réutiliser un onglet BerthoPlay déjà ouvert plutôt qu'en empiler un autre
      for (const client of windows) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(target).catch(() => {});
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});

// Permet à l'application de forcer l'activation d'une nouvelle version
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
