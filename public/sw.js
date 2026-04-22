/* ============================================================
   LevelUp Fitness — Service Worker (V3)
   - Fix Network Error
   - Push notifications
   ============================================================ */

const CACHE_NAME = 'levelup-v3'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
]

// ── Install ──────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
})

// ── Activate ─────────────────────────────────────────────────
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

// ── Fetch ────────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  // Only handle GET requests and avoid external APIs/Extensions/Vite HMR
  const url = e.request.url
  if (
    e.request.method !== 'GET' ||
    url.includes('firestore.googleapis.com') ||
    url.includes('identitytoolkit.googleapis.com') ||
    url.includes('chrome-extension') ||
    url.includes('googlevideo') ||
    url.includes('firebase') ||
    url.includes('@vite') ||
    url.includes('node_modules')
  ) {
    return // Let browser handle it normally
  }

  e.respondWith(
    caches.match(e.request).then((response) => {
      if (response) return response

      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse
        }
        
        const responseToCache = networkResponse.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache)
        })
        return networkResponse
      }).catch(() => {
        // Return index.html for navigation requests if offline
        if (e.request.mode === 'navigate') {
          return caches.match('/')
        }
        return null
      })
    })
  )
})

// ── Push / Notifications ─────────────────────────────────────
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
