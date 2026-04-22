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
      // ── Level up detection ──────────────────────────────
      if (prevLevel.current !== null && data.level > prevLevel.current) {
        useGameStore.getState().triggerLevelUp({ level: data.level })
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400])
      }
      prevLevel.current = data.level

      // ── Rank up detection ───────────────────────────────
      if (prevRank.current !== null && data.rank !== prevRank.current) {
        useGameStore.getState().addNotification({
          type: 'success',
          message: `🏆 RANG ${data.rank} ATTEINT ! Bienvenue parmi les élites, Chasseur !`
        })
        if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 600])
      }
      prevRank.current = data.rank

      // ── Auto rank up when rankXP is full ────────────────
      if (data.rankXP >= data.rankXPToNext && data.rank !== 'S') {
        await performRankUp(uid, data)
        return // Player will be updated via subscription
      }

      // ── 10k step milestone reward ───────────────────────
      if (
        data.dailySteps >= 10000 &&
        (prevDailySteps.current === null || prevDailySteps.current < 10000)
      ) {
        const rewarded = await rewardStepMilestone(uid, data, 10000)
        if (rewarded) {
          useGameStore.getState().addNotification({
            type: 'success',
            message: '🚶 10 000 PAS ! +100 XP +50 🪙 — Objectif journalier atteint !'
          })
          if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 300])
        }
      }
      prevDailySteps.current = data.dailySteps

      // ── Midnight reset check ────────────────────────────
      const today = new Date().toDateString()
      if (data.lastResetDate && data.lastResetDate !== today) {
        await resetDailySteps(uid, data)
        return
      }
      if (!data.lastResetDate) {
        await resetDailySteps(uid, { ...data, dailySteps: 0 })
        return
      }

      setPlayer(data)
      scheduleMidnightReset(data)
    })

    return () => {
      unsub()
      clearTimeout(midnightTimer.current)
    }
  }, [uid])

  return player
}
