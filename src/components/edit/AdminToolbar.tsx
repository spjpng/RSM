"use client";

import { useSite } from "@/components/SiteProvider";

/** Floating bar shown only to a signed-in admin. */
export function AdminToolbar() {
  const { adminEmail, dirty, saving, docExists, notice, preview, setPreview, save, discard, seed, logout } = useSite();

  const btn =
    "rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft";
  const ghost = `${btn} text-on-primary/85 hover:bg-on-primary/10 hover:text-on-primary disabled:hover:bg-transparent`;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 font-sans">
      {notice && (
        <p
          role={notice.kind === "error" ? "alert" : "status"}
          className={`max-w-lg rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-lg ${
            notice.kind === "error" ? "bg-error text-on-primary" : "bg-primary text-on-primary"
          }`}
        >
          {notice.text}
        </p>
      )}
      <div
        role="toolbar"
        aria-label="Site editor"
        className="flex max-w-full flex-wrap items-center justify-center gap-1 rounded-3xl bg-ink p-1.5 text-on-primary shadow-[0_16px_40px_-12px_rgb(28_31_26/0.6)]"
      >
        <span className="flex items-center gap-2 px-3 text-sm" aria-live="polite" title={adminEmail ?? undefined}>
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${dirty ? "animate-pulse bg-amber-400" : "bg-primary-soft"}`}
          />
          {dirty ? "Unsaved changes" : preview ? "Preview" : "Editing"}
        </span>

        <button type="button" className={ghost} onClick={() => setPreview(!preview)} aria-pressed={preview}>
          {preview ? "Back to editing" : "Preview"}
        </button>
        {docExists === false && (
          <button type="button" className={ghost} onClick={seed} title="Write the default content to Firestore">
            Seed defaults
          </button>
        )}
        <button type="button" className={ghost} onClick={discard} disabled={!dirty || saving}>
          Discard
        </button>
        <button
          type="button"
          className={`${btn} bg-primary-soft text-ink hover:bg-on-primary`}
          onClick={save}
          disabled={!dirty || saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" className={ghost} onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  );
}
