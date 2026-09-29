import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.seo.title,
  description: siteConfig.seo.description,
  openGraph: {
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: siteConfig.colors.background,
};

const { colors } = siteConfig;
const themeVars = {
  "--rsm-background": colors.background,
  "--rsm-surface": colors.surface,
  "--rsm-muted": colors.muted,
  "--rsm-ink": colors.ink,
  "--rsm-ink-soft": colors.inkSoft,
  "--rsm-primary": colors.primary,
  "--rsm-primary-ink": colors.primaryInk,
  "--rsm-accent": colors.accent,
  "--rsm-border": colors.border,
  "--rsm-error": colors.error,
} as CSSProperties;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={themeVars}>
      <body className="bg-background font-sans text-ink">{children}</body>
    </html>
  );
}
