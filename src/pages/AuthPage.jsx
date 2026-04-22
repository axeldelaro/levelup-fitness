import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { register, login } from '../firebase/auth'

export default function AuthPage() {
  const [mode, setMode] = useState('splash') // splash | login | register
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await register(email, password, username)
      } else {
        await login(email, password)
      }
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'Email déjà utilisé.',
        'auth/invalid-email': 'Email invalide.',
        'auth/weak-password': 'Mot de passe trop faible (6 caractères min).',
        'auth/user-not-found': 'Compte introuvable.',
        'auth/wrong-password': 'Mot de passe incorrect.',
        'auth/invalid-credential': 'Identifiants invalides.',
      }
      setError(msgs[err.code] || `Erreur : ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-bg overflow-hidden flex flex-col">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-neon-purple/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-neon-blue/10 blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="scanline absolute inset-0" />
        {/* Grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <AnimatePresence mode="wait">
        {mode === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center px-6 gap-8"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="relative"
            >
              <div className="w-28 h-28 rounded-2xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center"
                style={{ boxShadow: '0 0 40px rgba(0,212,255,0.3), 0 0 80px rgba(0,212,255,0.1)' }}>
                <span className="text-5xl">⚔️</span>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-neon-blue animate-ping opacity-75" />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <h1 className="font-orbitron font-black text-4xl shimmer-text mb-2">
                LEVELUP
              </h1>
              <p className="font-orbitron text-lg text-neon-blue/70 tracking-[0.3em]">
                FITNESS
              </p>
              <div className="mt-4 h-px bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent" />
              <p className="mt-4 font-rajdhani text-white/50 text-lg">
                Tu n'es pas juste un athlète.<br />
                <span className="text-neon-purple">Tu es un Chasseur.</span>
              </p>
            </motion.div>

            {/* Rank badges preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex gap-2"
            >
              {['E', 'D', 'C', 'B', 'A', 'S'].map((r, i) => (
                <motion.div
                  key={r}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className={`w-9 h-9 rounded-lg border font-orbitron font-bold text-sm flex items-center justify-center rank-badge-${r.toLowerCase()}`}
                >
                  {r}
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="flex flex-col gap-3 w-full max-w-xs"
            >
              <button onClick={() => setMode('register')} className="btn-neon w-full py-4 text-base">
                Créer mon profil de Chasseur
              </button>
              <button onClick={() => setMode('login')} className="w-full py-4 font-orbitron text-sm tracking-widest text-white/40 hover:text-white/70 transition-colors">
                J'ai déjà un compte →
              </button>
            </motion.div>
          </motion.div>
        )}

        {(mode === 'login' || mode === 'register') && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex-1 flex flex-col items-center justify-center px-6 gap-6"
          >
            <div className="w-full max-w-sm">
              {/* Header */}
              <div className="mb-8">
                <button onClick={() => setMode('splash')} className="text-white/40 hover:text-white/70 transition-colors mb-6 flex items-center gap-2 font-rajdhani">
                  ← Retour
                </button>
                <h2 className="font-orbitron font-bold text-2xl text-white mb-1">
                  {mode === 'register' ? 'Éveil du Chasseur' : 'Connexion au Système'}
                </h2>
                <p className="text-white/40 font-rajdhani text-base">
                  {mode === 'register'
                    ? 'Crée ton identité de chasseur de rang E'
                    : 'Le système te reconnaît. Entre.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {mode === 'register' && (
                  <div className="relative">
                    <label className="block font-orbitron text-xs text-neon-blue/70 tracking-widest mb-2">
                      NOM DE CHASSEUR
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Ex: ShadowHunter_X"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white font-rajdhani text-lg placeholder:text-white/20 focus:outline-none focus:border-neon-blue/50 transition-colors"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block font-orbitron text-xs text-neon-blue/70 tracking-widest mb-2">
                    IDENTIFIANT (EMAIL)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="hunter@system.net"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white font-rajdhani text-lg placeholder:text-white/20 focus:outline-none focus:border-neon-blue/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block font-orbitron text-xs text-neon-blue/70 tracking-widest mb-2">
                    CODE D'ACCÈS
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white font-rajdhani text-lg placeholder:text-white/20 focus:outline-none focus:border-neon-blue/50 transition-colors"
                    required
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
                  >
                    <p className="text-red-400 font-rajdhani text-sm">⚠️ {error}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-neon w-full py-4 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
                      CONNEXION...
                    </span>
                  ) : mode === 'register' ? 'Commencer l\'Éveil' : 'Entrer dans le Système'}
                </button>
              </form>

              <p className="mt-6 text-center text-white/30 font-rajdhani text-sm">
                {mode === 'register' ? 'Déjà chasseur ?' : 'Pas encore de compte ?'}
                {' '}
                <button
                  onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
                  className="text-neon-blue hover:text-neon-cyan transition-colors"
                >
                  {mode === 'register' ? 'Connexion' : 'Créer un compte'}
                </button>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
