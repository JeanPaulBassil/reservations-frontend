import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';

import { auth } from '@/lib/firebase';

export async function signIn(email: string, password: string, rememberMe: boolean): Promise<User> {
  const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistenceType);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    localStorage.setItem('loggedIn', 'true');

    return userCredential.user;
  } catch (error) {
    localStorage.removeItem('loggedIn');
    throw error;
  }
}

export async function signInWithGoogle(): Promise<User> {
  try {
    const googleProvider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, googleProvider);

    localStorage.setItem('loggedIn', 'true');

    return userCredential.user;
  } catch (error) {
    localStorage.removeItem('loggedIn');
    throw error;
  }
}

export async function logout(): Promise<void> {
  localStorage.removeItem('loggedIn');
  await signOut(auth);
}

export async function signUp(email: string, password: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    localStorage.setItem('loggedIn', 'true');

    return userCredential.user;
  } catch (error) {
    localStorage.removeItem('loggedIn');
    throw error;
  }
}
