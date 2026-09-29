"use client";

import { useRef, useState, type FormEvent } from "react";
import { siteConfig } from "@/config/site";
import { validateLead, type Lead, type LeadErrors } from "@/lib/lead";

const empty: Lead = { name: "", email: "", phone: "", ageRange: "", goal: "" };

const fieldClass =
  "mt-1.5 block w-full rounded-lg border bg-surface px-3.5 py-3 text-base text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary/40";

export function LeadForm() {
  const { form, thankYou } = siteConfig;
  const [values, setValues] = useState<Lead>(empty);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const thanksRef = useRef<HTMLDivElement>(null);

  const update = (key: keyof Lead) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { lead, errors: found } = validateLead(values);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(`lead-${firstInvalid}`)?.focus();
      return;
    }

    setStatus("submitting");
    setServerError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, company: honeypot }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        if (data.errors) setErrors(data.errors);
        setServerError(data.error || form.errorGeneric);
        setStatus("error");
        return;
      }
      setStatus("success");
      requestAnimationFrame(() => thanksRef.current?.focus());
    } catch {
      setServerError(form.errorGeneric);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        ref={thanksRef}
        tabIndex={-1}
        role="status"
        className="rounded-2xl border border-line bg-surface p-6 focus:outline-none sm:p-8"
      >
        <h3 className="font-serif text-2xl text-ink">{thankYou.heading}</h3>
        <p className="mt-2 text-ink-soft">{thankYou.body}</p>
        <h4 className="mt-6 text-sm font-semibold uppercase tracking-wider text-accent">
          {thankYou.nextStepsHeading}
        </h4>
        <ol className="mt-3 space-y-3">
          {thankYou.nextSteps.map((step, i) => (
            <li key={step} className="flex gap-3 text-ink">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs text-primary-ink">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const describe = (key: keyof Lead) => (errors[key] ? `lead-${key}-error` : undefined);
  const border = (key: keyof Lead) => (errors[key] ? "border-error" : "border-line");
  const errorText = (k: keyof Lead) =>
    errors[k] ? (
      <p id={`lead-${k}-error`} className="mt-1.5 text-sm text-error">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-line bg-surface p-6 sm:p-8"
    >
      <div>
        <label htmlFor="lead-name" className="text-sm font-medium text-ink">
          Name
        </label>
        <input
          id="lead-name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(e) => update("name")(e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={describe("name")}
          className={`${fieldClass} ${border("name")}`}
        />
        {errorText("name")}
      </div>

      <div>
        <label htmlFor="lead-email" className="text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="lead-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => update("email")(e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={describe("email")}
          className={`${fieldClass} ${border("email")}`}
        />
        {errorText("email")}
      </div>

      <div>
        <label htmlFor="lead-phone" className="text-sm font-medium text-ink">
          Phone
        </label>
        <input
          id="lead-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(e) => update("phone")(e.target.value)}
          aria-invalid={!!errors.phone}
          aria-describedby={describe("phone")}
          className={`${fieldClass} ${border("phone")}`}
        />
        {errorText("phone")}
      </div>

      <div>
        <label htmlFor="lead-ageRange" className="text-sm font-medium text-ink">
          Age range
        </label>
        <select
          id="lead-ageRange"
          value={values.ageRange}
          onChange={(e) => update("ageRange")(e.target.value)}
          aria-invalid={!!errors.ageRange}
          aria-describedby={describe("ageRange")}
          className={`${fieldClass} ${border("ageRange")}`}
        >
          <option value="" disabled>
            Select your age range
          </option>
          {form.ageRanges.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {errorText("ageRange")}
      </div>

      <div>
        <label htmlFor="lead-goal" className="text-sm font-medium text-ink">
          Main goal
        </label>
        <select
          id="lead-goal"
          value={values.goal}
          onChange={(e) => update("goal")(e.target.value)}
          aria-invalid={!!errors.goal}
          aria-describedby={describe("goal")}
          className={`${fieldClass} ${border("goal")}`}
        >
          <option value="" disabled>
            Select your main goal
          </option>
          {form.goals.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        {errorText("goal")}
      </div>

      {/* Honeypot field for bots; hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="lead-company">Company</label>
        <input
          id="lead-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {status === "error" && serverError && (
        <p role="alert" className="rounded-lg bg-error/10 px-3.5 py-3 text-sm text-error">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-primary px-6 py-3.5 text-base font-medium text-primary-ink transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:opacity-60"
      >
        {status === "submitting" ? form.submitting : form.submit}
      </button>

      <p className="text-center text-xs text-ink-soft">{form.privacyNote}</p>
    </form>
  );
}
