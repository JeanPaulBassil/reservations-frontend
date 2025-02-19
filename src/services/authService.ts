import { auth } from '@/lib/firebase'
import { fetchWithRetry } from '@/utils/fetchWithRetry'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User,
} from 'firebase/auth'

async function setSession(token: string): Promise<void> {
  const response = await fetchWithRetry('/api/auth/setSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })

  if (!response.ok) {
    throw new Error('Failed to set session')
  }
}

export async function signIn(
  email: string,
  password: string,
  rememberMe: boolean,
): Promise<User> {
  const persistenceType = rememberMe
    ? browserLocalPersistence
    : browserSessionPersistence
  await setPersistence(auth, persistenceType)
  
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    )

    const idToken = await userCredential.user.getIdToken()
    await setSession(idToken)
    localStorage.setItem('loggedIn', 'true')
    
    return userCredential.user
  } catch (error) {
    localStorage.removeItem('loggedIn')
    throw error
  }
}

export async function signInWithGoogle(): Promise<User> {
  try {
    const googleProvider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, googleProvider)
    const idToken = await userCredential.user.getIdToken()

    await setSession(idToken)
    localStorage.setItem('loggedIn', 'true')
    
    return userCredential.user
  } catch (error) {
    localStorage.removeItem('loggedIn')
    throw error
  }
}

export async function logout(): Promise<void> {
  localStorage.removeItem('loggedIn')

  await fetchWithRetry('/api/auth/clearSession', {
    method: 'POST',
  })

  await signOut(auth)
}

export async function signUp(email: string, password: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    )
    const idToken = await userCredential.user.getIdToken()

    await setSession(idToken)
    localStorage.setItem('loggedIn', 'true')
    
    return userCredential.user
  } catch (error) {
    localStorage.removeItem('loggedIn')
    throw error
  }
} 