"use client";

import dynamic from "next/dynamic";
import { useRef, useState, type FormEvent } from "react";
import type { FormField, SiteContent } from "@/config/content";
import { useSite } from "@/components/SiteProvider";
import { validateLead, type LeadErrors, type LeadValues } from "@/lib/lead";

const FormBuilder = dynamic(() => import("./edit/FormBuilder").then((m) => m.FormBuilder), { ssr: false });

export const labelClass = "text-sm font-semibold text-ink";
export const cardClass =
  "rounded-card border border-line bg-background p-6 shadow-[0_32px_64px_-40px_rgb(28_31_26/0.35)] sm:p-10";

export function LeadForm() {
  const { content, editing } = useSite();
  if (editing) return <FormBuilder />;
  return <PublicForm form={content.form} thankYou={content.thankYou} />;
}

function PublicForm({ form, thankYou }: Pick<SiteContent, "form" | "thankYou">) {
  const [values, setValues] = useState<LeadValues>({});
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const thanksRef = useRef<HTMLDivElement>(null);

  const update = (key: string, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { lead, errors: found } = validateLead(form.fields, values);
    setErrors(found);
    const firstInvalid = form.fields.find((f) => found[f.id]);
    if (firstInvalid) {
      document.getElementById(`lead-${firstInvalid.id}`)?.focus();
      return;
    }

    setStatus("submitting");
    setServerError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: lead, company: honeypot }),
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
      <div ref={thanksRef} tabIndex={-1} role="status" className={`${cardClass} animate-rise focus:outline-none`}>
        <ThankYouBody thankYou={thankYou} />
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className={`${cardClass} space-y-6`}>
      {form.fields.map((field) => (
        <div key={field.id}>
          <label htmlFor={`lead-${field.id}`} className={labelClass}>
            {field.label}
            {!field.required && <span className="font-normal text-ink-muted"> (optional)</span>}
          </label>
          <FieldInput
            field={field}
            value={values[field.id] ?? ""}
            onChange={(v) => update(field.id, v)}
            error={errors[field.id]}
          />
          {errors[field.id] && (
            <p id={`lead-${field.id}-error`} className="mt-2 text-sm text-error">
              {errors[field.id]}
            </p>
          )}
        </div>
      ))}

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

      <button type="submit" disabled={status === "submitting"} className="btn-primary w-full">
        {status === "submitting" ? form.submitting : form.submit}
      </button>

      {form.privacyNote && <p className="text-center text-sm text-ink-muted">{form.privacyNote}</p>}
    </form>
  );
}

const AUTOCOMPLETE: Partial<Record<FormField["type"], string>> = { email: "email", phone: "tel" };

export function FieldInput({
  field,
  value,
  onChange,
  error,
  disabled,
}: {
  field: FormField;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const common = {
    id: `lead-${field.id}`,
    name: field.id,
    value,
    disabled,
    required: field.required,
    "aria-invalid": !!error,
    "aria-describedby": error ? `lead-${field.id}-error` : undefined,
  };

  switch (field.type) {
    case "select":
      return (
        <select {...common} onChange={(e) => onChange(e.target.value)} className="field field-select">
          <option value="" disabled={field.required}>
            {field.placeholder || "Select an option"}
          </option>
          {field.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    case "textarea":
      return (
        <textarea
          {...common}
          rows={4}
          placeholder={field.placeholder || undefined}
          onChange={(e) => onChange(e.target.value)}
          className="field resize-y"
        />
      );
    default:
      return (
        <input
          {...common}
          type={field.type === "phone" ? "tel" : field.type}
          inputMode={field.type === "phone" ? "tel" : field.type === "email" ? "email" : undefined}
          autoComplete={AUTOCOMPLETE[field.type] ?? (field.id === "name" ? "name" : undefined)}
          placeholder={field.placeholder || undefined}
          onChange={(e) => onChange(e.target.value)}
          className="field"
        />
      );
  }
}

function ThankYouBody({ thankYou }: { thankYou: SiteContent["thankYou"] }) {
  return (
    <>
      <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-on-primary">
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m4.5 10.5 3.5 3.5 7.5-8" />
        </svg>
      </span>
      <h3 className="mt-6 text-2xl font-bold tracking-tight text-balance sm:text-3xl">{thankYou.heading}</h3>
      <p className="mt-3 text-lg text-ink-muted">{thankYou.body}</p>
      {thankYou.nextSteps.length > 0 && (
        <>
          <h4 className="eyebrow mt-10 text-primary">{thankYou.nextStepsHeading}</h4>
          <ol className="mt-5 space-y-4">
            {thankYou.nextSteps.map((step, i) => (
              <li key={i} className="flex gap-4 text-ink">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-primary/30 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </>
      )}
    </>
  );
}
