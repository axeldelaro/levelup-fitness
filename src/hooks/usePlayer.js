import { useEffect, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import { subscribeToPlayer } from '../firebase/firestore'

export const usePlayer = (uid) => {
  const { player, setPlayer } = useGameStore()
  const prevLevel = useRef(null)

  useEffect(() => {
    if (!uid) return
    const unsub = subscribeToPlayer(uid, (data) => {
      // Detect level up
      if (prevLevel.current !== null && data.level > prevLevel.current) {
        useGameStore.getState().triggerLevelUp({ level: data.level })
      }
      prevLevel.current = data.level
      setPlayer(data)
    })
    return unsub
  }, [uid])

  return player
}
