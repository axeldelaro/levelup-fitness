import { motion } from 'framer-motion'
import { signOut } from '../firebase/auth'
import { useGameStore } from '../stores/gameStore'
import { getRankConfig, RANKS } from '../data/rpg'

const STAT_ICONS = {
  strength: { icon: '⚡', label: 'Force', color: '#00d4ff' },
  agility:  { icon: '💨', label: 'Agilité', color: '#7c3aed' },
  endurance:{ icon: '🔥', label: 'Endurance', color: '#f59e0b' },
  vitality: { icon: '💚', label: 'Vitalité', color: '#22c55e' },
  intelligence: { icon: '🔮', label: 'Intelligence', color: '#ec4899' },
}

export default function ProfilePage({ player, user }) {
  const { addNotification } = useGameStore()

  const handleSignOut = async () => {
    await signOut()
    addNotification({ type: 'info', message: 'Déconnexion réussie. À bientôt, Chasseur.' })
  }

  if (!player) return null

  const rankCfg = getRankConfig(player.rank)
  const rankIdx = RANKS.findIndex(r => r.id === player.rank)
  const joinDate = player.createdAt?.toDate?.() || new Date()
  const daysActive = Math.max(1, Math.round((Date.now() - joinDate.getTime()) / 86400000))
  const questPerDay = player.questsCompleted > 0 ? (player.questsCompleted / daysActive).toFixed(1) : '0'
  const stepHistory = player.stepHistory || []
  const maxHistorySteps = Math.max(...stepHistory.map(h => h.steps), 1)

  return (
    <div className="h-full overflow-y-auto scrollable px-4 pt-4 pb-2">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${rankCfg.color}15, transparent 70%)` }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <p className="font-orbitron text-[10px] tracking-[0.3em] text-white/40">DOSSIER CHASSEUR</p>
        <h2 className="font-orbitron text-2xl font-black text-white mt-1">Profil</h2>
      </motion.div>

      {/* Identity Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 mb-4 relative overflow-hidden"
        style={{ borderColor: `${rankCfg.color}40`, boxShadow: `0 0 30px ${rankCfg.color}15` }}
      >
        <div className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle at top right, ${rankCfg.color}, transparent)` }} />

        <div className="flex items-center gap-4 mb-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-orbitron text-2xl font-black flex-shrink-0"
            style={{ background: `${rankCfg.color}20`, border: `2px solid ${rankCfg.color}50`, boxShadow: `0 0 20px ${rankCfg.color}30`, color: rankCfg.color }}>
            {player.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="font-orbitron font-black text-lg text-white">{player.username}</h3>
            <p className="font-rajdhani text-sm" style={{ color: rankCfg.color }}>{player.title || 'Chasseur Débutant'}</p>
            <p className="font-orbitron text-xs text-white/30 mt-0.5">NIVEAU {player.level} · RANG {player.rank}</p>
          </div>
        </div>

        {/* Rank progress bar */}
        <div className="mb-1 flex items-center justify-between">
          <span className="font-orbitron text-[10px] text-white/40">PROGRESSION DE RANG</span>
          <span className="font-orbitron text-[10px]" style={{ color: rankCfg.color }}>
            {player.rankXP.toLocaleString()} / {player.rankXPToNext.toLocaleString()} XP
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: rankCfg.color }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (player.rankXP / player.rankXPToNext) * 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="font-rajdhani text-xs text-white/30 mt-1 text-right">
          {player.rankXPToNext - player.rankXP > 0
            ? `${(player.rankXPToNext - player.rankXP).toLocaleString()} XP pour Rang ${RANKS[rankIdx + 1]?.id || 'MAX'}`
            : '🏆 Rang maximum atteint !'}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="glass-card p-4 mb-4">
        <p className="font-orbitron text-[10px] tracking-widest text-white/40 mb-3">ATTRIBUTS DU CHASSEUR</p>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(player.stats || {}).map(([key, val]) => {
            const s = STAT_ICONS[key]
            if (!s) return null
            return (
              <div key={key} className="flex flex-col items-center gap-1.5 bg-white/5 rounded-xl p-2">
                <span className="text-xl">{s.icon}</span>
                <span className="font-orbitron text-base font-black" style={{ color: s.color }}>{val}</span>
                <span className="font-orbitron text-[8px] text-white/30">{s.label.slice(0, 3).toUpperCase()}</span>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'QUÊTES', value: player.questsCompleted || 0, icon: '⚔️', sub: `${questPerDay}/jour` },
          { label: 'PAS TOTAUX', value: (player.totalSteps || 0).toLocaleString(), icon: '👟', sub: 'cumulés' },
          { label: 'JOURS ACTIFS', value: daysActive, icon: '📅', sub: 'depuis le début' },
          { label: 'OR GAGNÉ', value: player.gold?.toLocaleString() || 0, icon: '🪙', sub: 'disponible' },
        ].map(({ label, value, icon, sub }) => (
          <div key={label} className="glass-card p-3">
            <span className="text-2xl">{icon}</span>
            <p className="font-orbitron text-xl font-black text-white mt-1">{value}</p>
            <p className="font-orbitron text-[9px] text-white/30">{label}</p>
            <p className="font-rajdhani text-xs text-white/20">{sub}</p>
          </div>
        ))}
      </motion.div>

      {/* Step History Chart */}
      {stepHistory.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="glass-card p-4 mb-4">
          <p className="font-orbitron text-[10px] tracking-widest text-white/40 mb-3">
            HISTORIQUE DE PAS — 7 DERNIERS JOURS
          </p>
          <div className="flex items-end gap-1.5 h-20">
            {stepHistory.map((day, i) => {
              const pct = Math.max(4, (day.steps / maxHistorySteps) * 100)
              const isGoal = day.steps >= 10000
              const label = new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end" style={{ height: '64px' }}>
                    <motion.div
                      className="w-full rounded-t-md"
                      style={{ background: isGoal ? '#22c55e' : '#7c3aed80', height: `${pct}%` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                    />
                  </div>
                  <span className="font-orbitron text-[8px] text-white/30">{label}</span>
                </div>
              )
            })}
          </div>
          <p className="font-rajdhani text-xs text-white/20 mt-2">
            🟢 Vert = objectif 10k atteint
          </p>
        </motion.div>
      )}

      {/* Account */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        className="glass-card p-4 mb-4">
        <p className="font-orbitron text-[10px] tracking-widest text-white/40 mb-3">COMPTE</p>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="font-orbitron text-[10px] text-white/40">EMAIL</span>
            <span className="font-rajdhani text-sm text-white/70">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="font-orbitron text-[10px] text-white/40">VERSION</span>
            <span className="font-orbitron text-[10px] text-white/40">1.1.0</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-orbitron text-[10px] text-white/40">PÉNALITÉS</span>
            <span className="font-orbitron text-[10px] text-red-400/70">{player.penalties || 0}</span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full py-3 font-orbitron text-xs font-bold text-red-400 border border-red-500/30 bg-red-500/5 rounded-xl hover:bg-red-500/10 transition-all active:scale-95"
        >
          ⚠️ SE DÉCONNECTER
        </button>
      </motion.div>
    </div>
  )
}
