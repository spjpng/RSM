"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSite } from "@/components/SiteProvider";

export function LoginModal() {
  const { login, closeLogin, describeError } = useSite();
  const ref = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(describeError(err));
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={closeLogin}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      aria-labelledby="admin-login-title"
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-card border border-line bg-background p-0 font-sans text-ink shadow-2xl backdrop:bg-ink/50 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={onSubmit} className="space-y-5 p-7 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id="admin-login-title" className="text-xl font-bold tracking-tight">
            Admin login
          </h2>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close"
            className="-mr-2 -mt-1 grid h-8 w-8 place-items-center rounded-full text-ink-muted hover:bg-line/60 hover:text-ink"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 5l10 10M15 5 5 15" />
            </svg>
          </button>
        </div>
        <div>
          <label htmlFor="admin-email" className="text-sm font-semibold">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="text-sm font-semibold">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
          />
        </div>
        {error && (
          <p role="alert" className="rounded-field border border-error/25 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
    </dialog>
  );
}
