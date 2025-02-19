import { auth } from '@/lib/firebase'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth'
import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext<{
  user: User | null
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
}>({
  user: null,
  signIn: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
  signUp: async () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      )
      const idToken = await userCredential.user.getIdToken()
      
      const response = await fetch('/api/auth/setSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      })

      if (!response.ok) {
        throw new Error('Failed to set session')
      }

      localStorage.setItem('loggedIn', 'true')
    } catch (error) {
      localStorage.removeItem('loggedIn')
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const googleProvider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, googleProvider)
      const idToken = await userCredential.user.getIdToken()
      
      const response = await fetch('/api/auth/setSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      })

      if (!response.ok) {
        throw new Error('Failed to set session')
      }

      localStorage.setItem('loggedIn', 'true')
    } catch (error) {
      localStorage.removeItem('loggedIn')
      throw error
    }
  }

  const logout = async () => {
    await signOut(auth)
    localStorage.removeItem('loggedIn')
    await fetch('/api/auth/clearSession', {
      method: 'POST',
    })
  }

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      )
      const idToken = await userCredential.user.getIdToken()
      
      const response = await fetch('/api/auth/setSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      })

      if (!response.ok) {
        throw new Error('Failed to set session')
      }

      localStorage.setItem('loggedIn', 'true')
    } catch (error) {
      localStorage.removeItem('loggedIn')
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, signIn, signInWithGoogle, logout, signUp }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
