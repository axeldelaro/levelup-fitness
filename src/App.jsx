import { useAuth } from './hooks/useAuth'
import { usePlayer } from './hooks/usePlayer'
import AuthPage from './pages/AuthPage'
import AppShell from './components/layout/AppShell'
import LevelUpOverlay from './components/overlays/LevelUpOverlay'
import UrgentQuestModal from './components/quests/UrgentQuestModal'
import NotificationToast from './components/ui/NotificationToast'
import { useGameStore } from './stores/gameStore'
import { useEffect } from 'react'
import { URGENT_QUEST_TEMPLATES } from './data/quests'

export default function App() {
  const { user, loading } = useAuth()
  const player = usePlayer(user?.uid)
  const { showLevelUpOverlay, showUrgentQuest, triggerUrgentQuest, notifications } = useGameStore()

  // Urgent quest random trigger (toutes les 2-4h)
  useEffect(() => {
    if (!user) return
    const checkUrgent = () => {
      const lastUrgent = parseInt(localStorage.getItem('lastUrgentQuest') || '0')
      const elapsed = Date.now() - lastUrgent
      const minDelay = 2 * 60 * 60 * 1000 // 2h
      if (elapsed > minDelay && Math.random() < 0.3) {
        const quest = URGENT_QUEST_TEMPLATES[Math.floor(Math.random() * URGENT_QUEST_TEMPLATES.length)]
        triggerUrgentQuest(quest)
        localStorage.setItem('lastUrgentQuest', Date.now().toString())
      }
    }
    const interval = setInterval(checkUrgent, 15 * 60 * 1000) // check every 15min
    return () => clearInterval(interval)
  }, [user])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-neon-blue/30 border-t-neon-blue animate-spin" />
          <p className="font-orbitron text-neon-blue text-sm tracking-widest">CHARGEMENT...</p>
        </div>
      </div>
    )
  }

  if (!user) return <AuthPage />

  return (
    <>
      <AppShell player={player} user={user} />
      {showLevelUpOverlay && <LevelUpOverlay />}
      {showUrgentQuest && <UrgentQuestModal />}
      <NotificationToast notifications={notifications} />
    </>
  )
}
