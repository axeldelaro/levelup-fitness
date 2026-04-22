import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getDailyQuests, PENALTY_QUEST } from '../data/quests'
import { completeQuest, applyPenalty } from '../firebase/firestore'
import { useGameStore } from '../stores/gameStore'

export default function QuestsPage({ player, user }) {
  const [quests, setQuests] = useState([])
  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem(`quests_${new Date().toDateString()}`)
    return saved ? JSON.parse(saved) : []
  })
  const [activeTimer, setActiveTimer] = useState(null)
  const [timerSecs, setTimerSecs] = useState(0)
  const { addNotification } = useGameStore()

  useEffect(() => {
    setQuests(getDailyQuests(player.rank))
  }, [])

  // Check penalty (missed yesterday)
  const hasPenalty = (() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const key = `quests_${yesterday.toDateString()}`
    const yd = localStorage.getItem(key)
    if (!yd) return false
    const done = JSON.parse(yd)
    const total = getDailyQuests(player.rank, yesterday).length
    return done.length < total
  })()

  const handleComplete = async (quest) => {
    if (completed.includes(quest.id) || !player) return

    try {
      const result = await completeQuest(user.uid, quest, player)
      const newCompleted = [...completed, quest.id]
      setCompleted(newCompleted)
      localStorage.setItem(`quests_${new Date().toDateString()}`, JSON.stringify(newCompleted))

      // Vibrate on success
      if (navigator.vibrate) navigator.vibrate([100, 50, 100])

      addNotification({
        type: 'success',
        message: `+${quest.xpReward} XP, +${quest.goldReward} 🪙 — Quête accomplie !`
      })

      // Level up from quest
      if (result?.leveledUp) {
        useGameStore.getState().triggerLevelUp({ level: result.newLevel })
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400])
      }
    } catch (e) {
      addNotification({ type: 'error', message: 'Erreur de synchronisation' })
    }
  }

  const handlePenalty = async () => {
    if (!player) return
    await applyPenalty(user.uid, player)
    addNotification({ type: 'warning', message: '-20 XP — Pénalité appliquée. Ne recommence pas.' })
  }

  // Timer for timed quests
  useEffect(() => {
    if (activeTimer === null) return
    setTimerSecs(activeTimer.duration)
    const interval = setInterval(() => {
      setTimerSecs(s => {
        if (s <= 1) {
          clearInterval(interval)
          handleComplete(activeTimer)
          setActiveTimer(null)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [activeTimer])

  const allDone = quests.length > 0 && completed.length >= quests.length

  return (
    <div className="h-full overflow-y-auto scrollable px-4 pt-4 pb-2">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <p className="font-orbitron text-[10px] tracking-[0.3em] text-white/40">TABLEAU DES MISSIONS</p>
        <h2 className="font-orbitron text-2xl font-black text-white mt-1">Quêtes du Jour</h2>
        <p className="font-rajdhani text-white/40 text-sm mt-1">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </motion.div>

      {/* Penalty alert */}
      {hasPenalty && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-4 mb-4 border-red-500/40"
          style={{ boxShadow: '0 0 20px rgba(239,68,68,0.2)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">💀</span>
            <div>
              <p className="font-orbitron text-sm font-bold text-red-400">PÉNALITÉ SYSTÈME</p>
              <p className="font-rajdhani text-sm text-white/60">Tu as manqué tes quêtes hier. Conséquences en cours...</p>
            </div>
          </div>
          <div className="glass-card p-3 mb-3 border-red-500/20">
            <p className="font-orbitron text-xs text-white/60">⚠️ {PENALTY_QUEST.title}</p>
            <p className="font-rajdhani text-sm text-white/80 mt-1">{PENALTY_QUEST.description}</p>
          </div>
          <button onClick={handlePenalty} className="w-full py-3 font-orbitron text-xs text-red-400 border border-red-500/30 bg-red-500/5 rounded-xl">
            ACCEPTER LA PÉNALITÉ (-20 XP)
          </button>
        </motion.div>
      )}

      {/* All done banner */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card-gold p-4 mb-4 text-center"
        >
          <p className="text-3xl mb-2">🏆</p>
          <p className="font-orbitron font-black text-gold text-lg">TOUTES LES QUÊTES ACCOMPLIES</p>
          <p className="font-rajdhani text-white/50 text-sm mt-1">Streak maintenu ! Reviens demain.</p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="glass-card p-3 mb-4 flex items-center gap-3">
        <div className="flex gap-1.5">
          {quests.map((q) => (
            <div key={q.id} className={`w-2 h-2 rounded-full transition-all duration-300 ${completed.includes(q.id) ? 'bg-neon-blue shadow-neon' : 'bg-white/20'}`} />
          ))}
        </div>
        <span className="font-orbitron text-xs text-white/50">
          {completed.length}/{quests.length} COMPLÉTÉES
        </span>
        {player && (
          <div className="ml-auto flex items-center gap-1">
            <span className="text-gold text-sm">🪙</span>
            <span className="font-orbitron text-xs text-gold">{player.gold}</span>
          </div>
        )}
      </div>

      {/* Active Timer */}
      <AnimatePresence>
        {activeTimer && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card-neon p-4 mb-4 text-center"
          >
            <p className="font-orbitron text-xs text-neon-blue/70 tracking-widest mb-2">TIMER ACTIF — {activeTimer.title}</p>
            <div className="font-orbitron text-5xl font-black text-neon-blue"
              style={{ textShadow: '0 0 30px rgba(0,212,255,0.8)' }}>
              {String(Math.floor(timerSecs / 60)).padStart(2, '0')}:{String(timerSecs % 60).padStart(2, '0')}
            </div>
            <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-neon-blue rounded-full"
                style={{ width: `${(timerSecs / activeTimer.duration) * 100}%` }}
              />
            </div>
            <button onClick={() => setActiveTimer(null)} className="mt-3 font-orbitron text-xs text-white/30">
              ANNULER
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quest Cards */}
      <div className="space-y-3 mb-4">
        {quests.map((quest, i) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            index={i}
            isDone={completed.includes(quest.id)}
            onComplete={handleComplete}
            onStartTimer={() => setActiveTimer(quest)}
            hasActiveTimer={!!activeTimer}
          />
        ))}
      </div>

      {/* Exercise Library hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-4 mb-4"
      >
        <p className="font-orbitron text-[10px] tracking-widest text-white/40 mb-3">BIBLIOTHÈQUE D'EXERCICES</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Cardio', icon: '🏃', count: 12 },
            { label: 'Musculation', icon: '💪', count: 18 },
            { label: 'Souplesse', icon: '🧘', count: 8 },
            { label: 'Mixte', icon: '🔥', count: 10 },
          ].map(cat => (
            <div key={cat.label} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
              <span className="text-lg">{cat.icon}</span>
              <div>
                <p className="font-rajdhani text-white/80 text-sm font-semibold">{cat.label}</p>
                <p className="font-orbitron text-[10px] text-white/30">{cat.count} exercices</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function QuestCard({ quest, index, isDone, onComplete, onStartTimer, hasActiveTimer }) {
  const categoryColors = {
    strength: '#00d4ff', cardio: '#f59e0b', endurance: '#7c3aed',
    flexibility: '#22c55e', mind: '#ec4899'
  }
  const color = categoryColors[quest.category] || '#00d4ff'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`glass-card p-4 transition-all duration-300 ${isDone ? 'opacity-50' : ''}`}
      style={{ borderColor: isDone ? 'rgba(255,255,255,0.05)' : `${color}30` }}
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
          style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
          {isDone ? '✅' : quest.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className={`font-orbitron text-sm font-bold ${isDone ? 'line-through text-white/30' : 'text-white'}`}>
              {quest.title}
            </h3>
            <span className="font-orbitron text-[9px] px-1.5 py-0.5 rounded-md"
              style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
              {quest.category}
            </span>
          </div>
          <p className="font-rajdhani text-sm text-white/50 mb-2">{quest.description}</p>

          <div className="flex items-center gap-3">
            <span className="font-orbitron text-xs text-neon-blue">+{quest.xpReward} XP</span>
            <span className="font-orbitron text-xs text-gold">+{quest.goldReward} 🪙</span>
            {quest.statBonus && Object.entries(quest.statBonus).map(([stat, val]) => (
              <span key={stat} className="font-orbitron text-xs text-neon-purple">+{val} {stat.slice(0, 3).toUpperCase()}</span>
            ))}
          </div>
        </div>
      </div>

      {!isDone && (
        <div className="mt-3 flex gap-2">
          {quest.duration && (
            <button
              onClick={() => onStartTimer(quest)}
              disabled={hasActiveTimer}
              className="flex-1 py-2.5 font-orbitron text-xs rounded-xl border border-white/10 text-white/40 hover:border-neon-purple/30 hover:text-neon-purple transition-all disabled:opacity-30"
            >
              ⏱ TIMER {Math.floor(quest.duration / 60)}MIN
            </button>
          )}
          <button
            onClick={() => onComplete(quest)}
            className="flex-1 py-2.5 font-orbitron text-xs font-bold rounded-xl transition-all active:scale-95"
            style={{ color, backgroundColor: `${color}10`, border: `1px solid ${color}40` }}
          >
            ✓ VALIDER
          </button>
        </div>
      )}
    </motion.div>
  )
}
