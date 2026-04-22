import fs from 'fs'

const ranks = ['E', 'D', 'C', 'B', 'A', 'S']
const categories = ['strength', 'cardio', 'endurance', 'mind', 'flexibility']
const icons = {
  strength: ['💪', '🦵', '🤸', '💎', '🏋️'],
  cardio: ['🏃', '🚶', '🔥', '🚴', '🏊'],
  endurance: ['🛡️', '⏳', '🧗', '🔋', '😤'],
  mind: ['🧘', '🧠', '👁️', '📚', '🌌'],
  flexibility: ['🌸', '🥨', '🤸', '🦋', '🎋']
}

const multipliers = {
  E: 1, D: 1.5, C: 2.5, B: 4, A: 6, S: 10
}

const baseXP = 30
const baseGold = 8

function generateQuests() {
  const allQuests = {}
  
  ranks.forEach((rank, rIdx) => {
    allQuests[rank] = []
    const m = multipliers[rank]
    
    for (let i = 1; i <= 25; i++) {
      const category = categories[i % categories.length]
      const icon = icons[category][i % icons[category].length]
      
      let title, desc, duration = null, stats = {}
      
      if (category === 'strength') {
        const reps = Math.floor((10 + i * 2) * m)
        title = `${reps} Pompes/Squats`
        desc = `Effectue ${reps} répétitions d'un exercice de force pour le rang ${rank}.`
        stats = { strength: Math.ceil(1 * m) }
      } else if (category === 'cardio') {
        const dist = Math.round(1 * m + i * 0.1)
        title = `Course/Marche ${dist} km`
        desc = `Parcours ${dist} kilomètres le plus rapidement possible.`
        stats = { agility: Math.ceil(1 * m) }
      } else if (category === 'endurance') {
        duration = Math.floor((60 + i * 10) * m)
        title = `Gainage ${Math.floor(duration/60)} min`
        desc = `Tiens la position de planche pour renforcer ton noyau d'endurance.`
        stats = { endurance: Math.ceil(1 * m) }
      } else if (category === 'mind') {
        duration = Math.floor((300 + i * 20) * m)
        title = `Méditation ${Math.floor(duration/60)} min`
        desc = `Entraînement mental intensif. Purge ton esprit.`
        stats = { intelligence: Math.ceil(1 * m) }
      } else {
        duration = Math.floor((300 + i * 10) * m)
        title = `Étirements ${Math.floor(duration/60)} min`
        desc = `Améliore ta souplesse pour esquiver les coups.`
        stats = { vitality: Math.ceil(1 * m) }
      }
      
      allQuests[rank].push({
        id: `q_${rank}_${i}`,
        title,
        description: desc,
        icon,
        category,
        xpReward: Math.floor(baseXP * m + i * 2),
        goldReward: Math.floor(baseGold * m + i),
        statBonus: stats,
        duration
      })
    }
  })
  return allQuests
}

const quests = generateQuests()

const output = `// Auto-generated 150 quests for LevelUp Fitness RPG
export const QUESTS_BY_RANK = ${JSON.stringify(quests, null, 2)}

export const URGENT_QUEST_TEMPLATES = [
  {
    id: 'urgent_plank',
    title: 'ALERTE SYSTÈME',
    subtitle: 'Gainage immédiat !',
    description: 'Un portail d\\'urgence s\\'est ouvert. Tiens le gainage pour le fermer !',
    icon: '⚠️',
    xpReward: 100,
    goldReward: 50,
    timeLimit: 30 * 60,
    duration: 120,
    statBonus: { endurance: 3 },
  },
  {
    id: 'urgent_pushups',
    title: 'MISSION CRITIQUE',
    subtitle: 'Pompes — Maintenant !',
    description: 'Le système exige une démonstration de force immédiate.',
    icon: '🚨',
    xpReward: 80,
    goldReward: 40,
    timeLimit: 20 * 60,
    duration: null,
    statBonus: { strength: 2 },
  },
]

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
  const seed = parseInt(\`\${date.getFullYear()}\${date.getMonth()}\${date.getDate()}\`)
  const rankQuests = QUESTS_BY_RANK[rank] || QUESTS_BY_RANK['E']
  
  const shuffled = [...rankQuests].sort((a, b) => {
    const ra = Math.sin(seed * a.id.length) * 10000
    const rb = Math.sin(seed * b.id.length) * 10000
    return ra - rb
  })
  return shuffled.slice(0, 4)
}
`

fs.writeFileSync('src/data/quests.js', output)
console.log('Successfully wrote 150 quests to src/data/quests.js')
