/* ============================================================
   LevelUp Fitness — Service Worker
   - Full offline support (Stale-While-Revalidate)
   - Push notifications
   ============================================================ */

const CACHE_NAME = 'levelup-v2'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
]

// ── Install: Cache static assets ─────────────────────────────
self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  )
})

// ── Activate: Clean old caches ────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      })
    ])
  )
})

// ── Fetch: Stale-While-Revalidate strategy ────────────────────
self.addEventListener('fetch', (e) => {
  // Ignore Firestore/Auth and Chrome extension requests
  if (
    e.request.url.includes('firestore.googleapis.com') ||
    e.request.url.includes('identitytoolkit.googleapis.com') ||
    e.request.url.includes('chrome-extension') ||
    e.request.method !== 'GET'
  ) {
    return
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        // Only cache valid responses
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache)
          })
        }
        return networkResponse
      }).catch(() => {
        // If network fails, we already have cachedResponse or undefined
        return cachedResponse
      })

      return cachedResponse || fetchPromise
    })
  )
})

// ── Push notifications received ──────────────────────────────
self.addEventListener('push', (e) => {
  const data = e.data?.json() || { title: 'LevelUp Fitness', body: 'Enregistre tes pas !' }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag || 'step-reminder',
      renotify: true,
      data: { url: data.url || '/' },
      actions: [
        { action: 'open', title: '📊 Enregistrer' },
        { action: 'dismiss', title: 'Plus tard' }
      ]
    })
  )
})

// ── Notification click ───────────────────────────────────────
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  if (e.action === 'dismiss') return

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'OPEN_STEP_ENTRY' })
          return client.focus()
        }
      }
      return clients.openWindow('/?action=steps')
    })
  )
})

// ── Message handler ──────────────────────────────────────────
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SHOW_STEP_REMINDER') {
    self.registration.showNotification('⚔️ LevelUp Fitness', {
      body: e.data.body || 'Il est temps d\'enregistrer tes pas !',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'step-reminder',
      renotify: true,
      actions: [
        { action: 'open', title: '📊 Enregistrer' },
        { action: 'dismiss', title: 'Plus tard' }
      ]
    })
  }
})
