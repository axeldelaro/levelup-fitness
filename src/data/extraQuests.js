// ============================================================
// Procedural Quest Generator for LevelUp Fitness
// Generates thousands of unique quests to prevent repetition
// ============================================================

const EXERCISES = {
  cardio: [
    { id: 'run', name: 'Course / Marche', icon: '🏃', trackId: 'distance_m', baseAmount: 1000, stat: 'endurance', desc: 'Garde un rythme constant et respire bien.' },
    { id: 'jump_rope', name: 'Saut à la corde', icon: '🪢', trackId: 'jumps', baseAmount: 100, stat: 'agility', desc: 'Sur la pointe des pieds, fluide. (Mime le mouvement si tu n\'as pas de corde)' },
    { id: 'burpees', name: 'Burpees', icon: '🔄', trackId: 'burpees', baseAmount: 10, stat: 'vitality', desc: 'Poitrine au sol, saut explosif.' },
    { id: 'shadowbox', name: 'Shadowboxing', icon: '🥊', trackId: 'minutes', baseAmount: 3, stat: 'agility', desc: 'Mouvements fluides et esquives.' }
  ],
  strength: [
    { id: 'pushups', name: 'Pompes', icon: '💪', trackId: 'pushups', baseAmount: 15, stat: 'strength', desc: 'Corps aligné, amplitude complète.' },
    { id: 'pullups', name: 'Tractions', icon: '🤸', trackId: 'pullups', baseAmount: 5, stat: 'strength', desc: 'Menton au-dessus de la barre.' },
    { id: 'squats', name: 'Squats', icon: '🦵', trackId: 'squats', baseAmount: 20, stat: 'strength', desc: 'Poids sur les talons, dos droit.' },
    { id: 'dips', name: 'Dips', icon: '🏋️', trackId: 'dips', baseAmount: 10, stat: 'strength', desc: 'Contrôle la descente.' },
    { id: 'lunges', name: 'Fentes', icon: '🚀', trackId: 'lunges', baseAmount: 20, stat: 'strength', desc: 'Genou frôle le sol.' },
    { id: 'crunches', name: 'Crunchs', icon: '🔥', trackId: 'crunches', baseAmount: 30, stat: 'strength', desc: 'Contracte les abdos.' }
  ],
  endurance: [
    { id: 'plank', name: 'Gainage', icon: '🧲', trackId: 'seconds', baseAmount: 60, stat: 'endurance', desc: 'Ventre rentré, respire.' },
    { id: 'wall_sit', name: 'Chaise', icon: '🪑', trackId: 'seconds', baseAmount: 60, stat: 'endurance', desc: 'Angle à 90°, dos collé.' },
    { id: 'dead_hang', name: 'Suspension', icon: '🧗', trackId: 'seconds', baseAmount: 30, stat: 'endurance', desc: 'Grip solide, épaules engagées.' }
  ],
  flexibility: [
    { id: 'yoga', name: 'Salutation au Soleil', icon: '☀️', trackId: 'cycles', baseAmount: 5, stat: 'vitality', desc: 'Synchronise mouvement et respiration.' },
    { id: 'stretching', name: 'Étirements', icon: '🧘', trackId: 'minutes', baseAmount: 5, stat: 'vitality', desc: 'Sans douleur, fluide.' },
    { id: 'mobility', name: 'Mobilité Articulaire', icon: '🔄', trackId: 'minutes', baseAmount: 5, stat: 'agility', desc: 'Grands cercles lents.' }
  ],
  mind: [
    { id: 'meditation', name: 'Méditation', icon: '🧠', trackId: 'minutes', baseAmount: 10, stat: 'intelligence', desc: 'Concentre-toi sur ta respiration.' },
    { id: 'reading', name: 'Lecture', icon: '📚', trackId: 'pages', baseAmount: 10, stat: 'intelligence', desc: 'Apprentissage continu.' },
    { id: 'cold_shower', name: 'Douche Froide', icon: '🧊', trackId: 'seconds', baseAmount: 60, stat: 'intelligence', desc: 'Force mentale pure.' },
    { id: 'breathing', name: 'Cohérence Cardiaque', icon: '🫁', trackId: 'minutes', baseAmount: 5, stat: 'intelligence', desc: '5s inspire, 5s expire.' }
  ]
}

