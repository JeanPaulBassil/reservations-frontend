import { auth } from '@/lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import { createContext, useContext, useEffect, useState, useMemo } from 'react'

const AuthContext = createContext<{
  user: User | null
  isInitializing: boolean
}>({
  user: null,
  isInitializing: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // TODO: Here we can fetch additional user data from Firestore
      // and combine it with the auth user data
      setUser(user)
      setIsInitializing(false)
    })

    return () => unsubscribe()
  }, [])

  const value = useMemo(
    () => ({
      user,
      isInitializing,
    }),
    [user, isInitializing]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
