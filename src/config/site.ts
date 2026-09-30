/**
 * Settings that stay in code: logo, hero photo, and SEO.
 * All visible copy (headlines, sections, form fields, pricing, footer) lives in
 * Firestore and is edited on the site; its defaults are in ./content.ts.
 * Fonts, colors, and spacing live in ./theme.ts.
 */

export const siteConfig = {
  // Set `src` to a file in /public (e.g. "/logo.svg") to use an image logo.
  // When `src` is empty, a text mark built from `mark` is shown instead.
  logo: {
    src: "" as string,
    alt: "Regulated Strength Method logo",
    mark: "RSM",
    width: 40,
    height: 40,
  },

  // Optional photo behind the hero, e.g. "/hero.jpg" in /public. A soft overlay
  // (theme.heroOverlay) keeps the text readable. Leave empty for a plain background.
  heroBackgroundImage: "" as string,

  seo: {
    title: "Regulated Strength Method | Get stronger without burning out",
    description:
      "An online coaching program for adults 30+ who want accountability and sustainable consistency. Join the free 8-week beta group.",
  },
} as const;

export type SiteConfig = typeof siteConfig;
