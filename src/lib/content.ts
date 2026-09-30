import {
  defaultContent,
  FIELD_TYPES,
  type FieldType,
  type FormField,
  type Section,
  type SectionType,
  type SiteContent,
} from "@/config/content";

/**
 * Turns whatever is stored in Firestore into a complete SiteContent. Missing or malformed
 * values fall back to the defaults, so a partial or hand-edited document never breaks the
 * page. The server also runs the form schema through this before validating a lead.
 */
export function normalizeContent(raw: unknown): SiteContent {
  const d = defaultContent;
  const r = obj(raw);
  const brand = obj(r.brand);
  const pricing = obj(r.pricing);
  const hero = obj(r.hero);
  const form = obj(r.form);
  const thankYou = obj(r.thankYou);
  const footer = obj(r.footer);

  const fields = normalizeFields(form.fields);

  return {
    brand: {
      name: str(brand.name, d.brand.name),
      contactEmail: str(brand.contactEmail, d.brand.contactEmail),
    },
    pricing: {
      label: str(pricing.label, d.pricing.label),
      price: str(pricing.price, d.pricing.price),
      note: str(pricing.note, d.pricing.note),
    },
    hero: {
      eyebrow: str(hero.eyebrow, d.hero.eyebrow),
      headline: str(hero.headline, d.hero.headline),
      subhead: str(hero.subhead, d.hero.subhead),
      cta: str(hero.cta, d.hero.cta),
    },
    sections: Array.isArray(r.sections)
      ? uniqueById(r.sections.map(normalizeSection).filter((s): s is Section => s !== null))
      : d.sections,
    form: {
      heading: str(form.heading, d.form.heading),
      intro: str(form.intro, d.form.intro),
      // A form with no fields would accept empty signups, so fall back to the defaults.
      fields: fields.length ? fields : d.form.fields,
      submit: str(form.submit, d.form.submit),
      submitting: str(form.submitting, d.form.submitting),
      privacyNote: str(form.privacyNote, d.form.privacyNote),
      errorGeneric: str(form.errorGeneric, d.form.errorGeneric),
    },
    thankYou: {
      heading: str(thankYou.heading, d.thankYou.heading),
      body: str(thankYou.body, d.thankYou.body),
      nextStepsHeading: str(thankYou.nextStepsHeading, d.thankYou.nextStepsHeading),
      nextSteps: strings(thankYou.nextSteps, d.thankYou.nextSteps),
    },
    footer: { note: str(footer.note, d.footer.note) },
  };
}

function normalizeSection(raw: unknown): Section | null {
  const s = obj(raw);
  const id = typeof s.id === "string" && s.id ? s.id : newId();
  const heading = str(s.heading, "");
  const items = Array.isArray(s.items) ? s.items.map(obj) : [];
  switch (s.type) {
    case "checklist":
      return { id, type: "checklist", heading, intro: str(s.intro, ""), items: strings(s.items, []) };
    case "cards":
      return { id, type: "cards", heading, items: items.map((i) => ({ title: str(i.title, ""), body: str(i.body, "") })) };
    case "steps":
      return {
        id,
        type: "steps",
        heading,
        items: items.map((i) => ({ label: str(i.label, ""), title: str(i.title, ""), body: str(i.body, "") })),
      };
    case "text":
      return { id, type: "text", heading, body: str(s.body, "") };
    case "faq":
      return {
        id,
        type: "faq",
        heading,
        items: items.map((i) => ({ question: str(i.question, ""), answer: str(i.answer, "") })),
      };
    default:
      return null;
  }
}

function normalizeFields(raw: unknown): FormField[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const fields: FormField[] = [];
  for (const item of raw) {
    const f = obj(item);
    const id = typeof f.id === "string" ? f.id : "";
    if (!isValidFieldId(id) || seen.has(id)) continue;
    seen.add(id);
    const type = (FIELD_TYPES as readonly unknown[]).includes(f.type) ? (f.type as FieldType) : "text";
    fields.push({
      id,
      label: str(f.label, id),
      type,
      required: f.required === true,
      placeholder: str(f.placeholder, ""),
      options: strings(f.options, []),
    });
  }
  return fields;
}

// "timestamp" is added by the server as the first sheet column.
const RESERVED_FIELD_IDS = new Set(["timestamp"]);
const FIELD_ID_RE = /^[A-Za-z][A-Za-z0-9_]{0,39}$/;

export function isValidFieldId(id: string) {
  return FIELD_ID_RE.test(id) && !RESERVED_FIELD_IDS.has(id);
}

/** Builds a camelCase sheet column key from a label, unique among `taken`. */
export function fieldIdFromLabel(label: string, taken: string[]): string {
  const words = label.normalize("NFKD").replace(/[^A-Za-z0-9 ]+/g, " ").trim().split(/\s+/).filter(Boolean);
  let base = words
    .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join("")
    .slice(0, 36);
  if (!/^[A-Za-z]/.test(base)) base = `field${base}`;
  if (RESERVED_FIELD_IDS.has(base)) base = `${base}Field`;
  let id = base;
  for (let n = 2; taken.includes(id); n++) id = `${base}${n}`;
  return id;
}

export const SECTION_LABELS: Record<SectionType, string> = {
  checklist: "Checklist",
  cards: "Benefit cards",
  steps: "Steps",
  text: "Text block",
  faq: "FAQ",
};

export function newSection(type: SectionType): Section {
  const id = newId();
  switch (type) {
    case "checklist":
      return { id, type, heading: "New section", intro: "A short introduction.", items: ["First point"] };
    case "cards":
      return { id, type, heading: "New section", items: [{ title: "Benefit", body: "Describe this benefit." }] };
    case "steps":
      return { id, type, heading: "New section", items: [{ label: "Step 1", title: "Step title", body: "Describe this step." }] };
    case "text":
      return { id, type, heading: "New section", body: "Write something here." };
    case "faq":
      return { id, type, heading: "Questions", items: [{ question: "A common question?", answer: "The answer." }] };
  }
}

export function newId() {
  return Math.random().toString(36).slice(2, 10);
}

/** Moves arr[from] to arr[to] in place; ignores out-of-range moves. */
export function move<T>(arr: T[], from: number, to: number) {
  if (to < 0 || to >= arr.length) return;
  const [item] = arr.splice(from, 1);
  arr.splice(to, 0, item);
}

function uniqueById(sections: Section[]) {
  const seen = new Set<string>();
  return sections.map((s) => {
    if (!seen.has(s.id)) {
      seen.add(s.id);
      return s;
    }
    const copy = { ...s, id: newId() };
    seen.add(copy.id);
    return copy;
  });
}

function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function strings(v: unknown, fallback: string[]): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : fallback;
}
