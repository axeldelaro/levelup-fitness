import { create } from 'zustand'

export const useGameStore = create((set, get) => ({
  // Navigation
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Player (synced from Firestore)
  player: null,
  setPlayer: (player) => set({ player }),

  // UI State
  showLevelUpOverlay: false,
  levelUpData: null,
  showUrgentQuest: false,
  urgentQuest: null,
  showBossModal: false,

  // Level Up trigger
  triggerLevelUp: (data) => set({ showLevelUpOverlay: true, levelUpData: data }),
  dismissLevelUp: () => set({ showLevelUpOverlay: false, levelUpData: null }),

  // Urgent quest
  triggerUrgentQuest: (quest) => set({ showUrgentQuest: true, urgentQuest: quest }),
  dismissUrgentQuest: () => set({ showUrgentQuest: false, urgentQuest: null }),

  // Boss modal
  triggerBoss: () => set({ showBossModal: true }),
  dismissBoss: () => set({ showBossModal: false }),

  // Notifications
  notifications: [],
  addNotification: (notif) => {
    const id = Date.now()
    set((s) => ({ notifications: [...s.notifications, { id, ...notif }] }))
    setTimeout(() => {
      set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }))
    }, 4000)
  },
}))
