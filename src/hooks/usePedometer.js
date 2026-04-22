import { useState, useEffect, useRef } from 'react'

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

      // Smooth the acceleration
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

  useEffect(() => {
    if (!accessToken) return

    const fetchSteps = async () => {
      setLoading(true)
      try {
        const now = Date.now()
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

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

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(`Google Fit HTTP ${res.status}: ${errorData.error?.message || 'Erreur inconnue'}`)
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
        setSteps(totalSteps)
      } catch (err) {
        console.error('Google Fit error:', err)
        import('../stores/gameStore').then(({ useGameStore }) => {
          useGameStore.getState().addNotification({
            type: 'error',
            message: `Erreur Synchro Pas: ${err.message}`
          })
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSteps()
    const interval = setInterval(fetchSteps, 60 * 1000) // every 1 min
    window.addEventListener('focus', fetchSteps) // sync when user returns to app
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', fetchSteps)
    }
  }, [accessToken])

  return { steps, loading }
}
