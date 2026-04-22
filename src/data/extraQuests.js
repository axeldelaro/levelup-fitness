// ============================================================
// Extra quests — generated programmatically for originality
// ============================================================

const CARDIO_QUESTS = [
  { title: 'Sprint 5×30s', desc: '5 sprints de 30 secondes avec 30s de repos. Pousse tes limites.', icon: '⚡', cat: 'cardio', xp: 45, gold: 12, stat: { agility: 1 }, dur: null },
  { title: 'Saut à la corde 3 min', desc: 'Corde à sauter non-stop. Coordination et cardio au max.', icon: '🪢', cat: 'cardio', xp: 40, gold: 11, stat: { agility: 1 }, dur: 180 },
  { title: 'Course en côte', desc: 'Trouve une pente et monte-la 5 fois de suite sans t\'arrêter.', icon: '⛰️', cat: 'cardio', xp: 55, gold: 15, stat: { endurance: 1 }, dur: null },
  { title: 'Marche rapide 20 min', desc: 'Marche à allure soutenue sans t\'arrêter. Bras en mouvement.', icon: '🚶', cat: 'cardio', xp: 35, gold: 10, stat: { vitality: 1 }, dur: 1200 },
  { title: 'Jumping Jacks 100', desc: '100 sauts en étoile consécutifs. Pas de pause.', icon: '⭐', cat: 'cardio', xp: 38, gold: 10, stat: { agility: 1 }, dur: null },
  { title: 'Vélo 10 km', desc: 'À vélo ou en salle, couvre 10 km. Rythme constant.', icon: '🚴', cat: 'cardio', xp: 60, gold: 16, stat: { endurance: 1 }, dur: null },
  { title: 'Natation 15 min', desc: 'Enchaîne les longueurs pendant 15 minutes. Corps entier.', icon: '🏊', cat: 'cardio', xp: 65, gold: 18, stat: { vitality: 1 }, dur: 900 },
  { title: 'Danse freestyle 10 min', desc: 'Mets une playlist et bouge sans retenue 10 minutes.', icon: '💃', cat: 'cardio', xp: 35, gold: 9, stat: { agility: 1 }, dur: 600 },
  { title: 'High Knees 3×30', desc: 'Genoux hauts, 3 séries de 30 répétitions. Garde le dos droit.', icon: '🦵', cat: 'cardio', xp: 42, gold: 11, stat: { agility: 1 }, dur: null },
  { title: 'Boxe Sombre 5 min', desc: 'Shadowboxing non-stop. Jabs, crochets, uppercuts. Sens le rythme.', icon: '🥊', cat: 'cardio', xp: 50, gold: 14, stat: { strength: 1 }, dur: 300 },
  { title: 'Escaliers ×10', desc: 'Monte et descends un escalier 10 fois de suite.', icon: '🏗️', cat: 'cardio', xp: 48, gold: 13, stat: { endurance: 1 }, dur: null },
  { title: 'Burpees modifiés 20', desc: '20 Burpees sans saut — idéal pour débutants ou récupération.', icon: '🔄', cat: 'cardio', xp: 40, gold: 11, stat: { vitality: 1 }, dur: null },
  { title: 'Course 5 km', desc: 'Parcours 5 km à ton rythme. Respire régulièrement.', icon: '🏁', cat: 'cardio', xp: 70, gold: 20, stat: { endurance: 2 }, dur: null },
  { title: 'HIIT 7 min', desc: '7 exercices, 30s chacun, sans repos. Le minimum recommandé de la NASA.', icon: '🛸', cat: 'cardio', xp: 55, gold: 15, stat: { agility: 1 }, dur: 420 },
]

