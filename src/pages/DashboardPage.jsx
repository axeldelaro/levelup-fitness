import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import RankBadge from '../components/profile/RankBadge'
import XPBar from '../components/profile/XPBar'
import StatsRadar from '../components/profile/StatsRadar'
import { getRankConfig, getNextRank, BOSS_WORKOUTS, RANKS } from '../data/rpg'
import { useGameStore } from '../stores/gameStore'
import { signOut } from '../firebase/auth'
import StepEntryModal from '../components/ui/StepEntryModal'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useStepNotifications } from '../hooks/useStepNotifications'

const STAT_ICONS = {
  strength: '⚡', agility: '💨', endurance: '🔥', vitality: '💚', intelligence: '🔮'
}

const TOTALS_LABELS = {
  pushups: 'Pompes', pullups: 'Tractions', squats: 'Squats', dips: 'Dips', 
  lunges: 'Fentes', crunches: 'Crunchs', distance_m: 'Mètres', jumps: 'Sauts', 
  burpees: 'Burpees', minutes: 'Minutes', seconds: 'Secondes', cycles: 'Cycles', pages: 'Pages'
}

export default function DashboardPage({ player, user }) {
  const { triggerBoss, addNotification } = useGameStore()
  
  const [activeTab, setActiveTab] = useState('progression') // progression | rpg | history
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

  const handleSignOut = async () => {
    await signOut()
    addNotification({ type: 'info', message: 'Déconnexion réussie. À bientôt, Chasseur.' })
  }

  if (!player) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
      </div>
    )
  }

  const rankCfg = getRankConfig(player.rank || 'E')
  const nextRank = getNextRank(player.rank || 'E')
  const isBossReady = (player.rankXP || 0) >= (player.rankXPToNext || 500)
  const dailySteps = player.dailySteps || 0
  const stepGoal = 10000

  // History calculation
  const stepHistory = player.stepHistory || []
  const maxHistorySteps = Math.max(...stepHistory.map(h => h.steps), 1)
  const totals = player.totals || {}

  return (
    <div className="h-full flex flex-col overflow-hidden px-3 pt-3 pb-1 relative">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${rankCfg.color}10, transparent 70%)` }} />

      {/* ── HEADER COMPACT ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-neon p-3 mb-2 flex items-center gap-3 relative shrink-0"
        style={{ borderColor: `${rankCfg.color}30` }}
      >
        <button onClick={handleSignOut} className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 text-[10px] border border-red-500/30">
          🚪
        </button>

        <div className="scale-75 origin-left">
          <RankBadge rank={player.rank || 'E'} />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2">
            <h1 className="font-orbitron font-black text-sm text-white truncate">{player.username}</h1>
            {player.streak > 0 && <span className="text-[10px]">🔥 {player.streak}</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-orbitron text-[10px] text-neon-blue font-bold">LV.{player.level}</span>
            <span className="font-orbitron text-[10px] text-gold">{player.gold?.toLocaleString() || 0} 🪙</span>
          </div>
        </div>
      </motion.div>

      {/* ── INNER TABS NAV ── */}
      <div className="flex gap-1.5 mb-2 shrink-0">
        {[
          { id: 'progression', label: 'Objectifs', icon: '🎯' },
          { id: 'rpg', label: 'Attributs', icon: '⚔️' },
          { id: 'history', label: 'Palmarès', icon: '🏆' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-1.5 rounded-lg font-orbitron text-[9px] transition-all flex flex-col items-center gap-0.5 ${
              activeTab === t.id ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30' : 'bg-white/5 text-white/40 border border-white/5'
            }`}
          >
            <span className="text-xs">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT (Flex 1, scrollable if needed but should fit) ── */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: PROGRESSION */}
          {activeTab === 'progression' && (
            <motion.div
              key="progression"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="absolute inset-0 flex flex-col gap-2"
            >
              <div className="glass-card p-3" style={{ borderColor: `${rankCfg.color}20` }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-orbitron text-[9px] text-white/50">RANG {rankCfg.label}</span>
                  {isBossReady ? (
                    <button onClick={() => useGameStore.getState().triggerBoss()} className="font-orbitron text-[9px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                      ⚔️ BOSS
                    </button>
                  ) : (
                    <span className="font-orbitron text-[9px]" style={{ color: rankCfg.color }}>
                      {(player.rankXPToNext - player.rankXP).toLocaleString()} XP
                    </span>
                  )}
                </div>
                <XPBar current={player.rankXP} max={player.rankXPToNext} label="" color={rankCfg.color} />
              </div>

              <div className="glass-card p-3 border-neon-blue/20">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-orbitron text-[9px] text-white/50">NIVEAU {player.level + 1}</span>
                  <span className="font-orbitron text-[9px] text-neon-blue">{(player.xpToNext - player.xp).toLocaleString()} XP</span>
                </div>
                <XPBar current={player.xp} max={player.xpToNext} label="" color="#00d4ff" />
              </div>

              <div className="glass-card p-3 border-neon-purple/20 flex-1 flex flex-col justify-center relative">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(124,58,237,0.2)" strokeWidth="2" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round"
                        strokeDasharray={`${Math.min(100, (dailySteps / stepGoal) * 100)} 100`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm">🚶</div>
                  </div>
                  <div className="flex-1">
                    <p className="font-orbitron text-[9px] text-white/40">MARCHE JOURNALIÈRE</p>
                    <p className="font-orbitron text-lg font-black text-neon-purple leading-tight">{dailySteps.toLocaleString()}</p>
                    <p className="font-rajdhani text-[10px] text-white/30">/ {stepGoal.toLocaleString()} pas</p>
                  </div>
                  <button onClick={() => setShowStepModal(true)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs border border-white/10">
                    📝
                  </button>
                </div>
              </div>

              {notifPermission === 'default' && !notifDismissed && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={handleEnableNotifs} className="flex-1 py-2 rounded-lg bg-neon-blue/10 border border-neon-blue/30 text-neon-blue font-orbitron text-[9px]">🔔 RAPPELS</button>
                  <button onClick={handleDismissNotifs} className="px-3 py-2 rounded-lg bg-white/5 text-white/30 text-[9px]">✕</button>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: RPG ATTRIBUTES */}
          {activeTab === 'rpg' && (
            <motion.div
              key="rpg"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="absolute inset-0 flex flex-col gap-2"
            >
              <div className="glass-card flex-1 flex flex-col p-2">
                <div className="flex-1 relative">
                  <StatsRadar stats={player.stats || {}} />
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1 shrink-0">
                {Object.entries(player.stats || {}).map(([key, val]) => (
                  <div key={key} className="flex flex-col items-center justify-center bg-white/5 rounded-lg py-1.5 border border-white/5">
                    <span className="text-sm mb-0.5">{STAT_ICONS[key]}</span>
                    <span className="font-orbitron text-[10px] font-bold text-white">{val}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: PALMARES & TOTALS */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="absolute inset-0 flex flex-col gap-2"
            >
              {/* Historique Graphique */}
              <div className="glass-card p-3 flex-shrink-0">
                <p className="font-orbitron text-[8px] tracking-widest text-white/40 mb-2">HISTORIQUE (7J)</p>
                <div className="flex items-end gap-1 h-14">
                  {stepHistory.length > 0 ? stepHistory.map((day, i) => {
                    const pct = Math.max(10, (day.steps / maxHistorySteps) * 100)
                    const isGoal = day.steps >= 10000
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                        <div className="w-full rounded-sm" style={{ background: isGoal ? '#22c55e' : '#7c3aed80', height: `${pct}%` }} />
                        <span className="font-orbitron text-[7px] text-white/30">{new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })[0]}</span>
                      </div>
                    )
                  }) : <p className="font-rajdhani text-xs text-white/30 mx-auto">Aucun historique</p>}
                </div>
              </div>

              {/* Totaux d'exercices */}
              <div className="glass-card p-3 flex-1 overflow-y-auto scrollable">
                <p className="font-orbitron text-[8px] tracking-widest text-white/40 mb-2">TOTAUX D'ENTRAÎNEMENT</p>
                {Object.keys(totals).length > 0 ? (
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(totals).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center bg-white/5 px-2 py-1.5 rounded-lg">
                        <span className="font-orbitron text-[9px] text-white/60">{TOTALS_LABELS[key] || key}</span>
                        <span className="font-orbitron text-[10px] font-bold text-neon-blue">{val.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="font-rajdhani text-[10px] text-white/20 text-center">Complète des quêtes pour<br/>enregistrer tes statistiques.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <StepEntryModal 
        isOpen={showStepModal} 
        onClose={() => setShowStepModal(false)} 
        onSubmit={handleManualStepSubmit}
        currentSteps={player.dailySteps || 0}
      />

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
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end"
        onClick={dismissBoss}
      >
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full p-4 pb-safe" onClick={e => e.stopPropagation()}
        >
          <div className="glass-card p-5 border-red-500/40 max-w-lg mx-auto" style={{ boxShadow: '0 0 40px rgba(239,68,68,0.3)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl animate-bounce">👹</div>
              <div>
                <p className="font-orbitron text-[10px] text-red-400">DONJON DE RANG {player.rank}</p>
                <h3 className="font-orbitron text-xl font-black text-white">{boss.name}</h3>
                <p className="font-rajdhani text-sm text-white/50">{boss.description}</p>
              </div>
            </div>
            <div className="space-y-2 mb-5">
              {boss.exercises.map((ex, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron text-xs text-red-400">R{i + 1}</span>
                    <span className="font-rajdhani text-white text-xs">{ex.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-orbitron text-xs text-white/60">{ex.reps}</span>
                    <span className="font-orbitron text-[10px] text-white/30">{ex.rest}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={dismissBoss} className="flex-1 py-3 font-orbitron text-xs text-white/40 border border-white/10 rounded-xl">PLUS TARD</button>
              <button onClick={() => { dismissBoss(); addNotification({ type: 'success', message: 'Boss lancé !' }) }} className="flex-1 py-3 font-orbitron text-[10px] font-bold text-red-400 bg-red-500/10 rounded-xl border border-red-500/50">⚔️ COMBATTRE</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
