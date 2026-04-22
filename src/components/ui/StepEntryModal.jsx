import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function StepEntryModal({ isOpen, onClose, onSubmit, currentSteps = 0 }) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) setValue(String(currentSteps || ''))
  }, [isOpen, currentSteps])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const steps = parseInt(value, 10)
    if (isNaN(steps) || steps < 0) return
    setLoading(true)
    await onSubmit(steps)
    setLoading(false)
    onClose()
  }

  const quickValues = [1000, 3000, 5000, 7500, 10000]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-card p-5 max-w-lg mx-auto"
              style={{ boxShadow: '0 0 40px rgba(124,58,237,0.3)' }}>

              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="text-3xl">🚶</div>
                <div>
                  <p className="font-orbitron text-[10px] tracking-widest text-white/40">ENREGISTREMENT</p>
                  <h3 className="font-orbitron text-lg font-black text-white">Mes Pas du Jour</h3>
                </div>
              </div>

              {/* Quick presets */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {quickValues.map((v) => (
                  <button
                    key={v}
                    onClick={() => setValue(String(v))}
                    className={`px-3 py-1.5 rounded-lg font-orbitron text-[10px] border transition-all ${
                      value === String(v)
                        ? 'bg-neon-purple/30 border-neon-purple text-neon-purple'
                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                    }`}
                  >
                    {v.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit}>
                <div className="relative mb-4">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Ex: 8500"
                    min="0"
                    max="100000"
                    autoFocus
                    className="w-full bg-white/5 border border-neon-purple/30 rounded-xl px-4 py-4 text-white font-orbitron text-2xl text-center placeholder:text-white/20 focus:outline-none focus:border-neon-purple transition-colors"
                    style={{ boxShadow: '0 0 15px rgba(124,58,237,0.1)' }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-orbitron text-xs text-white/30">PAS</span>
                </div>

                {/* XP Preview */}
                {value && !isNaN(parseInt(value)) && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-neon-purple/10 rounded-xl border border-neon-purple/20 text-center"
                  >
                    <p className="font-orbitron text-xs text-neon-purple">
                      +{Math.floor(parseInt(value) / 100)} XP · +{Math.floor(parseInt(value) / 1000)} AGILITÉ
                    </p>
                  </motion.div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 font-orbitron text-xs text-white/40 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    ANNULER
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !value || isNaN(parseInt(value))}
                    className="flex-1 py-3 font-orbitron text-xs font-bold text-neon-purple border border-neon-purple/50 bg-neon-purple/10 rounded-xl disabled:opacity-40 transition-all"
                    style={{ boxShadow: '0 0 20px rgba(124,58,237,0.2)' }}
                  >
                    {loading ? '...' : '✅ ENREGISTRER'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
