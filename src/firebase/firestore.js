import { doc, onSnapshot, updateDoc, serverTimestamp, increment } from 'firebase/firestore'
import { db } from './config'

export const subscribeToPlayer = (uid, callback) =>
  onSnapshot(doc(db, 'players', uid), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() })
  })

export const updatePlayer = (uid, data) =>
  updateDoc(doc(db, 'players', uid), { ...data, updatedAt: serverTimestamp() })

export const addXP = async (uid, amount, player) => {
  let newXP = player.xp + amount
  let newLevel = player.level
  let newXPToNext = player.xpToNext
  let newRankXP = player.rankXP + Math.floor(amount * 0.3)
  let newGold = player.gold + Math.floor(amount * 0.1)

  // Level up
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

export const addSteps = async (uid, steps, player) => {
  const bonusXP = Math.floor(steps / 100)
  const bonusAgility = Math.floor(steps / 1000)
  
  await updatePlayer(uid, {
    totalSteps: increment(steps),
    dailySteps: increment(steps),
    'stats.agility': Math.min(player.stats.agility + bonusAgility, 999),
    xp: increment(bonusXP),
  })
}

export const purchaseItem = async (uid, item, player) => {
  if (player.gold < item.price) throw new Error('Or insuffisant')
  await updatePlayer(uid, {
    gold: player.gold - item.price,
    inventory: [...player.inventory, item.id],
  })
}

export const completeQuest = async (uid, quest, player) => {
  const statUpdates = {}
  if (quest.statBonus) {
    Object.entries(quest.statBonus).forEach(([stat, val]) => {
      statUpdates[`stats.${stat}`] = (player.stats[stat] || 0) + val
    })
  }

  await updatePlayer(uid, {
    xp: increment(quest.xpReward),
    gold: increment(quest.goldReward),
    rankXP: increment(Math.floor(quest.xpReward * 0.3)),
    questsCompleted: increment(1),
    ...statUpdates,
  })
}

export const applyPenalty = async (uid, player) => {
  await updatePlayer(uid, {
    xp: Math.max(0, player.xp - 20),
    penalties: increment(1),
    streak: 0,
  })
}
