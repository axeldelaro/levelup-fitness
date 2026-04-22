import { useState, useEffect } from 'react'
import { onAuthChange } from '../firebase/auth'

export const useAuth = () => {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    const unsub = onAuthChange((u) => setUser(u))
    return unsub
  }, [])

  return { user, loading: user === undefined }
}
