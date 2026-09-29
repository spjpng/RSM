import { siteConfig } from "@/config/site";
import { Logo } from "@/components/Logo";
import { LeadForm } from "@/components/LeadForm";

const FORM_ID = "join";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-2xl text-ink sm:text-3xl">{children}</h2>;
}

export default function Home() {
  const { hero, whoItsFor, includes, howItWorks, commitment, form, pricing, brand, footer } =
    siteConfig;

  return (
    <>
      <header className="mx-auto flex max-w-3xl items-center px-5 pt-6 sm:px-8">
        <Logo />
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">{hero.eyebrow}</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-ink sm:text-5xl">
            {hero.headline}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">{hero.subhead}</p>
          <a
            href={`#${FORM_ID}`}
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 text-base font-medium text-primary-ink transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 sm:w-auto"
          >
            {hero.cta}
          </a>
          <p className="mt-3 text-sm text-ink-soft">{pricing.beta.note}</p>
        </section>

        {/* Who it's for */}
        <section className="bg-muted">
          <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
            <SectionHeading>{whoItsFor.heading}</SectionHeading>
            <p className="mt-3 text-ink-soft">{whoItsFor.intro}</p>
            <ul className="mt-6 space-y-3">
              {whoItsFor.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="text-ink">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* What the beta includes */}
        <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <SectionHeading>{includes.heading}</SectionHeading>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {includes.items.map((item) => (
              <div key={item.title} className="rounded-2xl border border-line bg-surface p-5">
                <h3 className="font-medium text-ink">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How the 8 weeks work */}
        <section className="bg-muted">
          <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
            <SectionHeading>{howItWorks.heading}</SectionHeading>
            <ol className="mt-6 space-y-6 border-l border-line pl-6">
              {howItWorks.steps.map((step) => (
                <li key={step.label} className="relative">
                  <span aria-hidden="true" className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">{step.label}</p>
                  <h3 className="mt-1 font-medium text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Commitment */}
        <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="rounded-2xl border-l-4 border-accent bg-surface p-6 sm:p-8">
            <h2 className="font-serif text-xl text-ink sm:text-2xl">{commitment.heading}</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">{commitment.body}</p>
          </div>
        </section>

        {/* Signup form */}
        <section id={FORM_ID} className="scroll-mt-6 bg-muted">
          <div className="mx-auto max-w-xl px-5 py-14 sm:px-8 sm:py-20">
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-accent">
              {pricing.beta.label} · {pricing.beta.price}
            </p>
            <SectionHeading>{form.heading}</SectionHeading>
            <p className="mb-6 mt-3 text-ink-soft">{form.intro}</p>
            <LeadForm />
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-3xl px-5 py-10 text-sm text-ink-soft sm:px-8">
        <Logo />
        <p className="mt-4 leading-relaxed">{footer.note}</p>
        <p className="mt-4">
          <a href={`mailto:${brand.contactEmail}`} className="underline underline-offset-4 hover:text-ink">
            {brand.contactEmail}
          </a>
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} {brand.name}
        </p>
      </footer>
    </>
  );
}
