import { useState, useEffect, useRef, useCallback } from 'react'

// Détection de pas via DeviceMotion (accéléromètre)
const STEP_THRESHOLD = 12
const STEP_COOLDOWN_MS = 400

export const usePedometer = () => {
  const [steps, setSteps] = useState(0)
  const [supported, setSupported] = useState(false)
  const lastStep = useRef(0)
  const lastAcc = useRef(0)
  const smoothAcc = useRef(0)

  useEffect(() => {
    if (!window.DeviceMotionEvent) {
      setSupported(false)
      return
    }

    const requestPermission = async () => {
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          const perm = await DeviceMotionEvent.requestPermission()
          if (perm !== 'granted') return
        } catch { return }
      }
      setSupported(true)
      startListening()
    }

    const startListening = () => {
      window.addEventListener('devicemotion', handleMotion)
    }

    const handleMotion = (e) => {
      const acc = e.acceleration || e.accelerationIncludingGravity
      if (!acc) return

      const magnitude = Math.sqrt(
        (acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2
      )

      smoothAcc.current = smoothAcc.current * 0.7 + magnitude * 0.3
      const delta = Math.abs(smoothAcc.current - lastAcc.current)
      lastAcc.current = smoothAcc.current

      const now = Date.now()
      if (delta > STEP_THRESHOLD && now - lastStep.current > STEP_COOLDOWN_MS) {
        lastStep.current = now
        setSteps((s) => s + 1)
      }
    }

    requestPermission()
    return () => window.removeEventListener('devicemotion', handleMotion)
  }, [])

  return { steps, supported }
}

// Hook Google Fit (OAuth2)
export const useGoogleFit = (accessToken) => {
  const [steps, setSteps] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastStatus, setLastStatus] = useState(null)   // 'ok' | 'error' | 'empty'
  const [lastError, setLastError] = useState(null)     // error message string
  const [lastSyncTime, setLastSyncTime] = useState(null) // Date

  const fetchSteps = useCallback(async (manual = false) => {
    if (!accessToken) return
    setLoading(true)
    try {
      const now = Date.now()
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      console.log('[GoogleFit] Token présent, longueur:', accessToken.length)
      console.log('[GoogleFit] Plage:', new Date(startOfDay).toISOString(), '→', new Date(now).toISOString())

      const body = {
        aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startOfDay.getTime(),
        endTimeMillis: now,
      }

      const res = await fetch(
        'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      )

      console.log('[GoogleFit] Réponse HTTP:', res.status)

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const errMsg = `HTTP ${res.status}: ${errorData.error?.message || 'Erreur inconnue'}`
        console.error('[GoogleFit] Erreur:', errMsg)
        setLastStatus('error')
        setLastError(errMsg)
        setLastSyncTime(new Date())
        throw new Error(errMsg)
      }

      const data = await res.json()
      let totalSteps = 0
      if (data.bucket) {
        data.bucket.forEach(b => {
          b.dataset?.forEach(d => {
            d.point?.forEach(p => {
              p.value?.forEach(v => {
                totalSteps += v.intVal || 0
              })
            })
          })
        })
      }

      console.log('[GoogleFit] Pas trouvés:', totalSteps, '| Buckets:', data.bucket?.length)
      setSteps(totalSteps)
      setLastStatus(totalSteps === 0 ? 'empty' : 'ok')
      setLastError(null)
      setLastSyncTime(new Date())

      if (manual) {
        import('../stores/gameStore').then(({ useGameStore }) => {
          useGameStore.getState().addNotification({
            type: totalSteps > 0 ? 'success' : 'warning',
            message: totalSteps > 0
              ? `✅ Synchro OK : ${totalSteps} pas dans le Cloud.`
              : `⚠️ Google Fit répond mais 0 pas trouvés. Ouvre Google Fit et synchro manuellement.`
          })
        })
      }
    } catch (err) {
      console.error('[GoogleFit] Exception:', err)
      setLastStatus('error')
      setLastError(err.message)
      setLastSyncTime(new Date())
      import('../stores/gameStore').then(({ useGameStore }) => {
        useGameStore.getState().addNotification({
          type: 'error',
          message: `Erreur Synchro: ${err.message}`
        })
      })
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    if (!accessToken) return
    fetchSteps()
    const interval = setInterval(() => fetchSteps(), 5 * 60 * 1000)
    const handleFocus = () => fetchSteps()
    window.addEventListener('focus', handleFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [accessToken, fetchSteps])

  return { steps, loading, lastStatus, lastError, lastSyncTime, forceSync: () => fetchSteps(true) }
}
