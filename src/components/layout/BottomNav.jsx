import { useGameStore } from '../../stores/gameStore'
import { motion } from 'framer-motion'

const TABS = [
  { id: 'dashboard', icon: '◈', label: 'Dashboard' },
  { id: 'quests',    icon: '⚔', label: 'Quêtes' },
  { id: 'inventory', icon: '⬡', label: 'Arsenal' },
  { id: 'profile',   icon: '◎', label: 'Profil' },
]

export default function BottomNav({ player }) {
  const { activeTab, setActiveTab } = useGameStore()

  return (
    <div className="pb-safe relative z-20">
      <div className="h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
      <div className="bg-bg/90 backdrop-blur-xl px-2 pt-2 pb-2">
        <div className="flex items-center justify-around">
          {TABS.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 flex-1"
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-neon-blue/10 rounded-xl border border-neon-blue/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative text-xl transition-all duration-300 ${active ? 'text-neon-blue' : 'text-white/30'}`}
                  style={active ? { filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.8))' } : {}}>
                  {tab.icon}
                </span>
                <span className={`relative font-orbitron text-[10px] tracking-wider transition-colors duration-300 ${active ? 'text-neon-blue' : 'text-white/25'}`}>
                  {tab.label.toUpperCase()}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
