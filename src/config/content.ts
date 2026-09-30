/**
 * Types and default copy for everything the admin can edit on the landing page.
 *
 * The live copy is stored in Firestore at siteContent/main and edited in place on the
 * site (see README > "Editing the site"). These defaults are the fallback: the page
 * renders them first, and whenever the document is missing, empty, or unreachable.
 * Edit them to change what "Seed defaults" writes to a fresh project.
 */

export type ChecklistSection = {
  id: string;
  type: "checklist";
  heading: string;
  intro: string;
  items: string[];
};

export type CardsSection = {
  id: string;
  type: "cards";
  heading: string;
  items: { title: string; body: string }[];
};

export type StepsSection = {
  id: string;
  type: "steps";
  heading: string;
  items: { label: string; title: string; body: string }[];
};

export type TextSection = {
  id: string;
  type: "text";
  heading: string;
  body: string;
};

export type FaqSection = {
  id: string;
  type: "faq";
  heading: string;
  items: { question: string; answer: string }[];
};

export type Section = ChecklistSection | CardsSection | StepsSection | TextSection | FaqSection;
export type SectionType = Section["type"];

export const FIELD_TYPES = ["text", "email", "phone", "select", "textarea"] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export type FormField = {
  /** Stable key sent to /api/lead and used as the Google Sheet column header. */
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder: string;
  /** Choices for "select" fields; ignored for other types. */
  options: string[];
};

export type SiteContent = {
  brand: { name: string; contactEmail: string };
  pricing: { label: string; price: string; note: string };
  hero: { eyebrow: string; headline: string; subhead: string; cta: string };
  /** Sections between the hero and the signup form, in display order. */
  sections: Section[];
  form: {
    heading: string;
    intro: string;
    fields: FormField[];
    submit: string;
    submitting: string;
    privacyNote: string;
    errorGeneric: string;
  };
  thankYou: { heading: string; body: string; nextStepsHeading: string; nextSteps: string[] };
  footer: { note: string };
};

export const defaultContent: SiteContent = {
  brand: {
    name: "Regulated Strength Method",
    contactEmail: "hello@example.com",
  },

  pricing: {
    label: "8-Week Beta Group",
    price: "Free",
    note: "No cost for the beta group. Spots are limited so the group stays small.",
  },

  hero: {
    eyebrow: "Online coaching for adults 30+",
    headline: "Get stronger without burning out",
    subhead:
      "Consistency beats intensity. RSM helps you train steadily, recover well, and keep showing up — week after week, without the crash-and-restart cycle.",
    cta: "Join the Free 8-Week Beta Group",
  },

  sections: [
    {
      id: "who-its-for",
      type: "checklist",
      heading: "Who it's for",
      intro:
        "RSM is built for adults 30 and up who are done with all-or-nothing training and want someone in their corner.",
      items: [
        "You've started strong before, then burned out or got hurt.",
        "You want accountability, not another app you'll forget about.",
        "You're balancing work, family, and a body that needs more recovery than it used to.",
        "You'd rather build strength you can keep for the next 20 years than chase a 6-week transformation.",
      ],
    },
    {
      id: "includes",
      type: "cards",
      heading: "What the beta includes",
      items: [
        {
          title: "Weekly check-ins",
          body: "A short structured check-in each week to review training, recovery, and what to adjust next.",
        },
        {
          title: "One group call",
          body: "A live group call with the coach and other members to ask questions and stay connected.",
        },
        {
          title: "The RSM training framework",
          body: "A clear, repeatable structure for strength training that fits a real schedule.",
        },
        {
          title: "Recovery & nervous system regulation",
          body: "Practical tools for sleep, stress, and pacing so your body can actually adapt to the work.",
        },
      ],
    },
    {
      id: "how-it-works",
      type: "steps",
      heading: "How the 8 weeks work",
      items: [
        {
          label: "Weeks 1–2",
          title: "Set your baseline",
          body: "We look at where you are now — training history, schedule, stress, and recovery — and set a realistic starting point.",
        },
        {
          label: "Weeks 3–5",
          title: "Build the rhythm",
          body: "You follow the RSM framework, check in weekly, and we adjust load and volume based on how you're recovering.",
        },
        {
          label: "Weeks 6–7",
          title: "Progress steadily",
          body: "With consistency in place, we add strength gradually while keeping recovery and regulation front and center.",
        },
        {
          label: "Week 8",
          title: "Review and plan ahead",
          body: "We review what changed and map out how to keep going on your own or with continued coaching.",
        },
      ],
    },
    {
      id: "commitment",
      type: "text",
      heading: "A simple commitment",
      body: "To keep the group focused and useful for everyone, beta participants agree to a simple commitment: complete your weekly check-in, show up for the group call when you can, and be honest about how training is going. That's it — but we take it seriously.",
    },
    {
      id: "faq",
      type: "faq",
      heading: "Questions",
      items: [
        {
          question: "Is the beta group really free?",
          answer: "Yes. There is no cost for the 8-week beta group. Spots are limited so the group stays small.",
        },
        {
          question: "What do I need to commit to?",
          answer:
            "Complete your weekly check-in, join the group call when you can, and be honest about how training is going.",
        },
        {
          question: "What happens after the 8 weeks?",
          answer:
            "We review what changed and map out how to keep going, on your own or with continued coaching.",
        },
      ],
    },
  ],

  form: {
    heading: "Join the free beta group",
    intro: "Tell us a little about you. We'll follow up by email with next steps.",
    fields: [
      { id: "name", label: "Name", type: "text", required: true, placeholder: "", options: [] },
      { id: "email", label: "Email", type: "email", required: true, placeholder: "", options: [] },
      { id: "phone", label: "Phone", type: "phone", required: true, placeholder: "", options: [] },
      {
        id: "ageRange",
        label: "Age range",
        type: "select",
        required: true,
        placeholder: "Select your age range",
        options: ["30–39", "40–49", "50–59", "60+"],
      },
      {
        id: "goal",
        label: "Main goal",
        type: "select",
        required: true,
        placeholder: "Select your main goal",
        options: [
          "Build strength consistently",
          "Get back into training after a break",
          "Train without pain or injury flare-ups",
          "Manage stress and recover better",
          "Lose body fat sustainably",
          "Other",
        ],
      },
    ],
    submit: "Request my spot",
    submitting: "Sending…",
    privacyNote: "We'll only use your details to contact you about the RSM beta.",
    errorGeneric: "Something went wrong sending your details. Please try again in a moment.",
  },

  thankYou: {
    heading: "You're on the list — thank you.",
    body: "We've received your details for the free 8-week beta group.",
    nextStepsHeading: "What happens next",
    nextSteps: [
      "Look out for an email from us within 2–3 days (check your spam folder just in case).",
      "We'll share the start date, group call time, and the simple commitment to confirm.",
      "Once you confirm, you'll get your first weekly check-in and the RSM framework.",
    ],
  },

  footer: {
    note: "The Regulated Strength Method is a coaching program and is not a substitute for medical advice. Check with your doctor before starting a new exercise program.",
  },
};
