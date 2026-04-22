import { useGameStore } from '../../stores/gameStore'
import DashboardPage from '../../pages/DashboardPage'
import QuestsPage from '../../pages/QuestsPage'
import InventoryPage from '../../pages/InventoryPage'
import ProfilePage from '../../pages/ProfilePage'
import BottomNav from './BottomNav'
import { AnimatePresence, motion } from 'framer-motion'

const PAGES = {
  dashboard: DashboardPage,
  quests: QuestsPage,
  inventory: InventoryPage,
  profile: ProfilePage,
}

export default function AppShell({ player, user }) {
  const { activeTab } = useGameStore()
  const Page = PAGES[activeTab] || DashboardPage

  return (
    <div className="fixed inset-0 bg-bg flex flex-col">
      {/* Scanline overlay */}
      <div className="scanline absolute inset-0 pointer-events-none z-10" />

      {/* Page content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Page player={player} user={user} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <BottomNav player={player} />
    </div>
  )
}
