"use client";

import { useSite } from "@/components/SiteProvider";
import { isFirebaseConfigured } from "@/lib/firebase";

/** Small, low-contrast entry point to the admin login. Hidden once signed in. */
export function AdminLock() {
  const { adminEmail, openLogin } = useSite();
  if (!isFirebaseConfigured || adminEmail) return null;
  return (
    <button
      type="button"
      onClick={openLogin}
      aria-label="Admin login"
      title="Admin login"
      className="grid h-6 w-6 place-items-center rounded-full text-ink-muted/40 transition-colors hover:text-ink-muted focus-visible:text-ink focus-visible:outline-2 focus-visible:outline-primary"
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4.5" y="9" width="11" height="8" rx="2" />
        <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
      </svg>
    </button>
  );
}
