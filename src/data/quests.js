// Templates de quêtes — générées chaque jour via seed date
export const QUEST_TEMPLATES = [
  {
    id: 'pushups_50',
    title: '50 Pompes',
    description: 'Effectue 50 pompes en plusieurs séries',
    icon: '💪',
    category: 'strength',
    xpReward: 40,
    goldReward: 10,
    statBonus: { strength: 2 },
    duration: null,
  },
  {
    id: 'squats_50',
    title: '50 Squats',
    description: 'Effectue 50 squats profonds',
    icon: '🦵',
    category: 'strength',
    xpReward: 35,
    goldReward: 8,
    statBonus: { strength: 1, endurance: 1 },
    duration: null,
  },
  {
    id: 'walk_5km',
    title: 'Marche 5 km',
    description: 'Parcours 5 kilomètres à pied (≈ 6500 pas)',
    icon: '🚶',
    category: 'cardio',
    xpReward: 60,
    goldReward: 15,
    statBonus: { agility: 3 },
    duration: null,
  },
  {
    id: 'plank_2min',
    title: 'Gainage 2 min',
    description: 'Tiens la position de planche pendant 2 minutes',
    icon: '🏋️',
    category: 'endurance',
    xpReward: 30,
    goldReward: 8,
    statBonus: { endurance: 2, vitality: 1 },
    duration: 120,
  },
  {
    id: 'pullups_20',
    title: '20 Tractions',
    description: 'Effectue 20 tractions complètes',
    icon: '🤸',
    category: 'strength',
    xpReward: 50,
    goldReward: 12,
    statBonus: { strength: 3 },
    duration: null,
  },
  {
    id: 'burpees_30',
    title: '30 Burpees',
    description: 'Enchaîne 30 burpees explosifs',
    icon: '🔥',
    category: 'cardio',
    xpReward: 55,
    goldReward: 14,
    statBonus: { endurance: 2, agility: 1 },
    duration: null,
  },
  {
    id: 'meditation_10',
    title: 'Méditation 10 min',
    description: 'Pratique 10 minutes de méditation guidée',
    icon: '🧘',
    category: 'mind',
    xpReward: 25,
    goldReward: 6,
    statBonus: { intelligence: 2, vitality: 1 },
    duration: 600,
  },
  {
    id: 'dips_30',
    title: '30 Dips',
    description: 'Effectue 30 dips aux barres parallèles',
    icon: '💎',
    category: 'strength',
    xpReward: 45,
    goldReward: 11,
    statBonus: { strength: 2 },
    duration: null,
  },
  {
    id: 'run_3km',
    title: 'Course 3 km',
    description: 'Cours 3 kilomètres sans t\'arrêter',
    icon: '🏃',
    category: 'cardio',
    xpReward: 70,
    goldReward: 18,
    statBonus: { agility: 2, endurance: 2 },
    duration: null,
  },
  {
    id: 'stretching_15',
    title: 'Étirements 15 min',
    description: 'Réalise une session complète d\'étirements',
    icon: '🌸',
    category: 'flexibility',
    xpReward: 20,
    goldReward: 5,
    statBonus: { agility: 1, vitality: 2 },
    duration: 900,
  },
]

// Quêtes urgentes — apparaissent aléatoirement
export const URGENT_QUEST_TEMPLATES = [
  {
    id: 'urgent_plank',
    title: 'ALERTE SYSTÈME',
    subtitle: 'Gainage immédiat — 2 minutes !',
    description: 'Un portail d\'urgence s\'est ouvert. Tiens le gainage pendant 2 minutes pour le fermer !',
    icon: '⚠️',
    xpReward: 50,
    goldReward: 20,
    timeLimit: 30 * 60, // 30 min to accept
    duration: 120,
    statBonus: { endurance: 3 },
  },
  {
    id: 'urgent_pushups',
    title: 'MISSION CRITIQUE',
    subtitle: '20 Pompes — Maintenant !',
    description: 'Le système exige une démonstration de force immédiate. 20 pompes, sans excuses.',
    icon: '🚨',
    xpReward: 40,
    goldReward: 15,
    timeLimit: 20 * 60,
    duration: null,
    statBonus: { strength: 2 },
  },
  {
    id: 'urgent_squats',
    title: 'PÉNALITÉ IMMINENTE',
    subtitle: '30 Squats ou pénalité !',
    description: 'Refus = -30 XP. Le choix est tien, Chasseur.',
    icon: '💀',
    xpReward: 35,
    goldReward: 12,
    timeLimit: 25 * 60,
    duration: null,
    statBonus: { strength: 1, agility: 1 },
  },
]

// Génère les quêtes du jour via une seed basée sur la date
export const getDailyQuests = (date = new Date()) => {
  const seed = parseInt(`${date.getFullYear()}${date.getMonth()}${date.getDate()}`)
  const shuffled = [...QUEST_TEMPLATES].sort((a, b) => {
    const ra = Math.sin(seed * a.id.length) * 10000
    const rb = Math.sin(seed * b.id.length) * 10000
    return ra - rb
  })
  return shuffled.slice(0, 4)
}

// Quête punition si pénalité
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
