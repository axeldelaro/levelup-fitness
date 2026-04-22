/* ============================================================
   LevelUp Fitness — Service Worker v4
   RÈGLE ABSOLUE : ne jamais appeler respondWith() sur des
   requêtes externes. Seulement pour les fichiers locaux statiques.
   ============================================================ */

const CACHE_NAME = 'levelup-v4'
const STATIC_ASSETS = [
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
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
    ])
  )
})

// ── Fetch : ONLY intercept same-origin GET requests ───────────
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // ❌ Let pass through: non-GET, cross-origin, websockets, etc.
  if (
    e.request.method !== 'GET' ||
    url.origin !== self.location.origin
  ) {
    return // Do NOT call e.respondWith() — browser handles it normally
  }

  // ✅ Same-origin GET: cache-first for static assets, network-first for the rest
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached

      return fetch(e.request).then((response) => {
        // Cache valid responses for static assets
        if (response.ok && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone))
        }
        return response
      }).catch(() => {
        // Offline fallback: serve cached index.html for navigation
        if (e.request.mode === 'navigate') {
          return caches.match('/index.html')
        }
        return new Response('', { status: 503 })
      })
    })
  )
})

// ── Notifications ─────────────────────────────────────────────
self.addEventListener('push', (e) => {
  const data = e.data?.json() || { title: 'LevelUp Fitness', body: 'Enregistre tes pas !' }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag || 'step-reminder',
      renotify: true,
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
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
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
      body: e.data.body || 'Enregistre tes pas, Chasseur !',
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
