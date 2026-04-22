import { useEffect, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import { subscribeToPlayer, resetDailySteps, rewardStepMilestone, performRankUp } from '../firebase/firestore'

export const usePlayer = (uid) => {
  const { player, setPlayer } = useGameStore()
  const prevLevel = useRef(null)
  const prevRank = useRef(null)
  const prevDailySteps = useRef(null)
  const midnightTimer = useRef(null)

  // ── Midnight reset scheduler ─────────────────────────────
  const scheduleMidnightReset = (playerData) => {
    clearTimeout(midnightTimer.current)
    const now = new Date()
    const midnight = new Date()
    midnight.setHours(24, 0, 0, 0)
    const msUntilMidnight = midnight - now

    midnightTimer.current = setTimeout(async () => {
      await resetDailySteps(uid, playerData)
      scheduleMidnightReset({ ...playerData, dailySteps: 0 })
    }, msUntilMidnight)
  }

  useEffect(() => {
    if (!uid) return

    const unsub = subscribeToPlayer(uid, async (data) => {
      // ── MISE À JOUR IMMÉDIATE DE L'INTERFACE ────────────
      setPlayer(data)
      scheduleMidnightReset(data)

      // ── Tâches de fond (Arrière-plan) ──────────────────
      
      // ── Détection de Level Up ────────────
      if (prevLevel.current !== null && data.level > prevLevel.current) {
        useGameStore.getState().triggerLevelUp({ level: data.level })
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400])
      }
      prevLevel.current = data.level

      // ── Détection de Rank Up ────────────
      if (prevRank.current !== null && data.rank !== prevRank.current) {
        useGameStore.getState().addNotification({
          type: 'success',
          message: `🏆 RANG ${data.rank} ATTEINT ! Bienvenue parmi les élites, Chasseur !`
        })
        if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 600])
      }
      prevRank.current = data.rank

      // ── Auto rank up si XP plein ────────
      if (data.rankXP >= data.rankXPToNext && data.rank !== 'S') {
        try { await performRankUp(uid, data) } catch(e) {}
      }

      // ── Récompense 10k pas ──────────────
      if (
        data.dailySteps >= 10000 &&
        (prevDailySteps.current === null || prevDailySteps.current < 10000)
      ) {
        try {
          const rewarded = await rewardStepMilestone(uid, data, 10000)
          if (rewarded) {
            useGameStore.getState().addNotification({
              type: 'success',
              message: '🚶 10 000 PAS ! +100 XP +50 🪙 — Objectif journalier atteint !'
            })
            if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 300])
          }
        } catch(e) {}
      }
      prevDailySteps.current = data.dailySteps

      // ── Reset de minuit ─────────────────
      const today = new Date().toDateString()
      if (!data.lastResetDate || data.lastResetDate !== today) {
        try { await resetDailySteps(uid, data) } catch(e) {}
      }
    })

    return () => {
      unsub()
      clearTimeout(midnightTimer.current)
    }
  }, [uid])

  return player
}
