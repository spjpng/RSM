"use client";

import { useEffect, useRef, useState } from "react";
import { FIELD_TYPES, type FieldType, type FormField } from "@/config/content";
import { AddButton, EditableText, ItemControls } from "@/components/edit/Editable";
import { cardClass, FieldInput, labelClass } from "@/components/LeadForm";
import { useSite } from "@/components/SiteProvider";
import { fieldIdFromLabel, isValidFieldId, move } from "@/lib/content";

const TYPE_LABELS: Record<FieldType, string> = {
  text: "Short text",
  email: "Email",
  phone: "Phone",
  select: "Dropdown",
  textarea: "Long text",
};

const settingLabel = "block text-xs font-semibold text-ink-muted";

/** Edit-mode version of the signup form: fields, submit button, and thank-you message. */
export function FormBuilder() {
  const { content, edit } = useSite();
  const { form, thankYou } = content;
  // Fields added in this session take their sheet column from the label until the admin
  // sets one by hand. Existing fields keep theirs so their sheet column doesn't move.
  const autoIds = useRef(new Set<string>());

  const editField = (i: number, fn: (f: FormField) => void) => edit((d) => fn(d.form.fields[i]));
  const moveField = (from: number, to: number) => edit((d) => move(d.form.fields, from, to));

  const addField = () => {
    const id = fieldIdFromLabel("New field", form.fields.map((f) => f.id));
    autoIds.current.add(id);
    edit((d) => {
      d.form.fields.push({ id, label: "New field", type: "text", required: false, placeholder: "", options: [] });
    });
  };

  // Ref bookkeeping stays outside the edit() updaters, which React may run twice.
  const renameField = (i: number, label: string) => {
    const current = form.fields[i].id;
    if (!autoIds.current.has(current)) return editField(i, (f) => void (f.label = label));
    const others = form.fields.filter((_, j) => j !== i).map((x) => x.id);
    const id = fieldIdFromLabel(label || "field", others);
    autoIds.current.delete(current);
    autoIds.current.add(id);
    editField(i, (f) => {
      f.label = label;
      f.id = id;
    });
  };

  const setFieldId = (i: number, id: string) => {
    autoIds.current.delete(form.fields[i].id);
    editField(i, (f) => void (f.id = id));
  };

  const nextSteps = {
    move: (from: number, to: number) => edit((d) => move(d.thankYou.nextSteps, from, to)),
    remove: (i: number) => edit((d) => void d.thankYou.nextSteps.splice(i, 1)),
  };

  return (
    <div className="space-y-8">
      <div className={`${cardClass} space-y-6`}>
        <p className="eyebrow text-primary">Signup form</p>

        {form.fields.map((field, i) => (
          <div key={i} className="relative rounded-field border border-dashed border-primary/35 bg-surface p-4 sm:p-5">
            <ItemControls
              index={i}
              count={form.fields.length}
              minItems={1}
              onMove={moveField}
              onDelete={() => edit((d) => void d.form.fields.splice(i, 1))}
              label="field"
              className="absolute -top-3.5 right-3 z-10"
            />
            <EditableText as="p" className={`${labelClass} pr-24`} value={field.label} onChange={(v) => renameField(i, v)} placeholder="Field label" />
            <FieldInput field={field} value="" onChange={() => {}} disabled />

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label className={settingLabel}>
                Type
                <select
                  value={field.type}
                  onChange={(e) =>
                    editField(i, (f) => {
                      f.type = e.target.value as FieldType;
                      if (f.type === "select" && f.options.length === 0) f.options = ["Option 1", "Option 2"];
                    })
                  }
                  className="builder-input"
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>
              <ColumnInput
                value={field.id}
                taken={form.fields.filter((_, j) => j !== i).map((f) => f.id)}
                onChange={(id) => setFieldId(i, id)}
              />
              <label className="flex items-center gap-2 pb-2.5 text-sm font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => editField(i, (f) => void (f.required = e.target.checked))}
                  className="h-4 w-4 accent-primary"
                />
                Required
              </label>
            </div>

            <label className={`${settingLabel} mt-3`}>
              {field.type === "select" ? "Prompt shown before a choice is made" : "Placeholder (optional)"}
              <input
                value={field.placeholder}
                onChange={(e) => editField(i, (f) => void (f.placeholder = e.target.value))}
                className="builder-input"
              />
            </label>

            {field.type === "select" && (
              <fieldset className="mt-4">
                <legend className={settingLabel}>Dropdown options</legend>
                <ul className="mt-2 space-y-2">
                  {field.options.map((option, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <input
                        value={option}
                        aria-label={`Option ${j + 1}`}
                        onChange={(e) => editField(i, (f) => void (f.options[j] = e.target.value))}
                        className="builder-input mt-0! flex-1"
                      />
                      <ItemControls
                        index={j}
                        count={field.options.length}
                        minItems={1}
                        onMove={(from, to) => editField(i, (f) => move(f.options, from, to))}
                        onDelete={() => editField(i, (f) => void f.options.splice(j, 1))}
                        label="option"
                        className=""
                      />
                    </li>
                  ))}
                </ul>
                <AddButton className="mt-3" onClick={() => editField(i, (f) => void f.options.push(`Option ${f.options.length + 1}`))}>
                  Add option
                </AddButton>
              </fieldset>
            )}
          </div>
        ))}

        <AddButton onClick={addField}>Add field</AddButton>

        <span className="btn-primary w-full">
          <EditableText value={form.submit} onChange={(v) => edit((d) => void (d.form.submit = v))} placeholder="Button label" />
        </span>
        <EditableText as="p" className="text-center text-sm text-ink-muted" value={form.privacyNote} onChange={(v) => edit((d) => void (d.form.privacyNote = v))} placeholder="Privacy note (optional)" />

        <div className="space-y-2 border-t border-line pt-5 text-sm text-ink-muted">
          <p>
            <span className="font-semibold text-ink">Button while sending: </span>
            <EditableText value={form.submitting} onChange={(v) => edit((d) => void (d.form.submitting = v))} placeholder="Sending…" />
          </p>
          <p>
            <span className="font-semibold text-ink">Error message: </span>
            <EditableText value={form.errorGeneric} onChange={(v) => edit((d) => void (d.form.errorGeneric = v))} placeholder="Error message" />
          </p>
        </div>
      </div>

      <div className={cardClass}>
        <p className="eyebrow mb-6 text-primary">Thank-you message · shown after signup</p>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-on-primary">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4.5 10.5 3.5 3.5 7.5-8" />
          </svg>
        </span>
        <EditableText as="h3" className="mt-6 text-2xl font-bold tracking-tight text-balance sm:text-3xl" value={thankYou.heading} onChange={(v) => edit((d) => void (d.thankYou.heading = v))} placeholder="Heading" />
        <EditableText as="p" className="mt-3 text-lg text-ink-muted" value={thankYou.body} onChange={(v) => edit((d) => void (d.thankYou.body = v))} placeholder="Message" />
        <EditableText as="h4" className="eyebrow mt-10 text-primary" value={thankYou.nextStepsHeading} onChange={(v) => edit((d) => void (d.thankYou.nextStepsHeading = v))} placeholder="Next steps heading" />
        <ol className="mt-5 space-y-4">
          {thankYou.nextSteps.map((step, i) => (
            <li key={i} className="relative flex gap-4 pr-28 text-ink">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-primary/30 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <EditableText value={step} onChange={(v) => edit((d) => void (d.thankYou.nextSteps[i] = v))} placeholder="Next step" />
              <ItemControls index={i} count={thankYou.nextSteps.length} onMove={nextSteps.move} onDelete={() => nextSteps.remove(i)} label="step" className="absolute right-0 top-0" />
            </li>
          ))}
        </ol>
        <AddButton className="mt-5" onClick={() => edit((d) => void d.thankYou.nextSteps.push("New step"))}>
          Add step
        </AddButton>
      </div>
    </div>
  );
}

/** Sheet column key. Only valid, unique keys are committed; others show an error. */
function ColumnInput({ value, taken, onChange }: { value: string; taken: string[]; onChange: (id: string) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);

  const error = !isValidFieldId(text)
    ? "Letters, numbers, and _ only; must start with a letter."
    : taken.includes(text)
      ? "Another field already uses this column."
      : "";

  return (
    <label className={settingLabel} title="The column header this answer goes under in the Google Sheet">
      Sheet column
      <input
        value={text}
        spellCheck={false}
        aria-invalid={!!error}
        onChange={(e) => {
          const next = e.target.value.trim();
          setText(next);
          if (isValidFieldId(next) && !taken.includes(next)) onChange(next);
        }}
        onBlur={() => setText(value)}
        className="builder-input font-mono"
      />
      {error && <span className="mt-1 block font-normal text-error">{error}</span>}
    </label>
  );
}
