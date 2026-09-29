import { siteConfig } from "@/config/site";

export type Lead = {
  name: string;
  email: string;
  phone: string;
  ageRange: string;
  goal: string;
};

export type LeadErrors = Partial<Record<keyof Lead, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Shared by the client form and the API route so both enforce the same rules. */
export function validateLead(input: Partial<Record<keyof Lead, unknown>>): {
  lead: Lead;
  errors: LeadErrors;
} {
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const lead: Lead = {
    name: str(input.name),
    email: str(input.email).toLowerCase(),
    phone: str(input.phone),
    ageRange: str(input.ageRange),
    goal: str(input.goal),
  };

  const errors: LeadErrors = {};
  const { ageRanges, goals } = siteConfig.form;

  if (lead.name.length < 2) errors.name = "Please enter your name.";
  else if (lead.name.length > 100) errors.name = "Name is too long.";

  if (!EMAIL_RE.test(lead.email) || lead.email.length > 254)
    errors.email = "Please enter a valid email address.";

  const digits = lead.phone.replace(/\D/g, "");
  if (!/^[+\d\s().-]*$/.test(lead.phone) || digits.length < 7 || digits.length > 15)
    errors.phone = "Please enter a valid phone number.";

  if (!(ageRanges as readonly string[]).includes(lead.ageRange))
    errors.ageRange = "Please choose your age range.";

  if (!(goals as readonly string[]).includes(lead.goal))
    errors.goal = "Please choose your main goal.";

  return { lead, errors };
}
