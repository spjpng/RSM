import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, runTransaction, setDoc } from "firebase/firestore";
import { defaultContent, type SiteContent } from "@/config/content";
import { CONTENT_COLLECTION, CONTENT_DOC_ID, getDb, getFirebaseApp } from "@/lib/firebase";

// Loaded on demand (lock button click, or a returning admin), so regular visitors never
// download Firebase Auth. Writes are only allowed for admins by the Firestore rules.

const auth = () => getAuth(getFirebaseApp());
const contentRef = () => doc(getDb(), CONTENT_COLLECTION, CONTENT_DOC_ID);

export function watchAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth(), cb);
}

export async function login(email: string, password: string) {
  await signInWithEmailAndPassword(auth(), email, password);
}

export async function logout() {
  await signOut(auth());
}

export async function saveContent(content: SiteContent) {
  await setDoc(contentRef(), content);
}

/** Writes the defaults only if the document doesn't exist yet. Returns false if it did. */
export async function seedDefaults(): Promise<boolean> {
  return runTransaction(getDb(), async (tx) => {
    const snap = await tx.get(contentRef());
    if (snap.exists()) return false;
    tx.set(contentRef(), defaultContent);
    return true;
  });
}

export function describeFirebaseError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
    case "unavailable":
      return "Network error. Check your connection and try again.";
    case "permission-denied":
      return "This account doesn't have permission to edit the site.";
    default:
      return "Something went wrong. Please try again.";
  }
}
