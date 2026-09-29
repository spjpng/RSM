"use client";

import { useRef, useState, type FormEvent } from "react";
import { siteConfig } from "@/config/site";
import { validateLead, type Lead, type LeadErrors } from "@/lib/lead";

const empty: Lead = { name: "", email: "", phone: "", ageRange: "", goal: "" };

const labelClass = "text-sm font-semibold text-ink";
const cardClass =
  "rounded-card border border-line bg-background p-6 shadow-[0_32px_64px_-40px_rgb(28_31_26/0.35)] sm:p-10";

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
        className={`${cardClass} animate-rise focus:outline-none`}
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-on-primary">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4.5 10.5 3.5 3.5 7.5-8" />
          </svg>
        </span>
        <h3 className="mt-6 text-2xl font-bold tracking-tight text-balance sm:text-3xl">{thankYou.heading}</h3>
        <p className="mt-3 text-lg text-ink-muted">{thankYou.body}</p>
        <h4 className="eyebrow mt-10 text-primary">{thankYou.nextStepsHeading}</h4>
        <ol className="mt-5 space-y-4">
          {thankYou.nextSteps.map((step, i) => (
            <li key={step} className="flex gap-4 text-ink">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-primary/30 text-xs font-semibold text-primary">
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
  const errorText = (k: keyof Lead) =>
    errors[k] ? (
      <p id={`lead-${k}-error`} className="mt-2 text-sm text-error">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className={`${cardClass} space-y-6`}
    >
      <div>
        <label htmlFor="lead-name" className={labelClass}>
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
          className="field"
        />
        {errorText("name")}
      </div>

      <div>
        <label htmlFor="lead-email" className={labelClass}>
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
          className="field"
        />
        {errorText("email")}
      </div>

      <div>
        <label htmlFor="lead-phone" className={labelClass}>
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
          className="field"
        />
        {errorText("phone")}
      </div>

      <div>
        <label htmlFor="lead-ageRange" className={labelClass}>
          Age range
        </label>
        <select
          id="lead-ageRange"
          value={values.ageRange}
          onChange={(e) => update("ageRange")(e.target.value)}
          aria-invalid={!!errors.ageRange}
          aria-describedby={describe("ageRange")}
          className="field field-select"
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
        <label htmlFor="lead-goal" className={labelClass}>
          Main goal
        </label>
        <select
          id="lead-goal"
          value={values.goal}
          onChange={(e) => update("goal")(e.target.value)}
          aria-invalid={!!errors.goal}
          aria-describedby={describe("goal")}
          className="field field-select"
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
        <p role="alert" className="rounded-field border border-error/25 bg-error/5 px-4 py-3 text-sm text-error">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-primary w-full"
      >
        {status === "submitting" ? form.submitting : form.submit}
      </button>

      <p className="text-center text-sm text-ink-muted">{form.privacyNote}</p>
    </form>
  );
}
