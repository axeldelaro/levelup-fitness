import { motion, AnimatePresence } from 'framer-motion'

const TYPE_STYLES = {
  success: { border: 'border-neon-blue/40', bg: 'bg-neon-blue/10', icon: '✓', color: 'text-neon-blue' },
  error:   { border: 'border-red-500/40',   bg: 'bg-red-500/10',   icon: '✕', color: 'text-red-400' },
  warning: { border: 'border-gold/40',       bg: 'bg-gold/10',       icon: '⚠', color: 'text-gold' },
  info:    { border: 'border-neon-purple/40',bg: 'bg-neon-purple/10',icon: 'ℹ', color: 'text-neon-purple' },
}

export default function NotificationToast({ notifications = [] }) {
  return (
    <div className="fixed top-4 left-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => {
          const s = TYPE_STYLES[notif.type] || TYPE_STYLES.info
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`glass-card ${s.border} ${s.bg} px-4 py-3 flex items-center gap-3`}
            >
              <span className={`font-orbitron text-sm ${s.color}`}>{s.icon}</span>
              <p className={`font-rajdhani text-sm font-semibold ${s.color}`}>{notif.message}</p>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
