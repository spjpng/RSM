import type { FormField } from "@/config/content";

export type LeadValues = Record<string, string>;
export type LeadErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_LENGTH: Record<FormField["type"], number> = {
  text: 200,
  email: 254,
  phone: 30,
  select: 200,
  textarea: 2000,
};

/**
 * Validates a submission against the form schema. Shared by the client form and the
 * API route so both enforce the same rules. Only keys defined in the schema are kept.
 */
export function validateLead(
  fields: FormField[],
  input: Record<string, unknown>,
): { lead: LeadValues; errors: LeadErrors } {
  const lead: LeadValues = {};
  const errors: LeadErrors = {};

  for (const field of fields) {
    const raw = input[field.id];
    let value = typeof raw === "string" ? raw.trim() : "";
    if (field.type === "email") value = value.toLowerCase();
    lead[field.id] = value;

    if (!value) {
      if (field.required)
        errors[field.id] = field.type === "select" ? "Please choose an option." : "Please fill in this field.";
      continue;
    }
    if (value.length > MAX_LENGTH[field.type]) {
      errors[field.id] = "This answer is too long.";
      continue;
    }

    switch (field.type) {
      case "email":
        if (!EMAIL_RE.test(value)) errors[field.id] = "Please enter a valid email address.";
        break;
      case "phone": {
        const digits = value.replace(/\D/g, "");
        if (!/^[+\d\s().-]*$/.test(value) || digits.length < 7 || digits.length > 15)
          errors[field.id] = "Please enter a valid phone number.";
        break;
      }
      case "select":
        if (!field.options.includes(value)) errors[field.id] = "Please choose an option.";
        break;
    }
  }

  return { lead, errors };
}
