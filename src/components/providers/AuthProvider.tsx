import { useState, useEffect } from 'react'
import { User, onAuthStateChanged, getIdToken } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import AuthContext from '@/context/AuthContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        const token = await getIdToken(user)
        setToken(token)
      } else {
        setToken(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, token }}>
      {children}
    </AuthContext.Provider>
  )
}
