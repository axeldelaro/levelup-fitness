/* ============================================================
   LevelUp Fitness — Service Worker
   - Cache offline assets
   - Scheduled push notifications (hourly + 19h)
   ============================================================ */

const CACHE_NAME = 'levelup-v1'

// ── Install & cache ──────────────────────────────────────────
self.addEventListener('install', (e) => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim())
})

// ── Push notifications received from server ──────────────────
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
        { action: 'open', title: '📊 Enregistrer mes pas' },
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

// ── Local scheduled notifications (via message) ──────────────
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleNotifications()
  }
  if (e.data?.type === 'SHOW_STEP_REMINDER') {
    self.registration.showNotification('⚔️ LevelUp Fitness', {
      body: e.data.body || 'Il est temps d\'enregistrer tes pas !',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'step-reminder',
      renotify: true,
      actions: [
        { action: 'open', title: '📊 Enregistrer maintenant' },
        { action: 'dismiss', title: 'Plus tard' }
      ]
    })
  }
})