const STRENGTH_QUESTS = [
  { title: '30 Pompes strictes', desc: 'Poitrine au sol, coudes serrés. Pas de triche.', icon: '💪', cat: 'strength', xp: 45, gold: 12, stat: { strength: 1 }, dur: null },
  { title: '50 Squats lents', desc: 'Tempo 3-1-3 : descente 3s, tenu 1s, montée 3s. Intensité maximale.', icon: '🦾', cat: 'strength', xp: 48, gold: 13, stat: { strength: 1 }, dur: null },
  { title: 'Dips 3×12', desc: 'Dips sur chaise ou barres. Triceps, pectoraux, épaules.', icon: '🏋️', cat: 'strength', xp: 52, gold: 14, stat: { strength: 1 }, dur: null },
  { title: 'Fentes marchées 40', desc: '40 fentes alternées en marchant dans ta pièce.', icon: '🚀', cat: 'strength', xp: 44, gold: 12, stat: { strength: 1 }, dur: null },
  { title: '20 Pompes diamant', desc: 'Pouces et index en triangle. Charge maximale sur les triceps.', icon: '💎', cat: 'strength', xp: 55, gold: 15, stat: { strength: 2 }, dur: null },
  { title: 'Pike Push-ups 15', desc: 'Hanches hautes, tête vers le sol. Simulation du développé militaire.', icon: '🔺', cat: 'strength', xp: 50, gold: 14, stat: { strength: 1 }, dur: null },
  { title: 'Tractions 5', desc: 'Barre ou anneau. 5 tractions complètes, amplitude totale.', icon: '🤸', cat: 'strength', xp: 60, gold: 17, stat: { strength: 2 }, dur: null },
  { title: 'Crunchs 3×20', desc: '60 crunchs avec pause d\'une seconde en haut. Abs en feu.', icon: '🔥', cat: 'strength', xp: 38, gold: 10, stat: { strength: 1 }, dur: null },
  { title: 'Superman 3×15', desc: 'Allongé face au sol, lève bras et jambes simultanément.', icon: '🦸', cat: 'strength', xp: 36, gold: 9, stat: { vitality: 1 }, dur: null },
  { title: 'Squat Bulgare 10/côté', desc: 'Pied arrière sur une chaise, squat profond. Équilibre et force.', icon: '🇧🇬', cat: 'strength', xp: 58, gold: 16, stat: { strength: 2 }, dur: null },
  { title: 'Pompes Decline 15', desc: 'Pieds sur une chaise, pompes inclinées. Prise sur haut-pectoraux.', icon: '📐', cat: 'strength', xp: 52, gold: 14, stat: { strength: 1 }, dur: null },
  { title: 'Bear Crawl 2 min', desc: 'Marche à 4 pattes en gardant les genoux à 5cm du sol.', icon: '🐻', cat: 'strength', xp: 50, gold: 13, stat: { strength: 1 }, dur: 120 },
  { title: 'L-sit 3×10s', desc: 'Soulève ton corps sur deux chaises, jambes tendues. Force du core.', icon: '⚗️', cat: 'strength', xp: 65, gold: 18, stat: { strength: 2 }, dur: null },
  { title: 'Push-up lent 10', desc: '5s de descente, 1s en bas, 5s de montée. 10 répétitions max.', icon: '🐢', cat: 'strength', xp: 60, gold: 16, stat: { strength: 2 }, dur: null },
]

const ENDURANCE_QUESTS = [
  { title: 'Gainage latéral 2×45s', desc: '45 secondes par côté. Hanche bien levée, corps aligné.', icon: '🧲', cat: 'endurance', xp: 42, gold: 11, stat: { endurance: 1 }, dur: 90 },
  { title: 'Chaise 90s', desc: 'Dos au mur, cuisses parallèles. 90 secondes sans bouger.', icon: '🪑', cat: 'endurance', xp: 45, gold: 12, stat: { endurance: 1 }, dur: 90 },
  { title: 'Gainage alterné 3×30s', desc: 'Alterne bras et jambe opposés. 30s chaque côté, 3 séries.', icon: '🔁', cat: 'endurance', xp: 48, gold: 13, stat: { endurance: 1 }, dur: 180 },
  { title: 'Respiration Wim Hof', desc: '3 cycles de 30 respirations profondes + rétention. Focus mental.', icon: '🌬️', cat: 'endurance', xp: 40, gold: 11, stat: { vitality: 1 }, dur: 300 },
  { title: 'Walking Plank 10', desc: '10 transitions de planche basse à haute. Gainage dynamique.', icon: '🌊', cat: 'endurance', xp: 46, gold: 12, stat: { endurance: 1 }, dur: null },
  { title: 'Dead Hang 30s', desc: 'Suspendu à une barre, mains ouvertes, tiens 30 secondes.', icon: '🧲', cat: 'endurance', xp: 40, gold: 11, stat: { vitality: 1 }, dur: 30 },
  { title: 'Gainage dynamique 4 min', desc: 'Alterne planche, gainage latéral, gainage reverse. 1 min chaque.', icon: '⚙️', cat: 'endurance', xp: 55, gold: 15, stat: { endurance: 2 }, dur: 240 },
  { title: 'Souffle de la Baleine', desc: 'Nage 4 longueurs en retenant ta respiration 1 largeur sur 2.', icon: '🐋', cat: 'endurance', xp: 60, gold: 16, stat: { vitality: 1 }, dur: null },
]

