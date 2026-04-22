import { doc, onSnapshot, updateDoc, serverTimestamp, increment, arrayUnion } from 'firebase/firestore'
import { db } from './config'

export const subscribeToPlayer = (uid, callback) =>
  onSnapshot(doc(db, 'players', uid), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() })
  })

export const updatePlayer = (uid, data) =>
  updateDoc(doc(db, 'players', uid), { ...data, updatedAt: serverTimestamp() })

// ── XP & Level Up ────────────────────────────────────────────
export const addXP = async (uid, amount, player) => {
  let newXP = player.xp + amount
  let newLevel = player.level
  let newXPToNext = player.xpToNext
  let newRankXP = player.rankXP + Math.floor(amount * 0.3)
  let newGold = player.gold + Math.floor(amount * 0.1)

  while (newXP >= newXPToNext) {
    newXP -= newXPToNext
    newLevel++
    newXPToNext = Math.floor(100 * Math.pow(1.15, newLevel - 1))
  }

  await updatePlayer(uid, {
    xp: newXP,
    level: newLevel,
    xpToNext: newXPToNext,
    rankXP: Math.min(newRankXP, player.rankXPToNext),
    gold: newGold,
    questsCompleted: increment(1),
  })

  return { leveledUp: newLevel > player.level, newLevel }
}

// ── Rank Up ──────────────────────────────────────────────────
const RANK_PROGRESSION = {
  E: { next: 'D', rankXPToNext: 1500 },
  D: { next: 'C', rankXPToNext: 3500 },
  C: { next: 'B', rankXPToNext: 7500 },
  B: { next: 'A', rankXPToNext: 15000 },
  A: { next: 'S', rankXPToNext: 999999 },
}

export const performRankUp = async (uid, player) => {
  const progression = RANK_PROGRESSION[player.rank]
  if (!progression) return null

  const newRank = progression.next
  const rankXPToNext = progression.rankXPToNext

  await updatePlayer(uid, {
    rank: newRank,
    rankXP: 0,
    rankXPToNext,
    gold: increment(500),
  })

  return newRank
}

// ── Steps ────────────────────────────────────────────────────
export const resetDailySteps = async (uid, player) => {
  const today = new Date().toDateString()
  if (player.lastResetDate === today) return // Already reset today

  const history = player.stepHistory || []
  const yesterday = {
    date: player.lastResetDate || new Date(Date.now() - 86400000).toDateString(),
    steps: player.dailySteps || 0,
  }

  // Keep only last 7 days
  const newHistory = [...history, yesterday].slice(-7)

  await updatePlayer(uid, {
    dailySteps: 0,
    totalSteps: (player.totalSteps || 0) + (player.dailySteps || 0),
    stepHistory: newHistory,
    lastResetDate: today,
  }).catch(err => {
    console.error("Erreur lors de resetDailySteps:", err)
  })
}

export const rewardStepMilestone = async (uid, player, milestone = 10000) => {
  const alreadyRewarded = player[`stepReward_${milestone}_${new Date().toDateString()}`]
  if (alreadyRewarded) return false

  await updatePlayer(uid, {
    xp: increment(100),
    gold: increment(50),
    rankXP: increment(30),
    [`stepReward_${milestone}_${new Date().toDateString()}`]: true,
  })

  return true
}

// ── Purchases ────────────────────────────────────────────────
export const purchaseItem = async (uid, item, player) => {
  if (player.gold < item.price) throw new Error('Or insuffisant')
  await updatePlayer(uid, {
    gold: player.gold - item.price,
    inventory: [...player.inventory, item.id],
  })
}

// ── Quests ───────────────────────────────────────────────────
export const completeQuest = async (uid, quest, player) => {
  const statUpdates = {}
  if (quest.statBonus) {
    Object.entries(quest.statBonus).forEach(([stat, val]) => {
      statUpdates[`stats.${stat}`] = (player.stats[stat] || 0) + val
    })
  }

  if (quest.tracking) {
    statUpdates[`totals.${quest.tracking.id}`] = increment(quest.tracking.amount)
  }

  let newXP = player.xp + quest.xpReward
  let newLevel = player.level
  let newXPToNext = player.xpToNext
  let didLevelUp = false

  while (newXP >= newXPToNext) {
    newXP -= newXPToNext
    newLevel++
    newXPToNext = Math.floor(100 * Math.pow(1.15, newLevel - 1))
    didLevelUp = true
  }

  await updatePlayer(uid, {
    xp: newXP,
    level: newLevel,
    xpToNext: newXPToNext,
    gold: increment(quest.goldReward),
    rankXP: increment(Math.floor(quest.xpReward * 0.3)),
    questsCompleted: increment(1),
    ...statUpdates,
  })

  return { leveledUp: didLevelUp, newLevel }
}

// ── Penalty ──────────────────────────────────────────────────
export const applyPenalty = async (uid, player) => {
  await updatePlayer(uid, {
    xp: Math.max(0, player.xp - 20),
    penalties: increment(1),
    streak: 0,
  })
}