const MODIFIERS = {
  strength: [
    { id: 'normal', name: '', xpMult: 1, diffMult: 1 },
    { id: 'slow', name: 'Lentes (Tempo 3-1-3)', xpMult: 1.5, diffMult: 0.6 },
    { id: 'explosive', name: 'Explosives', xpMult: 1.4, diffMult: 0.8 },
    { id: 'pause', name: 'avec Pause (2s en bas)', xpMult: 1.3, diffMult: 0.7 },
    { id: 'diamond', name: 'Diamant / Serrées', xpMult: 1.5, diffMult: 0.7 },
    { id: 'wide', name: 'Prise Large', xpMult: 1.2, diffMult: 0.9 },
  ],
  cardio: [
    { id: 'normal', name: '', xpMult: 1, diffMult: 1 },
    { id: 'hiit', name: 'en HIIT (30s on/15s off)', xpMult: 1.5, diffMult: 0.8 },
    { id: 'sprint', name: 'Sprint', xpMult: 1.6, diffMult: 0.5 },
    { id: 'hill', name: 'en Montée (Escaliers/Côte)', xpMult: 1.4, diffMult: 0.7 },
  ],
  endurance: [
    { id: 'normal', name: '', xpMult: 1, diffMult: 1 },
    { id: 'one_leg', name: 'sur 1 Jambe / 1 Bras', xpMult: 1.5, diffMult: 0.5 },
  ],
  flexibility: [{ id: 'normal', name: '', xpMult: 1, diffMult: 1 }],
  mind: [{ id: 'normal', name: '', xpMult: 1, diffMult: 1 }]
}

const FORMATS = [
  { id: 'straight', name: '{amount} {unit}', calc: (amt) => amt },
  { id: 'sets', name: '3 séries de {amount} {unit}', calc: (amt) => Math.floor(amt / 3) },
  { id: 'emom', name: 'EMOM (Chaque minute) : {amount} {unit}', calc: (amt) => Math.floor(amt / 5) },
  { id: 'max_time', name: 'MAX en 2 minutes', calc: (amt) => amt * 1.5 },
]

// ── Multipliers per rank ────────
const RANK_MULTIPLIERS = {
  E: { xp: 1.0, gold: 1.0, diff: 1.0 },
  D: { xp: 1.3, gold: 1.3, diff: 1.5 },
  C: { xp: 1.7, gold: 1.7, diff: 2.0 },
  B: { xp: 2.2, gold: 2.2, diff: 3.0 },
  A: { xp: 3.0, gold: 3.0, diff: 4.5 },
  S: { xp: 4.0, gold: 4.0, diff: 6.0 },
}

// Pseudo-random generator based on seed
function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

export const generateExtraQuests = (rank, seedNum) => {
  const mult = RANK_MULTIPLIERS[rank] || RANK_MULTIPLIERS['E']
  const rand = sfc32(seedNum, seedNum * 2, seedNum * 3, seedNum * 4)

  const quests = []
  const categories = Object.keys(EXERCISES)

  // Generate 20 random quests for the day pool
  for (let i = 0; i < 20; i++) {
    // 1. Pick category
    const cat = categories[Math.floor(rand() * categories.length)]
    const exList = EXERCISES[cat]
    
    // 2. Pick exercise
    const ex = exList[Math.floor(rand() * exList.length)]
    
    // 3. Pick modifier
    const modList = MODIFIERS[cat] || MODIFIERS.mind
    const mod = modList[Math.floor(rand() * modList.length)]
    
    // 4. Pick format (only for strength/cardio with unit reps/distance)
    let format = FORMATS[0]
    if ((cat === 'strength' || cat === 'cardio') && ex.trackId !== 'minutes' && ex.trackId !== 'seconds') {
      format = FORMATS[Math.floor(rand() * FORMATS.length)]
    }

    // 5. Calculate difficulty and rewards
    const targetAmount = Math.max(1, Math.round(ex.baseAmount * mult.diff * mod.diffMult))
    const formattedAmount = Math.max(1, Math.round(format.calc(targetAmount)))
    
    let unit = ''
    if (ex.trackId === 'seconds') unit = 'sec'
    if (ex.trackId === 'minutes') unit = 'min'
    if (ex.trackId === 'distance_m') unit = 'mètres'
    
    let titleStr = format.name.replace('{amount}', formattedAmount).replace('{unit}', unit).trim()
    if (format.id === 'max_time') titleStr = format.name

    const finalTitle = `${ex.name} ${mod.name} — ${titleStr}`.trim()
    const finalDesc = ex.desc

    const xpBase = 30
    const finalXp = Math.round(xpBase * mult.xp * mod.xpMult * (format.id === 'max_time' ? 1.2 : 1))
    const finalGold = Math.round(finalXp * 0.3)

    // Calculate absolute tracking total
    let trackingAmount = targetAmount
    if (format.id === 'max_time') trackingAmount = targetAmount // estimate
    
    quests.push({
      id: `proc_${rank}_${seedNum}_${i}`,
      title: finalTitle,
      description: finalDesc,
      icon: ex.icon,
      category: cat,
      xpReward: finalXp,
      goldReward: finalGold,
      statBonus: { [ex.stat]: Math.ceil(mult.xp) },
      duration: ex.trackId === 'seconds' ? trackingAmount : (ex.trackId === 'minutes' ? trackingAmount * 60 : null),
      tracking: {
        id: ex.trackId,
        amount: trackingAmount
      }
    })
  }

  return quests
}
