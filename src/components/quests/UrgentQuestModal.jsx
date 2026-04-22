import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'
import { useState, useEffect } from 'react'
import { completeQuest } from '../../firebase/firestore'

export default function UrgentQuestModal() {
  const { urgentQuest, dismissUrgentQuest, showUrgentQuest, addNotification } = useGameStore()
  const [timeLeft, setTimeLeft] = useState(urgentQuest?.timeLimit || 1800)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSecs, setTimerSecs] = useState(0)

  useEffect(() => {
    if (!showUrgentQuest || !urgentQuest) return
    setTimeLeft(urgentQuest.timeLimit)
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval)
          dismissUrgentQuest()
          addNotification({ type: 'error', message: '⚠️ Quête urgente expirée — Pénalité immédiate !' })
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [showUrgentQuest])

  if (!showUrgentQuest || !urgentQuest) return null

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const urgencyPct = (timeLeft / urgentQuest.timeLimit) * 100
  const isUrgent = urgencyPct < 30

  const handleAccept = () => {
    if (urgentQuest.duration) {
      setTimerRunning(true)
      setTimerSecs(urgentQuest.duration)
    } else {
      addNotification({ type: 'success', message: `+${urgentQuest.xpReward} XP — Quête urgente accomplie !` })
      dismissUrgentQuest()
    }
  }

  // Running timer
  useEffect(() => {
    if (!timerRunning) return
    const interval = setInterval(() => {
      setTimerSecs(s => {
        if (s <= 1) {
          clearInterval(interval)
          setTimerRunning(false)
          addNotification({ type: 'success', message: `+${urgentQuest.xpReward} XP — Mission urgente accomplie !` })
          dismissUrgentQuest()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timerRunning])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-full max-w-sm"
        >
          <div className="glass-card p-6 text-center border-red-500/50"
            style={{ boxShadow: '0 0 60px rgba(239,68,68,0.4), 0 0 120px rgba(239,68,68,0.1)' }}>
            
            {!timerRunning ? (
              <>
                {/* Alert header */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-5xl mb-4"
                >
                  {urgentQuest.icon}
                </motion.div>

                <div className="mb-2">
                  <p className="font-orbitron text-xs tracking-[0.3em] text-red-400 mb-1">
                    {urgentQuest.title}
                  </p>
                  <h3 className="font-orbitron text-xl font-black text-white">
                    {urgentQuest.subtitle}
                  </h3>
                </div>

                <p className="font-rajdhani text-sm text-white/60 mb-5">
                  {urgentQuest.description}
                </p>

                {/* Countdown */}
                <div className="mb-4">
                  <div className={`font-orbitron text-3xl font-black mb-2 ${isUrgent ? 'text-red-400' : 'text-white'}`}
                    style={isUrgent ? { textShadow: '0 0 20px rgba(239,68,68,0.8)' } : {}}>
                    {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${urgencyPct}%`,
                        background: isUrgent ? '#ef4444' : '#00d4ff'
                      }}
                    />
                  </div>
                  <p className="font-orbitron text-[10px] text-white/30 mt-1">TEMPS RESTANT POUR ACCEPTER</p>
                </div>

                {/* Rewards */}
                <div className="flex justify-center gap-4 mb-5 py-3 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-orbitron text-xs text-neon-blue">+{urgentQuest.xpReward} XP</p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div>
                    <p className="font-orbitron text-xs text-gold">+{urgentQuest.goldReward} 🪙</p>
                  </div>
                  {urgentQuest.statBonus && Object.entries(urgentQuest.statBonus).map(([s, v]) => (
                    <div key={s}>
                      <div className="w-px bg-white/10 inline-block mx-2" />
                      <p className="font-orbitron text-xs text-neon-purple">+{v} {s.slice(0,3).toUpperCase()}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      dismissUrgentQuest()
                      addNotification({ type: 'error', message: 'Quête refusée — Pénalité en attente...' })
                    }}
                    className="flex-1 py-3 font-orbitron text-xs text-white/30 border border-white/10 rounded-xl"
                  >
                    REFUSER
                  </button>
                  <button
                    onClick={handleAccept}
                    className="flex-1 py-3 font-orbitron text-xs font-black text-white border border-red-500/60 bg-red-500/15 rounded-xl"
                    style={{ boxShadow: '0 0 20px rgba(239,68,68,0.3)' }}
                  >
                    ⚡ ACCEPTER
                  </button>
                </div>
              </>
            ) : (
              // Active timer view
              <>
                <p className="font-orbitron text-xs tracking-widest text-red-400 mb-4">{urgentQuest.subtitle}</p>
                <div className="font-orbitron text-6xl font-black text-neon-blue mb-2"
                  style={{ textShadow: '0 0 40px rgba(0,212,255,0.8)' }}>
                  {String(Math.floor(timerSecs / 60)).padStart(2, '0')}:{String(timerSecs % 60).padStart(2, '0')}
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                  <motion.div
                    className="h-full bg-neon-blue rounded-full"
                    style={{ width: `${(timerSecs / urgentQuest.duration) * 100}%` }}
                  />
                </div>
                <p className="font-rajdhani text-white/50 text-sm mb-4">Tiens bon, Chasseur !</p>
                <button onClick={() => { setTimerRunning(false); dismissUrgentQuest() }}
                  className="font-orbitron text-xs text-white/30">
                  ABANDONNER
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
