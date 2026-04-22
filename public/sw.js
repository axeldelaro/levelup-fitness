/* ============================================================
   LevelUp Fitness — Service Worker
   - Basic offline support
   - Push notifications
   ============================================================ */

const CACHE_NAME = 'levelup-v1'
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icons/icon-192.png'
]

// ── Install: Cache assets ────────────────────────────────────
self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
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

// ── Fetch: Cache falling back to network ──────────────────────
self.addEventListener('fetch', (e) => {
  // Pass-through for now to avoid breaking Firestore/Auth
  return
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
