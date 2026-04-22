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

export const getDailyQuests = (rank = 'E', date = new Date()) => {
  const seed = parseInt(`${date.getFullYear()}${date.getMonth()}${date.getDate()}`)
  
  // Generate 20 procedural quests using the seed
  const proceduralQuests = generateExtraQuests(rank, seed)
  
  // Return exactly 5 quests for the day
  return proceduralQuests.slice(0, 5)
}
