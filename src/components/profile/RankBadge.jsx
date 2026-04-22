import { getRankConfig } from '../../data/rpg'
import { motion } from 'framer-motion'

export default function RankBadge({ rank = 'E', size = 'md', animated = true }) {
  const cfg = getRankConfig(rank)

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-20 h-20 text-3xl',
    xl: 'w-28 h-28 text-5xl',
  }

  return (
    <motion.div
      className={`${sizes[size]} rounded-xl border-2 flex items-center justify-center font-orbitron font-black relative overflow-hidden`}
      style={{ borderColor: cfg.color, color: cfg.color, backgroundColor: `${cfg.color}15`, boxShadow: `0 0 20px ${cfg.glow}, inset 0 1px 0 ${cfg.color}30` }}
      animate={animated ? { boxShadow: [`0 0 10px ${cfg.glow}`, `0 0 30px ${cfg.glow}`, `0 0 10px ${cfg.glow}`] } : {}}
      transition={animated ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      {/* Inner glow */}
      <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at center, ${cfg.color}, transparent 70%)` }} />
      <span className="relative z-10">{rank}</span>
    </motion.div>
  )
}
