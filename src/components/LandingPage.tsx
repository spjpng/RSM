"use client";

import Image from "next/image";
import { siteConfig } from "@/config/site";
import { AdminLock } from "@/components/AdminLock";
import { EditableText } from "@/components/edit/Editable";
import { LeadForm } from "@/components/LeadForm";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { container, Sections } from "@/components/sections";
import { useSite } from "@/components/SiteProvider";

const FORM_ID = "join";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4v12M4.5 10.5 10 16l5.5-5.5" />
    </svg>
  );
}

export function LandingPage() {
  const { content, editing, edit } = useSite();
  const { hero, pricing, brand, form, footer } = content;
  const hasImage = Boolean(siteConfig.heroBackgroundImage);

  return (
    <>
      {/* Hero */}
      <section
        className={`relative isolate overflow-hidden ${
          hasImage ? "text-on-primary [text-shadow:0_1px_24px_rgb(28_31_26/0.35)]" : "text-ink"
        }`}
      >
        {hasImage ? (
          <>
            <Image src={siteConfig.heroBackgroundImage} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-(image:--rsm-hero-overlay)" />
          </>
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_85%_0%,color-mix(in_srgb,var(--color-primary)_14%,transparent)_0%,transparent_60%)]"
          />
        )}

        <header className={`${container} pt-6 sm:pt-8`}>
          <Logo name={brand.name} />
        </header>

        <div className={`${container} pb-section pt-20 sm:pt-28 lg:pt-36`}>
          <p
            className={`eyebrow inline-flex animate-rise rounded-full border px-4 py-2 ${
              hasImage ? "border-on-primary/30 bg-ink/35 backdrop-blur-sm" : "border-primary/25 text-primary"
            }`}
          >
            <EditableText value={hero.eyebrow} onChange={(v) => edit((d) => void (d.hero.eyebrow = v))} placeholder="Eyebrow" />
          </p>
          <h1
            className="mt-7 max-w-[13ch] animate-rise text-display font-bold text-balance"
            style={{ animationDelay: "100ms" }}
          >
            <EditableText value={hero.headline} onChange={(v) => edit((d) => void (d.hero.headline = v))} placeholder="Headline" />
          </h1>
          <p
            className={`mt-7 max-w-prose animate-rise text-lg leading-relaxed sm:text-xl ${
              hasImage ? "text-on-primary/90" : "text-ink-muted"
            }`}
            style={{ animationDelay: "200ms" }}
          >
            <EditableText value={hero.subhead} onChange={(v) => edit((d) => void (d.hero.subhead = v))} placeholder="Subheadline" />
          </p>
          <div className="mt-10 animate-rise" style={{ animationDelay: "300ms" }}>
            {editing ? (
              <span className="btn-primary w-full sm:w-auto">
                <EditableText value={hero.cta} onChange={(v) => edit((d) => void (d.hero.cta = v))} placeholder="Button label" />
                <ArrowIcon />
              </span>
            ) : (
              <a href={`#${FORM_ID}`} className="btn-primary w-full sm:w-auto">
                {hero.cta}
                <ArrowIcon />
              </a>
            )}
            <EditableText
              as="p"
              className={`mt-4 text-sm ${hasImage ? "text-on-primary/85" : "text-ink-muted"}`}
              value={pricing.note}
              onChange={(v) => edit((d) => void (d.pricing.note = v))}
              placeholder="Pricing note"
            />
          </div>
        </div>
      </section>

      <main>
        <Sections />

        {/* Signup form */}
        <section id={FORM_ID} className="scroll-mt-4 bg-surface py-section">
          <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
            <Reveal className="lg:col-span-5">
              <div className="lg:sticky lg:top-12">
                <p className="eyebrow text-primary">
                  <EditableText value={pricing.label} onChange={(v) => edit((d) => void (d.pricing.label = v))} placeholder="Offer" />
                  {" · "}
                  <EditableText value={pricing.price} onChange={(v) => edit((d) => void (d.pricing.price = v))} placeholder="Price" />
                </p>
                <EditableText as="h2" className="mt-5 text-h2 font-bold text-balance" value={form.heading} onChange={(v) => edit((d) => void (d.form.heading = v))} placeholder="Heading" />
                <EditableText as="p" className="mt-5 max-w-prose text-lg text-ink-muted" value={form.intro} onChange={(v) => edit((d) => void (d.form.intro = v))} placeholder="Introduction" />
              </div>
            </Reveal>
            <Reveal className="lg:col-span-7" delay={100}>
              <LeadForm />
            </Reveal>
          </div>
        </section>
      </main>

      <footer className={`border-t border-line ${editing ? "pb-28" : ""}`}>
        <div className={`${container} grid gap-8 py-14 text-sm text-ink-muted sm:grid-cols-2 sm:py-16`}>
          <div className="text-ink">
            <Logo name={brand.name} />
            <EditableText as="p" className="mt-6 max-w-md leading-relaxed text-ink-muted" value={footer.note} onChange={(v) => edit((d) => void (d.footer.note = v))} placeholder="Footer note" />
          </div>
          <div className="flex flex-col gap-2 sm:items-end sm:text-right">
            {editing ? (
              <span className="font-semibold text-ink underline decoration-line decoration-2 underline-offset-4">
                <EditableText value={brand.contactEmail} onChange={(v) => edit((d) => void (d.brand.contactEmail = v.trim()))} placeholder="Contact email" />
              </span>
            ) : (
              brand.contactEmail && (
                <a
                  href={`mailto:${brand.contactEmail}`}
                  className="rounded-sm font-semibold text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  {brand.contactEmail}
                </a>
              )
            )}
            <p className="flex items-center gap-2 sm:justify-end">
              <span>
                © {new Date().getFullYear()}{" "}
                <EditableText value={brand.name} onChange={(v) => edit((d) => void (d.brand.name = v))} placeholder="Brand name" />
              </span>
              <AdminLock />
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
