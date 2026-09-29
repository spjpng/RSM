/**
 * Single source of truth for branding, copy, logo, and pricing.
 * Edit this file to rebrand or rewrite the landing page — no component changes needed.
 * Fonts, colors, and spacing live in ./theme.ts.
 */

export const siteConfig = {
  brand: {
    name: "Regulated Strength Method",
    shortName: "RSM",
    tagline: "Strength training for adults 30+ who want to stay consistent.",
    contactEmail: "hello@example.com",
  },

  // Set `src` to a file in /public (e.g. "/logo.svg") to use an image logo.
  // When `src` is empty, a text mark built from `mark` is shown instead.
  logo: {
    src: "" as string,
    alt: "Regulated Strength Method logo",
    mark: "RSM",
    width: 40,
    height: 40,
  },

  pricing: {
    beta: {
      label: "8-Week Beta Group",
      price: "Free",
      note: "No cost for the beta group. Spots are limited so the group stays small.",
    },
  },

  seo: {
    title: "Regulated Strength Method | Get stronger without burning out",
    description:
      "An online coaching program for adults 30+ who want accountability and sustainable consistency. Join the free 8-week beta group.",
  },

  hero: {
    eyebrow: "Online coaching for adults 30+",
    headline: "Get stronger without burning out",
    subhead:
      "Consistency beats intensity. RSM helps you train steadily, recover well, and keep showing up — week after week, without the crash-and-restart cycle.",
    cta: "Join the Free 8-Week Beta Group",
    // Optional photo behind the hero, e.g. "/hero.jpg" in /public. A soft overlay
    // (theme.heroOverlay) keeps the text readable. Leave empty for a plain background.
    backgroundImage: "" as string,
  },

  whoItsFor: {
    heading: "Who it's for",
    intro:
      "RSM is built for adults 30 and up who are done with all-or-nothing training and want someone in their corner.",
    points: [
      "You've started strong before, then burned out or got hurt.",
      "You want accountability, not another app you'll forget about.",
      "You're balancing work, family, and a body that needs more recovery than it used to.",
      "You'd rather build strength you can keep for the next 20 years than chase a 6-week transformation.",
    ],
  },

  includes: {
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

  howItWorks: {
    heading: "How the 8 weeks work",
    steps: [
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

  commitment: {
    heading: "A simple commitment",
    body: "To keep the group focused and useful for everyone, beta participants agree to a simple commitment: complete your weekly check-in, show up for the group call when you can, and be honest about how training is going. That's it — but we take it seriously.",
  },

  form: {
    heading: "Join the free beta group",
    intro: "Tell us a little about you. We'll follow up by email with next steps.",
    submit: "Request my spot",
    submitting: "Sending…",
    privacyNote: "We'll only use your details to contact you about the RSM beta.",
    ageRanges: ["30–39", "40–49", "50–59", "60+"],
    goals: [
      "Build strength consistently",
      "Get back into training after a break",
      "Train without pain or injury flare-ups",
      "Manage stress and recover better",
      "Lose body fat sustainably",
      "Other",
    ],
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
} as const;

export type SiteConfig = typeof siteConfig;
