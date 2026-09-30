import { doc, getDoc, getFirestore } from "firebase/firestore/lite";
import { defaultContent, type SiteContent } from "@/config/content";
import { normalizeContent } from "@/lib/content";
import { CONTENT_COLLECTION, CONTENT_DOC_ID, getFirebaseApp, isFirebaseConfigured } from "@/lib/firebase";

const TIMEOUT_MS = 5_000;

/**
 * Reads siteContent/main on the server with the lightweight REST client (public read,
 * no service account). Falls back to the defaults if the document is missing or
 * Firestore can't be reached in time.
 */
export async function getSiteContent(): Promise<SiteContent> {
  if (!isFirebaseConfigured) return defaultContent;
  try {
    const ref = doc(getFirestore(getFirebaseApp()), CONTENT_COLLECTION, CONTENT_DOC_ID);
    const snap = await Promise.race([
      getDoc(ref),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Firestore read timed out")), TIMEOUT_MS),
      ),
    ]);
    return snap.exists() ? normalizeContent(snap.data()) : defaultContent;
  } catch (err) {
    console.error("Could not read site content; using defaults", err);
    return defaultContent;
  }
}
