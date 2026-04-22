export const RANKS = [
  { id: 'E', label: 'Rang E', color: '#6b7280', glow: 'rgba(107,114,128,0.5)', xpRequired: 0, xpToNext: 500 },
  { id: 'D', label: 'Rang D', color: '#22c55e', glow: 'rgba(34,197,94,0.5)', xpRequired: 500, xpToNext: 1500 },
  { id: 'C', label: 'Rang C', color: '#3b82f6', glow: 'rgba(59,130,246,0.5)', xpRequired: 1500, xpToNext: 3500 },
  { id: 'B', label: 'Rang B', color: '#a855f7', glow: 'rgba(168,85,247,0.5)', xpRequired: 3500, xpToNext: 7500 },
  { id: 'A', label: 'Rang A', color: '#f59e0b', glow: 'rgba(245,158,11,0.5)', xpRequired: 7500, xpToNext: 15000 },
  { id: 'S', label: 'Rang S', color: '#ef4444', glow: 'rgba(239,68,68,0.5)', xpRequired: 15000, xpToNext: 999999 },
]

export const getRankConfig = (rank) => RANKS.find(r => r.id === rank) || RANKS[0]

export const getRankClass = (rank) => `rank-badge-${rank.toLowerCase()}`

export const calcXPToNext = (level) => Math.floor(100 * Math.pow(1.15, level - 1))

export const getNextRank = (rank) => {
  const idx = RANKS.findIndex(r => r.id === rank)
  return RANKS[idx + 1] || null
}

export const BOSS_WORKOUTS = {
  E: {
    name: 'Le Gardien des Ruines',
    description: 'HIIT de 15 minutes — Prouve que tu mérites le Rang D',
    exercises: [
      { name: 'Burpees', reps: '10', rest: '20s' },
      { name: 'Pompes explosives', reps: '10', rest: '20s' },
      { name: 'Mountain Climbers', reps: '20', rest: '20s' },
      { name: 'Squats sautés', reps: '10', rest: '30s' },
    ],
    rounds: 4,
    xpReward: 200,
    goldReward: 100,
    rankUp: 'D',
  },
  D: {
    name: 'Le Colosse Brisé',
    description: 'HIIT de 15 minutes — Le chemin vers le Rang C',
    exercises: [
      { name: 'Burpees', reps: '15', rest: '15s' },
      { name: 'Pompes diamant', reps: '12', rest: '20s' },
      { name: 'Dips', reps: '12', rest: '20s' },
      { name: 'Jump Lunges', reps: '12', rest: '20s' },
    ],
    rounds: 4,
    xpReward: 400,
    goldReward: 200,
    rankUp: 'C',
  },
  C: {
    name: 'L\'Ombre du Donjon',
    description: 'HIIT 15 min — Seuls les forts atteignent le Rang B',
    exercises: [
      { name: 'Burpees', reps: '20', rest: '10s' },
      { name: 'Tractions', reps: '8', rest: '20s' },
      { name: 'Pompes archer', reps: '10', rest: '20s' },
      { name: 'Pistol Squat', reps: '5/côté', rest: '30s' },
    ],
    rounds: 5,
    xpReward: 800,
    goldReward: 400,
    rankUp: 'B',
  },
}
