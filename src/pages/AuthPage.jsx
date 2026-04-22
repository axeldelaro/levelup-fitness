import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { register, login, signInWithGoogle } from '../firebase/auth'

export default function AuthPage() {
  const [mode, setMode] = useState('splash') // splash | login | register
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const { token } = await signInWithGoogle()
      if (token) {
        localStorage.setItem('googleFitToken', token)
      }
    } catch (err) {
      setError(`Erreur Google : ${err.message}`)
    } finally {
      setGoogleLoading(false)
    }
  }

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
              <button 
                onClick={handleGoogleLogin} 
                disabled={googleLoading}
                className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-rajdhani font-bold text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {googleLoading ? 'Connexion...' : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuer avec Google
                  </>
                )}
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
                
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-white/30 font-rajdhani text-sm">OU</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-rajdhani font-bold text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
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
