/**
 * Design tokens: fonts, colors, spacing, type scale, radii, and motion.
 * Edit values here to restyle the whole site. Each token is exposed as a CSS variable
 * on <html> (see layout.tsx) and mapped to Tailwind utilities in globals.css, e.g.
 * colors.primary -> bg-primary / text-primary, spacing.section -> py-section,
 * type.display -> text-display, radius.card -> rounded-card.
 */
import { Poppins } from "next/font/google";

// Headings and buttons use 600/700; body text uses 400. Add weights here if needed.
export const fontSans = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const theme = {
  // Three-color palette: warm cream, deep ink, moss green. The rest are tints of those
  // three (plus a functional error red). All text pairs meet WCAG AA contrast.
  colors: {
    background: "#F5F2EC", // cream: page background
    surface: "#FFFDF9", // lightest cream: cards, fields, alt sections
    ink: "#1C1F1A", // deep ink: headings, body, dark section
    inkMuted: "#51564C", // ink tint: secondary text on light backgrounds
    primary: "#3F4F37", // moss: buttons, accents
    primaryHover: "#2F3C29", // moss, darker: button hover
    primarySoft: "#B7C4AA", // moss tint: accents on the dark section
    onPrimary: "#F5F2EC", // text on moss and ink
    line: "#E0DBD0", // hairlines and borders
    error: "#A23A2C",
  },

  // Overlay drawn over the hero background image (siteConfig.hero.backgroundImage).
  // Soft at the top, deeper behind the text so it stays readable on any photo.
  heroOverlay:
    "linear-gradient(180deg, rgba(28,31,26,0.45) 0%, rgba(28,31,26,0.60) 45%, rgba(28,31,26,0.80) 100%)",

  spacing: {
    gutter: "clamp(1.25rem, 5vw, 3rem)", // page side padding
    section: "clamp(5.5rem, 12vw, 10rem)", // vertical padding of each section
    container: "76rem", // max page width
    prose: "40rem", // max width for paragraphs
  },

  type: {
    display: "clamp(2.9rem, 11vw, 6.25rem)", // hero headline
    displayTracking: "-0.045em",
    h2: "clamp(2rem, 5.5vw, 3.5rem)", // section headings
    h2Tracking: "-0.03em",
  },

  radius: {
    card: "1.75rem",
    field: "0.875rem",
  },

  motion: {
    duration: "900ms",
    distance: "24px", // how far elements rise while fading in
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
} as const;

/** Flattens the tokens into CSS variables consumed by globals.css. */
export const themeCssVars: Record<string, string> = {
  "--rsm-background": theme.colors.background,
  "--rsm-surface": theme.colors.surface,
  "--rsm-ink": theme.colors.ink,
  "--rsm-ink-muted": theme.colors.inkMuted,
  "--rsm-primary": theme.colors.primary,
  "--rsm-primary-hover": theme.colors.primaryHover,
  "--rsm-primary-soft": theme.colors.primarySoft,
  "--rsm-on-primary": theme.colors.onPrimary,
  "--rsm-line": theme.colors.line,
  "--rsm-error": theme.colors.error,
  "--rsm-hero-overlay": theme.heroOverlay,
  "--rsm-space-gutter": theme.spacing.gutter,
  "--rsm-space-section": theme.spacing.section,
  "--rsm-container": theme.spacing.container,
  "--rsm-prose": theme.spacing.prose,
  "--rsm-text-display": theme.type.display,
  "--rsm-tracking-display": theme.type.displayTracking,
  "--rsm-text-h2": theme.type.h2,
  "--rsm-tracking-h2": theme.type.h2Tracking,
  "--rsm-radius-card": theme.radius.card,
  "--rsm-radius-field": theme.radius.field,
  "--rsm-motion-duration": theme.motion.duration,
  "--rsm-motion-distance": theme.motion.distance,
  "--rsm-motion-easing": theme.motion.easing,
};
