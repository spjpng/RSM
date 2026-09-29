import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/Logo";
import { LeadForm } from "@/components/LeadForm";
import { Reveal } from "@/components/Reveal";

const FORM_ID = "join";
const container = "mx-auto w-full max-w-page px-gutter";

function SectionHeading({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-h2 font-bold text-balance ${className}`}>{children}</h2>;
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4v12M4.5 10.5 10 16l5.5-5.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4.5 10.5 3.5 3.5 7.5-8" />
    </svg>
  );
}

export default function Home() {
  const { hero, whoItsFor, includes, howItWorks, commitment, form, pricing, brand, footer } =
    siteConfig;
  const hasImage = Boolean(hero.backgroundImage);

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
            <Image src={hero.backgroundImage} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-(image:--rsm-hero-overlay)" />
          </>
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_85%_0%,color-mix(in_srgb,var(--color-primary)_14%,transparent)_0%,transparent_60%)]"
          />
        )}

        <header className={`${container} pt-6 sm:pt-8`}>
          <Logo />
        </header>

        <div className={`${container} pb-section pt-20 sm:pt-28 lg:pt-36`}>
          <p
            className={`eyebrow inline-flex animate-rise rounded-full border px-4 py-2 ${
              hasImage ? "border-on-primary/30 bg-ink/35 backdrop-blur-sm" : "border-primary/25 text-primary"
            }`}
          >
            {hero.eyebrow}
          </p>
          <h1
            className="mt-7 max-w-[13ch] animate-rise text-display font-bold text-balance"
            style={{ animationDelay: "100ms" }}
          >
            {hero.headline}
          </h1>
          <p
            className={`mt-7 max-w-prose animate-rise text-lg leading-relaxed sm:text-xl ${
              hasImage ? "text-on-primary/90" : "text-ink-muted"
            }`}
            style={{ animationDelay: "200ms" }}
          >
            {hero.subhead}
          </p>
          <div className="mt-10 animate-rise" style={{ animationDelay: "300ms" }}>
            <a href={`#${FORM_ID}`} className="btn-primary w-full sm:w-auto">
              {hero.cta}
              <ArrowIcon />
            </a>
            <p className={`mt-4 text-sm ${hasImage ? "text-on-primary/85" : "text-ink-muted"}`}>
              {pricing.beta.note}
            </p>
          </div>
        </div>
      </section>

      <main>
        {/* Who it's for */}
        <section className="bg-surface py-section">
          <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
            <Reveal className="lg:col-span-5">
              <SectionHeading>{whoItsFor.heading}</SectionHeading>
              <p className="mt-5 max-w-prose text-lg text-ink-muted">{whoItsFor.intro}</p>
            </Reveal>
            <ul className="divide-y divide-line border-y border-line lg:col-span-7">
              {whoItsFor.points.map((point, i) => (
                <Reveal as="li" key={point} delay={i * 80} className="flex gap-5 py-6">
                  <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-on-primary">
                    <CheckIcon />
                  </span>
                  <span className="text-lg">{point}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* What the beta includes */}
        <section className="py-section">
          <div className={container}>
            <Reveal>
              <SectionHeading className="max-w-[16ch]">{includes.heading}</SectionHeading>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:gap-6">
              {includes.items.map((item, i) => (
                <Reveal key={item.title} delay={(i % 2) * 100}>
                  <div className="h-full rounded-card border border-line bg-surface p-7 transition duration-300 ease-soft hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgb(28_31_26/0.35)] sm:p-9">
                  <span className="text-sm font-semibold tracking-wider text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight sm:text-2xl">{item.title}</h3>
                  <p className="mt-3 text-ink-muted">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How the 8 weeks work */}
        <section className="bg-ink py-section text-on-primary">
          <div className={container}>
            <Reveal>
              <SectionHeading className="max-w-[14ch]">{howItWorks.heading}</SectionHeading>
            </Reveal>
            <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-8">
              {howItWorks.steps.map((step, i) => (
                <Reveal as="li" key={step.label} delay={i * 100} className="border-t border-on-primary/20 pt-6">
                  <p className="eyebrow text-primary-soft">{step.label}</p>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-3 text-on-primary/80">{step.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Commitment */}
        <section className="py-section">
          <Reveal className={`${container} max-w-4xl text-center`}>
            <span aria-hidden="true" className="mx-auto block h-px w-16 bg-primary" />
            <SectionHeading className="mt-10">{commitment.heading}</SectionHeading>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl">
              {commitment.body}
            </p>
          </Reveal>
        </section>

        {/* Signup form */}
        <section id={FORM_ID} className="scroll-mt-4 bg-surface py-section">
          <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
            <Reveal className="lg:col-span-5">
              <div className="lg:sticky lg:top-12">
                <p className="eyebrow text-primary">
                  {pricing.beta.label} · {pricing.beta.price}
                </p>
                <SectionHeading className="mt-5">{form.heading}</SectionHeading>
                <p className="mt-5 max-w-prose text-lg text-ink-muted">{form.intro}</p>
              </div>
            </Reveal>
            <Reveal className="lg:col-span-7" delay={100}>
              <LeadForm />
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className={`${container} grid gap-8 py-14 text-sm text-ink-muted sm:grid-cols-2 sm:py-16`}>
          <div className="text-ink">
            <Logo />
            <p className="mt-6 max-w-md leading-relaxed text-ink-muted">{footer.note}</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end sm:text-right">
            <a
              href={`mailto:${brand.contactEmail}`}
              className="rounded-sm font-semibold text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {brand.contactEmail}
            </a>
            <p>
              © {new Date().getFullYear()} {brand.name}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
