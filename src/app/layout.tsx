import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { siteConfig } from "@/config/site";
import { fontSans, theme, themeCssVars } from "@/config/theme";
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
  themeColor: theme.colors.background,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontSans.variable} style={themeCssVars as CSSProperties}>
      <body className="bg-background font-sans text-base leading-relaxed text-ink">{children}</body>
    </html>
  );
}
