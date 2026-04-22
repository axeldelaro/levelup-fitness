import { useEffect, useRef, useCallback } from 'react'

const HOURLY_MESSAGES = [
  "💪 1 heure de plus ! Combien de pas as-tu fait ?",
  "🚶 Le temps passe. Enregistre tes pas de Chasseur !",
  "⚔️ Un chasseur de rang S surveille ses stats. Et toi ?",
  "🔥 Chaque pas compte ! Mets à jour ton compteur.",
  "🎯 Progression en cours — enregistre tes pas maintenant.",
  "🏃 Tu bouges ? N'oublie pas de logger tes pas !",
  "💡 Petit rappel : tes pas de la dernière heure t'attendent !",
]

const EVENING_MESSAGE = "🌙 Il est 19h, Chasseur ! C'est l'heure de ton bilan journalier. Enregistre tes pas avant la fin de la journée !"

function getRandomHourlyMessage() {
  return HOURLY_MESSAGES[Math.floor(Math.random() * HOURLY_MESSAGES.length)]
}

function msUntilNext19h() {
  const now = new Date()
  const next19h = new Date()
  next19h.setHours(19, 0, 0, 0)
  if (now >= next19h) {
    next19h.setDate(next19h.getDate() + 1)
  }
  return next19h.getTime() - now.getTime()
}

function msUntilNextHour() {
  const now = new Date()
  const next = new Date(now)
  next.setHours(now.getHours() + 1, 0, 0, 0)
  return next.getTime() - now.getTime()
}

export function useStepNotifications() {
  const hourlyTimer = useRef(null)
  const eveningTimer = useRef(null)
  const swRegistration = useRef(null)

  const sendNotification = useCallback((title, body, tag = 'step-reminder') => {
    if (!swRegistration.current) return
    swRegistration.current.active?.postMessage({
      type: 'SHOW_STEP_REMINDER',
      body,
    })
  }, [])

  const scheduleHourly = useCallback(() => {
    const delay = msUntilNextHour()
    console.log(`[Notifs] Prochain rappel horaire dans ${Math.round(delay / 60000)} min`)
    hourlyTimer.current = setTimeout(() => {
      sendNotification('⚔️ LevelUp Fitness', getRandomHourlyMessage())
      scheduleHourly() // Reschedule for next hour
    }, delay)
  }, [sendNotification])

  const scheduleEvening = useCallback(() => {
    const delay = msUntilNext19h()
    console.log(`[Notifs] Rappel 19h dans ${Math.round(delay / 60000)} min`)
    eveningTimer.current = setTimeout(() => {
      sendNotification('🌙 LevelUp Fitness — Bilan du soir', EVENING_MESSAGE, 'evening-reminder')
      scheduleEvening() // Reschedule for tomorrow
    }, delay)
  }, [sendNotification])

  const requestPermissionAndStart = useCallback(async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('[Notifs] Notifications non supportées')
      return false
    }

    // Register service worker
    try {
      const swUrl = `${import.meta.env.BASE_URL}sw.js`
      const reg = await navigator.serviceWorker.register(swUrl, { scope: import.meta.env.BASE_URL })
      swRegistration.current = reg
      console.log('[Notifs] Service Worker enregistré avec scope:', import.meta.env.BASE_URL)
    } catch (err) {
      console.error('[Notifs] Erreur SW:', err)
      return false
    }

    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('[Notifs] Permission refusée')
      return false
    }

    console.log('[Notifs] Permission accordée, planification des rappels...')

    // Schedule both
    scheduleHourly()
    scheduleEvening()

    return true
  }, [scheduleHourly, scheduleEvening])

  useEffect(() => {
    // Auto-start if permission already granted
    if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
      const swUrl = `${import.meta.env.BASE_URL}sw.js`
      navigator.serviceWorker.register(swUrl, { scope: import.meta.env.BASE_URL }).then((reg) => {
        swRegistration.current = reg
        scheduleHourly()
        scheduleEvening()
        
        // Test notification on start
        const lastTest = sessionStorage.getItem('notifTestDone')
        if (!lastTest) {
          setTimeout(() => {
            sendNotification('⚔️ Système Actif', 'Les rappels de pas sont opérationnels, Chasseur !')
            sessionStorage.setItem('notifTestDone', 'true')
          }, 3000)
        }
      })
    }

    // Listen for SW messages (e.g. "open step entry")
    const handleSWMessage = (e) => {
      if (e.data?.type === 'OPEN_STEP_ENTRY') {
        window.dispatchEvent(new CustomEvent('openStepEntry'))
      }
    }
    navigator.serviceWorker?.addEventListener('message', handleSWMessage)

    return () => {
      clearTimeout(hourlyTimer.current)
      clearTimeout(eveningTimer.current)
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage)
    }
  }, [scheduleHourly, scheduleEvening])

  return { requestPermissionAndStart }
}
