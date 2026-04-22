import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SHOP_ITEMS, RARITY_COLORS, RARITY_LABELS } from '../data/items'
import { purchaseItem } from '../firebase/firestore'
import { useGameStore } from '../stores/gameStore'

const CATEGORIES = [
  { id: 'all', label: 'Tout', icon: '◈' },
  { id: 'armor', label: 'Armures', icon: '🛡️' },
  { id: 'title', label: 'Titres', icon: '📜' },
  { id: 'aura', label: 'Auras', icon: '✨' },
]

export default function InventoryPage({ player, user }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('shop') // shop | inventory
  const [confirmItem, setConfirmItem] = useState(null)
  const { addNotification } = useGameStore()

  const filtered = SHOP_ITEMS.filter(item =>
    activeCategory === 'all' || item.category === activeCategory
  )

  const handleBuy = async (item) => {
    if (!player || player.gold < item.price) {
      addNotification({ type: 'error', message: 'Or insuffisant !' })
      return
    }
    if (player.inventory?.includes(item.id)) {
      addNotification({ type: 'warning', message: 'Tu possèdes déjà cet objet.' })
      return
    }
    try {
      await purchaseItem(user.uid, item, player)
      addNotification({ type: 'success', message: `${item.name} acheté ! +1 style.` })
      setConfirmItem(null)
    } catch (e) {
      addNotification({ type: 'error', message: e.message })
    }
  }

  const owned = SHOP_ITEMS.filter(i => player?.inventory?.includes(i.id))

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <p className="font-orbitron text-[10px] tracking-[0.3em] text-white/40">SYSTÈME DE BOUTIQUE</p>
        <div className="flex items-center justify-between mt-1">
          <h2 className="font-orbitron text-2xl font-black text-white">Arsenal</h2>
          <div className="flex items-center gap-2 glass-card px-3 py-1.5">
            <span className="text-gold text-base">🪙</span>
            <span className="font-orbitron text-base font-bold text-gold">{player?.gold?.toLocaleString() ?? 0}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-3">
          {[{ id: 'shop', label: 'Boutique' }, { id: 'inventory', label: `Inventaire (${owned.length})` }].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2 font-orbitron text-xs rounded-xl border transition-all ${
                activeTab === t.id
                  ? 'text-neon-blue border-neon-blue/40 bg-neon-blue/10'
                  : 'text-white/30 border-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'shop' && (
        <>
          {/* Category filter */}
          <div className="px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-orbitron text-xs transition-all ${
                    activeCategory === cat.id
                      ? 'text-neon-blue border-neon-blue/40 bg-neon-blue/10'
                      : 'text-white/30 border-white/10'
                  }`}
                >
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Items grid */}
          <div className="flex-1 overflow-y-auto scrollable px-4 pb-2">
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((item, i) => {
                const isOwned = player?.inventory?.includes(item.id)
                const canAfford = (player?.gold ?? 0) >= item.price
                const rarityColor = RARITY_COLORS[item.rarity]

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`glass-card p-3 flex flex-col gap-2 ${isOwned ? 'opacity-60' : ''}`}
                    style={{ borderColor: `${rarityColor}30` }}
                  >
                    {/* Rarity badge */}
                    <div className="flex items-center justify-between">
                      <span className="font-orbitron text-[9px] px-1.5 py-0.5 rounded-md"
                        style={{ color: rarityColor, backgroundColor: `${rarityColor}15`, border: `1px solid ${rarityColor}30` }}>
                        {RARITY_LABELS[item.rarity]}
                      </span>
                      {isOwned && <span className="font-orbitron text-[9px] text-neon-blue">✓ POSSÉDÉ</span>}
                    </div>

                    {/* Icon */}
                    <div className="text-center">
                      <div className="text-4xl mb-1" style={{ filter: isOwned ? `drop-shadow(0 0 8px ${rarityColor})` : 'none' }}>
                        {item.icon}
                      </div>
                      <h3 className="font-orbitron text-xs font-bold text-white leading-tight">{item.name}</h3>
                      <p className="font-rajdhani text-xs text-white/40 mt-1 leading-tight">{item.description}</p>
                    </div>

                    {/* Price & buy */}
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-gold text-sm">🪙</span>
                          <span className="font-orbitron text-sm font-bold text-gold">{item.price}</span>
                        </div>
                        <span className="font-orbitron text-[9px] text-white/30">RANG {item.rankRequired}+</span>
                      </div>

                      <button
                        onClick={() => !isOwned && setConfirmItem(item)}
                        disabled={isOwned}
                        className={`w-full py-2 font-orbitron text-[10px] font-bold rounded-xl transition-all ${
                          isOwned
                            ? 'text-white/20 border border-white/10 cursor-default'
                            : canAfford
                              ? 'text-gold border border-gold/40 bg-gold/10 active:scale-95'
                              : 'text-white/20 border border-white/10 cursor-not-allowed'
                        }`}
                      >
                        {isOwned ? 'POSSÉDÉ' : canAfford ? 'ACHETER' : 'OR INSUFFISANT'}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {activeTab === 'inventory' && (
        <div className="flex-1 overflow-y-auto scrollable px-4 pb-2">
          {owned.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <span className="text-4xl">🎒</span>
              <p className="font-orbitron text-xs text-white/30 text-center">Inventaire vide.<br />Achète des objets dans la boutique.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {owned.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07 }}
                  className="glass-card-neon p-3 text-center"
                >
                  <div className="text-4xl mb-2" style={{ filter: `drop-shadow(0 0 10px ${RARITY_COLORS[item.rarity]})` }}>
                    {item.icon}
                  </div>
                  <h3 className="font-orbitron text-xs font-bold text-white">{item.name}</h3>
                  <span className="font-orbitron text-[9px]" style={{ color: RARITY_COLORS[item.rarity] }}>
                    {RARITY_LABELS[item.rarity]}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setConfirmItem(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full p-4 pb-safe"
              onClick={e => e.stopPropagation()}
            >
              <div className="glass-card p-5 max-w-sm mx-auto"
                style={{ borderColor: `${RARITY_COLORS[confirmItem.rarity]}40`, boxShadow: `0 0 30px ${RARITY_COLORS[confirmItem.rarity]}20` }}>
                <div className="text-center mb-4">
                  <div className="text-5xl mb-2">{confirmItem.icon}</div>
                  <h3 className="font-orbitron font-bold text-white">{confirmItem.name}</h3>
                  <p className="font-rajdhani text-sm text-white/50 mt-1">{confirmItem.description}</p>
                </div>
                <div className="flex items-center justify-center gap-2 mb-5 py-3 bg-white/5 rounded-xl">
                  <span className="text-gold">🪙</span>
                  <span className="font-orbitron text-xl font-black text-gold">{confirmItem.price}</span>
                  <span className="font-orbitron text-xs text-white/30">/ {player?.gold} disponible</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmItem(null)} className="flex-1 py-3 font-orbitron text-xs text-white/40 border border-white/10 rounded-xl">
                    ANNULER
                  </button>
                  <button onClick={() => handleBuy(confirmItem)} className="flex-1 py-3 font-orbitron text-xs font-bold text-gold border border-gold/40 bg-gold/10 rounded-xl">
                    CONFIRMER
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