const FLEXIBILITY_QUESTS = [
  { title: 'Yoga Salutation au Soleil', desc: '5 cycles complets de salutation au soleil. Respiration synchronisée.', icon: '☀️', cat: 'flexibility', xp: 44, gold: 12, stat: { vitality: 1 }, dur: 300 },
  { title: 'Grand écart progressif', desc: '3 minutes de travail au sol pour améliorer ton grand écart.', icon: '🤸', cat: 'flexibility', xp: 38, gold: 10, stat: { vitality: 1 }, dur: 180 },
  { title: 'Posture du Chat/Vache 3 min', desc: 'Alterne cat-cow en synchronisant avec ta respiration.', icon: '🐈', cat: 'flexibility', xp: 32, gold: 9, stat: { vitality: 1 }, dur: 180 },
  { title: 'Hip Circles 2×20', desc: 'Rotation des hanches dans les deux sens. Mobilité articulaire.', icon: '🔮', cat: 'flexibility', xp: 30, gold: 8, stat: { agility: 1 }, dur: null },
  { title: 'Étirements du cou 5 min', desc: 'Penche, tourne, étire lentement dans chaque direction.', icon: '🦒', cat: 'flexibility', xp: 28, gold: 7, stat: { vitality: 1 }, dur: 300 },
  { title: 'Fente profonde 2 min', desc: 'Reste en fente profonde, genou au sol, poitrine haute.', icon: '🧎', cat: 'flexibility', xp: 35, gold: 9, stat: { vitality: 1 }, dur: 120 },
  { title: 'Mobilité épaules 5 min', desc: 'Cercles, étirements croisés, rotation interne/externe.', icon: '🌀', cat: 'flexibility', xp: 33, gold: 9, stat: { vitality: 1 }, dur: 300 },
  { title: 'Posture Pigeon 2 min/côté', desc: 'Yoga Pigeon : ouvre les hanches, 2 minutes par côté.', icon: '🕊️', cat: 'flexibility', xp: 40, gold: 11, stat: { vitality: 2 }, dur: 240 },
]

const MIND_QUESTS = [
  { title: 'Méditation Pleine Conscience 10 min', desc: 'Observe tes pensées sans les juger. Corps immobile, esprit actif.', icon: '🧘', cat: 'mind', xp: 45, gold: 12, stat: { intelligence: 1 }, dur: 600 },
  { title: 'Journal de Gratitude', desc: 'Écris 3 choses pour lesquelles tu es reconnaissant aujourd\'hui.', icon: '📓', cat: 'mind', xp: 30, gold: 8, stat: { intelligence: 1 }, dur: null },
  { title: 'Visualisation de réussite 5 min', desc: 'Ferme les yeux, visualise ton objectif accompli dans tous ses détails.', icon: '🔭', cat: 'mind', xp: 38, gold: 10, stat: { intelligence: 1 }, dur: 300 },
  { title: 'Lecture 20 min', desc: 'Lis un livre en lien avec ta santé, ta psychologie ou tes objectifs.', icon: '📚', cat: 'mind', xp: 35, gold: 9, stat: { intelligence: 1 }, dur: 1200 },
  { title: 'Bilan de la journée', desc: 'Écris ce que tu as bien fait et ce que tu peux améliorer demain.', icon: '🗓️', cat: 'mind', xp: 28, gold: 7, stat: { intelligence: 1 }, dur: null },
  { title: 'Cold Shower 2 min', desc: 'Douche froide pendant 2 minutes. Endurance mentale pure.', icon: '🧊', cat: 'mind', xp: 55, gold: 15, stat: { vitality: 1 }, dur: 120 },
  { title: 'Affirmations matinales', desc: 'Dis à voix haute 5 affirmations positives sur toi-même.', icon: '📣', cat: 'mind', xp: 25, gold: 6, stat: { intelligence: 1 }, dur: null },
  { title: 'Aucun écran 1 heure', desc: 'Passe 1 heure sans téléphone ni écran. Reconnecte-toi à la réalité.', icon: '📵', cat: 'mind', xp: 40, gold: 11, stat: { intelligence: 1 }, dur: null },
  { title: 'Cohérence cardiaque 5 min', desc: 'Inspire 5s, expire 5s. Répète pendant 5 minutes. Stress zéro.', icon: '💗', cat: 'mind', xp: 38, gold: 10, stat: { vitality: 1 }, dur: 300 },
  { title: 'Marche en pleine conscience', desc: 'Marche 15 min sans téléphone. Observe uniquement ce qui t\'entoure.', icon: '🌿', cat: 'mind', xp: 42, gold: 11, stat: { intelligence: 1 }, dur: 900 },
]

// ── Multipliers per rank (scale difficulty / rewards) ────────
const RANK_MULTIPLIERS = {
  E: { xp: 1.0,  gold: 1.0,  reps: 1.0  },
  D: { xp: 1.3,  gold: 1.3,  reps: 1.2  },
  C: { xp: 1.7,  gold: 1.7,  reps: 1.5  },
  B: { xp: 2.2,  gold: 2.2,  reps: 1.8  },
  A: { xp: 3.0,  gold: 3.0,  reps: 2.2  },
  S: { xp: 4.0,  gold: 4.0,  reps: 3.0  },
}

const ALL_EXTRA = [...CARDIO_QUESTS, ...STRENGTH_QUESTS, ...ENDURANCE_QUESTS, ...FLEXIBILITY_QUESTS, ...MIND_QUESTS]

export const generateExtraQuests = (rank) => {
  const mult = RANK_MULTIPLIERS[rank] || RANK_MULTIPLIERS['E']
  return ALL_EXTRA.map((q, i) => ({
    id: `qx_${rank}_${i}`,
    title: q.title,
    description: q.desc,
    icon: q.icon,
    category: q.cat,
    xpReward: Math.round(q.xp * mult.xp),
    goldReward: Math.round(q.gold * mult.gold),
    statBonus: q.stat,
    duration: q.dur,
  }))
}
