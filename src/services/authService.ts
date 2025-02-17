import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

const googleProvider = new GoogleAuthProvider()

/**
 * Sign in with Email & Password
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

/**
 * Sign up with Email & Password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  )
  return userCredential.user
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User> {
  const userCredential = await signInWithPopup(auth, googleProvider)
  return userCredential.user
}

/**
 * Sign out user
 */
export async function logout(): Promise<void> {
  await signOut(auth)
}
