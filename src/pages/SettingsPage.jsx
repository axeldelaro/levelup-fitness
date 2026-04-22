import { motion } from 'framer-motion'
import { signOut } from '../firebase/auth'
import { useGameStore } from '../stores/gameStore'

export default function SettingsPage({ player, user }) {
  const { addNotification } = useGameStore()

  const handleSignOut = async () => {
    await signOut()
    addNotification({ type: 'info', message: 'Déconnexion réussie. À bientôt, Chasseur.' })
  }

  return (
    <div className="h-full overflow-y-auto scrollable px-4 pt-4 pb-2">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <p className="font-orbitron text-[10px] tracking-[0.3em] text-white/40">PARAMÈTRES</p>
        <h2 className="font-orbitron text-2xl font-black text-white mt-1">Système</h2>
      </motion.div>

      {/* Account Info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="glass-card-neon p-4 mb-4">
        <p className="font-orbitron text-[10px] tracking-widest text-white/40 mb-3">COMPTE CHASSEUR</p>
        <div className="space-y-3">
          <InfoRow label="ID" value={user?.uid?.slice(0, 16) + '...'} />
          <InfoRow label="EMAIL" value={user?.email} />
          <InfoRow label="UTILISATEUR" value={player?.username} />
          <InfoRow label="RANG" value={player?.rank} colored />
          <InfoRow label="NIVEAU" value={`LV.${player?.level}`} />
          <InfoRow label="XP TOTAL" value={player?.xp?.toLocaleString()} />
        </div>
      </motion.div>

      {/* PWA Install */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="glass-card p-4 mb-4">
        <p className="font-orbitron text-[10px] tracking-widest text-white/40 mb-3">INSTALLATION PWA</p>
        <p className="font-rajdhani text-sm text-white/60 mb-3">
          Installe LevelUp Fitness sur ton écran d'accueil pour une expérience native.
        </p>
        <div className="space-y-2 text-sm font-rajdhani text-white/50">
          <p>📱 <span className="text-white/70">iOS :</span> Safari → Partager → Sur l'écran d'accueil</p>
          <p>🤖 <span className="text-white/70">Android :</span> Chrome → ⋮ → Ajouter à l'écran d'accueil</p>
        </div>
      </motion.div>

      {/* About */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="glass-card p-4 mb-4">
        <p className="font-orbitron text-[10px] tracking-widest text-white/40 mb-3">À PROPOS</p>
        <div className="space-y-2">
          <InfoRow label="VERSION" value="1.0.0" />
          <InfoRow label="THÈME" value="Solo Leveling RPG" />
          <InfoRow label="FIREBASE" value="sololeveling-a5b58" />
        </div>
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        className="glass-card p-4 mb-4 border-red-500/20">
        <p className="font-orbitron text-[10px] tracking-widest text-red-400/60 mb-3">ZONE DANGEREUSE</p>
        <button
          onClick={handleSignOut}
          className="w-full py-3.5 font-orbitron text-sm font-bold text-red-400 border border-red-500/30 bg-red-500/5 rounded-xl hover:bg-red-500/10 transition-all active:scale-95"
        >
          ⚠️ SE DÉCONNECTER
        </button>
      </motion.div>

      {/* Footer */}
      <p className="text-center font-orbitron text-[10px] text-white/15 mt-4">
        LEVELUP FITNESS © 2026 — RANG E → S
      </p>
    </div>
  )
}

function InfoRow({ label, value, colored }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="font-orbitron text-[10px] tracking-widest text-white/40">{label}</span>
      <span className={`font-orbitron text-xs font-bold ${colored ? 'text-neon-blue' : 'text-white/70'}`}>{value}</span>
    </div>
  )
}
