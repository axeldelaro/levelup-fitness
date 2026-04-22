import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import RankBadge from '../components/profile/RankBadge'
import XPBar from '../components/profile/XPBar'
import StatsRadar from '../components/profile/StatsRadar'
import { getRankConfig, getNextRank, BOSS_WORKOUTS } from '../data/rpg'
import { useGameStore } from '../stores/gameStore'
import { signOut } from '../firebase/auth'
import StepEntryModal from '../components/ui/StepEntryModal'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useStepNotifications } from '../hooks/useStepNotifications'

const STAT_ICONS = {
  strength: '⚡', agility: '💨', endurance: '🔥', vitality: '💚', intelligence: '🔮'
}

export default function DashboardPage({ player, user }) {
  const { triggerBoss, addNotification } = useGameStore()
  
  const [showStats, setShowStats] = useState(true)
  const [showStepModal, setShowStepModal] = useState(false)
  const [notifDismissed, setNotifDismissed] = useState(localStorage.getItem('notifPromptDismissed') === 'true')
  const [notifPermission, setNotifPermission] = useState('Notification' in window ? Notification.permission : 'denied')
  
  const { requestPermissionAndStart } = useStepNotifications()

  useEffect(() => {
    const handleOpenModal = () => setShowStepModal(true)
    window.addEventListener('openStepEntry', handleOpenModal)
    return () => window.removeEventListener('openStepEntry', handleOpenModal)
  }, [])

  const handleEnableNotifs = async () => {
    const success = await requestPermissionAndStart()
    if (success) {
      setNotifPermission('granted')
      localStorage.setItem('notifPromptDismissed', 'true')
      addNotification({ type: 'success', message: 'Rappels activés !' })
    } else {
      setNotifPermission('denied')
    }
  }

  const handleDismissNotifs = () => {
    setNotifDismissed(true)
    localStorage.setItem('notifPromptDismissed', 'true')
  }

  const handleManualStepSubmit = async (steps) => {
    if (!player || !user) return
    try {
      const diff = steps - (player.dailySteps || 0)
      if (diff === 0) return
      
      const newTotal = (player.totalSteps || 0) + diff
      
      await updateDoc(doc(db, 'players', user.uid), {
        dailySteps: steps,
        totalSteps: newTotal
      })
      addNotification({ type: 'success', message: 'Pas enregistrés avec succès !' })
    } catch (err) {
      console.error(err)
      addNotification({ type: 'error', message: 'Erreur lors de la sauvegarde.' })
    }
  }

  if (!player) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
      </div>
    )
  }

  const rankCfg = getRankConfig(player.rank)
  const nextRank = getNextRank(player.rank)
  const rankPct = Math.round((player.rankXP / player.rankXPToNext) * 100)
  const isBossReady = player.rankXP >= player.rankXPToNext
  const dailySteps = player.dailySteps || 0
  const stepGoal = 10000

  return (
    <div className="h-full overflow-y-auto scrollable px-4 pt-4 pb-2">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${rankCfg.color}15, transparent 70%)` }} />

      {/* ── HEADER HERO ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-neon p-4 mb-4 relative overflow-hidden"
      >
        {/* Corner decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 opacity-10"
          style={{ background: `radial-gradient(circle at top right, ${rankCfg.color}, transparent 70%)` }} />

        <div className="flex items-center gap-4">
          <RankBadge rank={player.rank} size="lg" />

          <div className="flex-1 min-w-0">
            <p className="font-orbitron text-[10px] tracking-[0.3em] text-white/40 mb-0.5">CHASSEUR</p>
            <h1 className="font-orbitron font-black text-xl text-white truncate" style={{ textShadow: `0 0 20px ${rankCfg.color}60` }}>
              {player.username}
            </h1>
            <p className="font-rajdhani text-sm" style={{ color: rankCfg.color }}>{player.title}</p>
          </div>

          <div className="text-right">
            <div className="font-orbitron text-2xl font-black text-neon-blue"
              style={{ textShadow: '0 0 20px rgba(0,212,255,0.8)' }}>
              LV.{player.level}
            </div>
            <div className="flex items-center gap-1 justify-end mt-1">
              <span className="text-gold text-sm">🪙</span>
              <span className="font-orbitron text-sm text-gold">{player.gold.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-4">
          <XPBar current={player.xp} max={player.xpToNext} label="XP NIVEAU" color="#00d4ff" />
        </div>

        {/* Streak */}
        {player.streak > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-orange-400 text-lg">🔥</span>
            <span className="font-orbitron text-xs text-orange-400">{player.streak} JOURS DE STREAK</span>
          </div>
        )}
      </motion.div>

      {/* ── RANG PROGRESSION ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 mb-4"
        style={{ borderColor: `${rankCfg.color}30` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-orbitron text-[10px] tracking-widest text-white/40">PROGRESSION DE RANG</p>
            <p className="font-orbitron text-base font-bold mt-0.5" style={{ color: rankCfg.color }}>
              {rankCfg.label} {nextRank ? `→ ${nextRank.label}` : '— MAX'}
            </p>
          </div>
          {isBossReady && BOSS_WORKOUTS[player.rank] && (
            <motion.button
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              onClick={() => useGameStore.getState().triggerBoss()}
              className="px-3 py-1.5 rounded-lg font-orbitron text-xs font-bold text-red-400 border border-red-500/50 bg-red-500/10"
              style={{ boxShadow: '0 0 15px rgba(239,68,68,0.3)' }}
            >
              ⚔️ BOSS DISPONIBLE
            </motion.button>
          )}
        </div>
        <XPBar
          current={player.rankXP}
          max={player.rankXPToNext}
          label={`RANG ${player.rank}`}
          color={rankCfg.color}
        />
      </motion.div>

      {/* ── STEPS WIDGET ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card-purple p-4 mb-4"
      >
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(124,58,237,0.2)" strokeWidth="2" />
              <motion.circle
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${Math.min(100, (dailySteps / stepGoal) * 100)} 100`}
                initial={{ strokeDasharray: '0 100' }}
                animate={{ strokeDasharray: `${Math.min(100, (dailySteps / stepGoal) * 100)} 100` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ filter: 'drop-shadow(0 0 4px rgba(124,58,237,0.8))' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg">🚶</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-orbitron text-[10px] tracking-widest text-white/40">QUÊTE DE MARCHE</p>
            </div>
            <p className="font-orbitron text-2xl font-black text-neon-purple mt-1">
              {dailySteps.toLocaleString()}
            </p>
            <p className="font-rajdhani text-sm text-white/40">
              / {stepGoal.toLocaleString()} pas — {Math.floor(dailySteps / 100)} XP gagnés
            </p>
          </div>

          <div className="text-right">
            <p className="font-orbitron text-xs text-white/40">AGILITÉ</p>
            <p className="font-orbitron text-lg font-bold text-neon-purple">+{Math.floor(dailySteps / 1000)}</p>
          </div>
        </div>

        {/* Manual entry button */}
        <div className="mt-3 pt-3 border-t border-white/5 flex justify-end">
          <button
            onClick={() => setShowStepModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors"
          >
            <span className="text-[10px]">📝</span>
            <span className="font-orbitron text-[9px] tracking-widest">SAISIE MANUELLE</span>
          </button>
        </div>

        {/* Notifications prompt */}
        {notifPermission === 'default' && !notifDismissed && (
          <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
            <button
              onClick={handleEnableNotifs}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-neon-blue/10 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/20 transition-colors"
            >
              <span>🔔</span>
              <span className="font-orbitron text-[10px] tracking-widest">ACTIVER LES RAPPELS</span>
            </button>
            <button
              onClick={handleDismissNotifs}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/30 hover:bg-white/10 transition-colors"
              title="Ne plus afficher"
            >
              ✕
            </button>
          </div>
        )}
      </motion.div>
      
      <StepEntryModal 
        isOpen={showStepModal} 
        onClose={() => setShowStepModal(false)} 
        onSubmit={handleManualStepSubmit}
        currentSteps={player.dailySteps || 0}
      />

      {/* ── STATS ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 mb-4"
      >
        <button
          onClick={() => setShowStats(s => !s)}
          className="w-full flex items-center justify-between mb-2"
        >
          <p className="font-orbitron text-[10px] tracking-widest text-white/40">STATISTIQUES RPG</p>
          <span className="text-white/30 text-xs font-orbitron">{showStats ? '▲' : '▼'}</span>
        </button>

        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <StatsRadar stats={player.stats} />

              <div className="grid grid-cols-5 gap-2 mt-2">
                {Object.entries(player.stats).map(([key, val]) => (
                  <div key={key} className="flex flex-col items-center gap-1 bg-white/5 rounded-lg p-2">
                    <span className="text-base">{STAT_ICONS[key]}</span>
                    <span className="font-orbitron text-sm font-bold text-neon-blue">{val}</span>
                    <span className="font-orbitron text-[8px] text-white/30 uppercase">{key.slice(0, 3)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── QUICK STATS ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-3 gap-3 mb-4"
      >
        {[
          { label: 'QUÊTES', value: player.questsCompleted, icon: '⚔️' },
          { label: 'PAS TOTAUX', value: (player.totalSteps || 0).toLocaleString(), icon: '👟' },
          { label: 'PÉNALITÉS', value: player.penalties || 0, icon: '💀' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="glass-card p-3 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="font-orbitron text-base font-bold text-white">{value}</div>
            <div className="font-orbitron text-[9px] text-white/30 mt-0.5">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* ── NEXT OBJECTIVE ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4 mb-4"
      >
        <p className="font-orbitron text-[10px] tracking-widest text-white/40 mb-3">PROCHAIN OBJECTIF</p>
        <div className="space-y-3">
          {/* XP to next level */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-rajdhani text-sm text-white/60">⚡ Niveau {player.level + 1}</span>
              <span className="font-orbitron text-xs text-neon-blue">
                {(player.xpToNext - player.xp).toLocaleString()} XP
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-neon-blue"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (player.xp / player.xpToNext) * 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
          {/* Steps to goal */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-rajdhani text-sm text-white/60">🚶 10 000 pas</span>
              <span className="font-orbitron text-xs text-neon-purple">
                {Math.max(0, 10000 - dailySteps).toLocaleString()} restants
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-neon-purple"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (dailySteps / 10000) * 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <BossModal player={player} />
    </div>
  )
}

// Boss Modal inline
function BossModal({ player }) {
  const { showBossModal, dismissBoss, addNotification } = useGameStore()
  const boss = BOSS_WORKOUTS[player?.rank]

  if (!showBossModal || !boss) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end"
        onClick={dismissBoss}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full p-4 pb-safe"
          onClick={e => e.stopPropagation()}
        >
          <div className="glass-card p-5 border-red-500/40 max-w-lg mx-auto"
            style={{ boxShadow: '0 0 40px rgba(239,68,68,0.3)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl animate-bounce">👹</div>
              <div>
                <p className="font-orbitron text-[10px] tracking-widest text-red-400">DONJON DE RANG {player.rank}</p>
                <h3 className="font-orbitron text-xl font-black text-white">{boss.name}</h3>
                <p className="font-rajdhani text-sm text-white/50">{boss.description}</p>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {boss.exercises.map((ex, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron text-xs text-red-400">R{i + 1}</span>
                    <span className="font-rajdhani text-white">{ex.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-orbitron text-xs text-white/60">{ex.reps}</span>
                    <span className="font-orbitron text-[10px] text-white/30">repos {ex.rest}</span>
                  </div>
                </div>
              ))}
              <p className="font-orbitron text-xs text-red-400/70 text-center mt-2">
                × {boss.rounds} ROUNDS — 15 MINUTES
              </p>
            </div>

            <div className="flex gap-2">
              <button onClick={dismissBoss} className="flex-1 py-3 font-orbitron text-xs text-white/40 border border-white/10 rounded-xl">
                PLUS TARD
              </button>
              <button
                onClick={() => {
                  dismissBoss()
                  addNotification({ type: 'success', message: `Boss lancé ! Bonne chance, Chasseur !` })
                }}
                className="flex-2 flex-1 py-3 font-orbitron text-xs font-bold text-red-400 border border-red-500/50 bg-red-500/10 rounded-xl"
                style={{ boxShadow: '0 0 20px rgba(239,68,68,0.2)' }}
              >
                ⚔️ AFFRONTER LE BOSS
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
