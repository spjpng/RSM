"use client";

import dynamic from "next/dynamic";
import { doc, onSnapshot } from "firebase/firestore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { defaultContent, type SiteContent } from "@/config/content";
import { normalizeContent } from "@/lib/content";
import { CONTENT_COLLECTION, CONTENT_DOC_ID, getDb, isFirebaseConfigured } from "@/lib/firebase";

// Admin UI is split out so regular visitors never download it.
const AdminToolbar = dynamic(() => import("./edit/AdminToolbar").then((m) => m.AdminToolbar), { ssr: false });
const LoginModal = dynamic(() => import("./edit/LoginModal").then((m) => m.LoginModal), { ssr: false });

type AdminModule = typeof import("@/lib/admin");
type Notice = { kind: "success" | "error"; text: string } | null;

type SiteContextValue = {
  /** What to render: the admin's working copy in edit mode, otherwise the live content. */
  content: SiteContent;
  editing: boolean;
  /** Applies a change to the working copy. Only call in edit mode. */
  edit: (fn: (draft: SiteContent) => void) => void;

  adminEmail: string | null;
  preview: boolean;
  setPreview: (on: boolean) => void;
  dirty: boolean;
  saving: boolean;
  docExists: boolean | null;
  notice: Notice;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  save: () => Promise<void>;
  discard: () => void;
  seed: () => Promise<void>;
  describeError: (err: unknown) => string;
};

const SiteContext = createContext<SiteContextValue | null>(null);

// Remembers that this browser has an admin session, so only returning admins load Auth.
const ADMIN_FLAG = "rsm-admin";
const flag = {
  get: () => {
    try {
      return localStorage.getItem(ADMIN_FLAG) === "1";
    } catch {
      return false;
    }
  },
  set: (on: boolean) => {
    try {
      if (on) localStorage.setItem(ADMIN_FLAG, "1");
      else localStorage.removeItem(ADMIN_FLAG);
    } catch {}
  },
};

export function SiteProvider({ children }: { children: ReactNode }) {
  // Start from the defaults (same markup as the server render), then switch to Firestore.
  const [live, setLive] = useState<SiteContent>(defaultContent);
  const [docExists, setDocExists] = useState<boolean | null>(null);
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const liveRef = useRef(live);
  liveRef.current = live;
  const adminRef = useRef<AdminModule | null>(null);
  const unwatchRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onSnapshot(
      doc(getDb(), CONTENT_COLLECTION, CONTENT_DOC_ID),
      (snap) => {
        setDocExists(snap.exists());
        setLive(snap.exists() ? normalizeContent(snap.data()) : defaultContent);
      },
      (err) => console.error("Could not load site content; showing defaults", err),
    );
  }, []);

  const loadAdmin = useCallback(async () => {
    adminRef.current ??= await import("@/lib/admin");
    return adminRef.current;
  }, []);

  const watch = useCallback(async () => {
    const admin = await loadAdmin();
    if (unwatchRef.current) return;
    unwatchRef.current = admin.watchAuth((user) => {
      setAdminEmail(user ? (user.email ?? "Admin") : null);
      flag.set(Boolean(user));
      if (!user) setDraft(null);
    });
  }, [loadAdmin]);

  useEffect(() => {
    if (isFirebaseConfigured && flag.get()) void watch();
    return () => {
      unwatchRef.current?.();
      unwatchRef.current = null;
    };
  }, [watch]);

  const editing = adminEmail !== null && !preview;
  const content = adminEmail ? (draft ?? live) : live;
  const dirty = useMemo(
    () => draft !== null && JSON.stringify(draft) !== JSON.stringify(live),
    [draft, live],
  );

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (notice?.kind !== "success") return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const edit = useCallback((fn: (d: SiteContent) => void) => {
    setDraft((prev) => {
      const next = structuredClone(prev ?? liveRef.current);
      fn(next);
      return next;
    });
  }, []);

  const value: SiteContextValue = {
    content,
    editing,
    edit,
    adminEmail,
    preview,
    setPreview,
    dirty,
    saving,
    docExists,
    notice,
    loginOpen,
    openLogin: () => {
      void loadAdmin();
      setLoginOpen(true);
    },
    closeLogin: () => setLoginOpen(false),
    login: async (email, password) => {
      const admin = await loadAdmin();
      await admin.login(email, password);
      flag.set(true);
      await watch();
      setLoginOpen(false);
    },
    logout: async () => {
      if (dirty && !window.confirm("Discard your unsaved changes and log out?")) return;
      const admin = await loadAdmin();
      await admin.logout();
      setDraft(null);
      setPreview(false);
      setNotice(null);
    },
    save: async () => {
      if (!draft) return;
      setSaving(true);
      try {
        const admin = await loadAdmin();
        await admin.saveContent(draft);
        setDraft(null);
        setNotice({ kind: "success", text: "Changes saved and live." });
      } catch (err) {
        console.error("Save failed", err);
        setNotice({ kind: "error", text: `Couldn't save. ${describe(err)}` });
      } finally {
        setSaving(false);
      }
    },
    discard: () => {
      if (dirty && !window.confirm("Discard all unsaved changes?")) return;
      setDraft(null);
      setNotice(null);
    },
    seed: async () => {
      try {
        const admin = await loadAdmin();
        const created = await admin.seedDefaults();
        setNotice(
          created
            ? { kind: "success", text: "Default content written to Firestore." }
            : { kind: "error", text: "Content already exists in Firestore, so nothing was changed." },
        );
      } catch (err) {
        console.error("Seed failed", err);
        setNotice({ kind: "error", text: `Couldn't seed defaults. ${describe(err)}` });
      }
    },
    describeError: describe,
  };

  function describe(err: unknown) {
    return adminRef.current?.describeFirebaseError(err) ?? "Something went wrong. Please try again.";
  }

  return (
    <SiteContext.Provider value={value}>
      {children}
      {adminEmail && <AdminToolbar />}
      {loginOpen && <LoginModal />}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <SiteProvider>");
  return ctx;
}
