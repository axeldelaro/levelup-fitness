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

        const data = await res.json()
        const bucket = data.bucket?.[0]
        const stepData = bucket?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0
        setSteps(stepData)
      } catch (err) {
        console.error('Google Fit error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSteps()
    const interval = setInterval(fetchSteps, 5 * 60 * 1000) // every 5 min
    return () => clearInterval(interval)
  }, [accessToken])

  return { steps, loading }
}
