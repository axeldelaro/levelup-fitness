import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'
import { useEffect, useRef } from 'react'

export default function LevelUpOverlay() {
  const { levelUpData, dismissLevelUp } = useGameStore()
  const audioCtx = useRef(null)

  useEffect(() => {
    // Play level-up sound via Web Audio API
    try {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)()
      const ctx = audioCtx.current
      const notes = [523, 659, 784, 1047] // C5 E5 G5 C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = freq
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4)
        osc.start(ctx.currentTime + i * 0.15)
        osc.stop(ctx.currentTime + i * 0.15 + 0.4)
      })
    } catch {}

    const timer = setTimeout(dismissLevelUp, 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        onClick={dismissLevelUp}
      >
        {/* Background flash */}
        <motion.div
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-neon-blue/20"
        />

        {/* Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-neon-blue"
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: (Math.random() - 0.5) * 300,
              y: (Math.random() - 0.5) * 400,
              scale: Math.random() * 2,
              opacity: 0,
            }}
            transition={{ duration: 1.5 + Math.random(), ease: 'easeOut', delay: Math.random() * 0.3 }}
            style={{ left: '50%', top: '50%' }}
          />
        ))}

        {/* Main card */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative text-center px-10 py-8 rounded-3xl border border-neon-blue/50"
          style={{
            background: 'rgba(0,0,0,0.9)',
            boxShadow: '0 0 60px rgba(0,212,255,0.6), 0 0 120px rgba(0,212,255,0.2)',
          }}
        >
          {/* Glow rings */}
          {[1, 2, 3].map(r => (
            <motion.div
              key={r}
              className="absolute inset-0 rounded-3xl border border-neon-blue/20"
              animate={{ scale: [1, 1 + r * 0.15], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: r * 0.2 }}
            />
          ))}

          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-orbitron text-[11px] tracking-[0.4em] text-neon-blue/70 mb-3"
          >
            SYSTÈME DE PROGRESSION
          </motion.p>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
          >
            <h2 className="font-orbitron font-black text-5xl shimmer-text mb-2">
              LEVEL UP!
            </h2>
            <div className="font-orbitron text-7xl font-black text-neon-blue mt-2"
              style={{ textShadow: '0 0 40px rgba(0,212,255,1), 0 0 80px rgba(0,212,255,0.5)' }}>
              LV.{levelUpData?.level}
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="font-rajdhani text-lg text-white/50 mt-4"
          >
            Ta puissance grandit, Chasseur.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="font-orbitron text-[10px] text-white/20 mt-4"
          >
            Appuie pour continuer
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
