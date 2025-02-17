import { signInWithEmailAndPassword, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export async function signInWithEmail(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ User signed in:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("🔥 Auth Error:", error);
    throw error;
  }
}
