import { generateExtraQuests } from './extraQuests'

export const PENALTY_QUEST = {
  id: 'penalty_quest',
  title: 'Quête de Punition',
  description: 'Tu as failli hier. Prouve ta valeur : 100 sauts à la corde ou 5 minutes de gainage.',
  icon: '💀',
  xpReward: 0,
  goldReward: 0,
  statBonus: {},
  isPenalty: true,
}

export const URGENT_QUEST_TEMPLATES = [
  { id: 'u1', title: 'Embuscade', description: 'Fais 20 pompes immédiatement.', icon: '⚠️', duration: 120, xpReward: 50, goldReward: 20, statBonus: { strength: 1 } },
  { id: 'u2', title: 'Repli tactique', description: '50 High Knees (montées de genoux) pour fuir.', icon: '🏃', duration: 120, xpReward: 40, goldReward: 15, statBonus: { agility: 1 } },
  { id: 'u3', title: 'Défense critique', description: '60 secondes de gainage.', icon: '🛡️', duration: 120, xpReward: 60, goldReward: 25, statBonus: { endurance: 1 } },
]

export const getDailyQuests = (rank = 'E', date = new Date()) => {
  const seed = parseInt(`${date.getFullYear()}${date.getMonth()}${date.getDate()}`)
  
  // Generate 20 procedural quests using the seed
  const proceduralQuests = generateExtraQuests(rank, seed)
  
  // Return exactly 5 quests for the day
  return proceduralQuests.slice(0, 5)
}
