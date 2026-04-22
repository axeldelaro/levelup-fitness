import { motion } from 'framer-motion'

export default function XPBar({ current, max, label = 'XP', color = '#00d4ff', showNumbers = true }) {
  const pct = Math.min(100, Math.round((current / Math.max(max, 1)) * 100))

  return (
    <div className="w-full">
      {showNumbers && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-orbitron text-xs tracking-widest text-white/50">{label}</span>
          <span className="font-orbitron text-xs" style={{ color }}>
            {current.toLocaleString()} / {max.toLocaleString()}
          </span>
        </div>
      )}
      <div className="relative h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
        {/* Track glow */}
        <div className="absolute inset-0 rounded-full" style={{ background: `${color}10` }} />

        {/* Fill */}
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {/* Shimmer on fill */}
        <motion.div
          className="absolute top-0 h-full w-16 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
          animate={{ left: ['-10%', '110%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
        />
      </div>

      <div className="flex justify-end mt-1">
        <span className="font-orbitron text-[10px] text-white/30">{pct}%</span>
      </div>
    </div>
  )
}
