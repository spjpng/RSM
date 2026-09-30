"use client";

import type {
  CardsSection,
  ChecklistSection,
  FaqSection,
  Section,
  SectionType,
  StepsSection,
  TextSection,
} from "@/config/content";
import { AddButton, EditableText, ItemControls } from "@/components/edit/Editable";
import { Reveal } from "@/components/Reveal";
import { useSite } from "@/components/SiteProvider";
import { move, newSection, SECTION_LABELS } from "@/lib/content";

export const container = "mx-auto w-full max-w-page px-gutter";
const h2 = "text-h2 font-bold text-balance";

type Update<S> = (fn: (section: S) => void) => void;
type BlockProps<S> = { section: S; update: Update<S> };

/** Move/remove/add helpers for an array inside a section. */
function listOps<T>(update: (fn: (list: T[]) => void) => void) {
  return {
    move: (from: number, to: number) => update((l) => move(l, from, to)),
    remove: (i: number) => update((l) => void l.splice(i, 1)),
    add: (item: T) => update((l) => void l.push(item)),
  };
}

/** Renders the reorderable sections between the hero and the signup form. */
export function Sections() {
  const { content, edit, editing } = useSite();
  const { sections } = content;

  const updateSection = (id: string) => (fn: (s: Section) => void) =>
    edit((d) => {
      const s = d.sections.find((x) => x.id === id);
      if (s) fn(s);
    });
  const moveSection = (from: number, to: number) => edit((d) => move(d.sections, from, to));
  const removeSection = (i: number) => edit((d) => void d.sections.splice(i, 1));
  const insertSection = (at: number, type: SectionType) =>
    edit((d) => void d.sections.splice(at, 0, newSection(type)));

  return (
    <>
      {editing && <SectionInserter onInsert={(t) => insertSection(0, t)} />}
      {sections.map((section, i) => {
        const block = <Block section={section} update={updateSection(section.id)} />;
        if (!editing) return <div key={section.id}>{block}</div>;
        return (
          <div key={section.id} className="relative">
            <div className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-surface py-0.5 pl-4 pr-0.5 text-xs font-semibold text-ink shadow-sm">
              {SECTION_LABELS[section.type]} section
              <ItemControls
                index={i}
                count={sections.length}
                onMove={moveSection}
                onDelete={() => removeSection(i)}
                label="section"
                className="border-0 shadow-none"
              />
            </div>
            {block}
            <SectionInserter onInsert={(t) => insertSection(i + 1, t)} />
          </div>
        );
      })}
    </>
  );
}

function Block({ section, update }: { section: Section; update: Update<Section> }) {
  const u = update as Update<never>;
  switch (section.type) {
    case "checklist":
      return <ChecklistBlock section={section} update={u} />;
    case "cards":
      return <CardsBlock section={section} update={u} />;
    case "steps":
      return <StepsBlock section={section} update={u} />;
    case "text":
      return <TextBlock section={section} update={u} />;
    case "faq":
      return <FaqBlock section={section} update={u} />;
  }
}

function SectionInserter({ onInsert }: { onInsert: (type: SectionType) => void }) {
  return (
    <div className="relative flex justify-center py-3">
      <span aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t border-dashed border-primary/30" />
      <select
        aria-label="Add a section here"
        value=""
        onChange={(e) => {
          if (e.target.value) onInsert(e.target.value as SectionType);
        }}
        className="relative cursor-pointer appearance-none rounded-full border border-dashed border-primary/50 bg-background px-4 py-1.5 text-center text-sm font-semibold text-primary hover:border-primary"
      >
        <option value="">+ Add section here</option>
        {(Object.keys(SECTION_LABELS) as SectionType[]).map((t) => (
          <option key={t} value={t}>
            {SECTION_LABELS[t]}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4.5 10.5 3.5 3.5 7.5-8" />
    </svg>
  );
}

function ChecklistBlock({ section, update }: BlockProps<ChecklistSection>) {
  const items = listOps<string>((fn) => update((s) => fn(s.items)));
  return (
    <section className="bg-surface py-section">
      <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
        <Reveal className="lg:col-span-5">
          <EditableText as="h2" className={h2} value={section.heading} onChange={(v) => update((s) => void (s.heading = v))} placeholder="Heading" />
          <EditableText as="p" className="mt-5 max-w-prose text-lg text-ink-muted" value={section.intro} onChange={(v) => update((s) => void (s.intro = v))} placeholder="Introduction" />
        </Reveal>
        <div className="lg:col-span-7">
          <ul className="divide-y divide-line border-y border-line">
            {section.items.map((point, i) => (
              <Reveal as="li" key={i} delay={i * 80} className="relative flex gap-5 py-6">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-on-primary">
                  <CheckIcon />
                </span>
                <EditableText className="text-lg" value={point} onChange={(v) => update((s) => void (s.items[i] = v))} placeholder="Point" />
                <ItemControls index={i} count={section.items.length} onMove={items.move} onDelete={() => items.remove(i)} label="point" />
              </Reveal>
            ))}
          </ul>
          <AddButton className="mt-6" onClick={() => items.add("New point")}>
            Add point
          </AddButton>
        </div>
      </div>
    </section>
  );
}

function CardsBlock({ section, update }: BlockProps<CardsSection>) {
  const items = listOps<CardsSection["items"][number]>((fn) => update((s) => fn(s.items)));
  return (
    <section className="py-section">
      <div className={container}>
        <Reveal>
          <EditableText as="h2" className={`${h2} max-w-[16ch]`} value={section.heading} onChange={(v) => update((s) => void (s.heading = v))} placeholder="Heading" />
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:gap-6">
          {section.items.map((item, i) => (
            <Reveal key={i} delay={(i % 2) * 100} className="relative">
              <div className="h-full rounded-card border border-line bg-surface p-7 transition duration-300 ease-soft hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgb(28_31_26/0.35)] sm:p-9">
                <span className="text-sm font-semibold tracking-wider text-primary">{String(i + 1).padStart(2, "0")}</span>
                <EditableText as="h3" className="mt-6 text-xl font-semibold tracking-tight sm:text-2xl" value={item.title} onChange={(v) => update((s) => void (s.items[i].title = v))} placeholder="Title" />
                <EditableText as="p" className="mt-3 text-ink-muted" value={item.body} onChange={(v) => update((s) => void (s.items[i].body = v))} placeholder="Description" />
              </div>
              <ItemControls index={i} count={section.items.length} onMove={items.move} onDelete={() => items.remove(i)} label="card" className="absolute right-4 top-4 z-10" />
            </Reveal>
          ))}
        </div>
        <AddButton className="mt-8" onClick={() => items.add({ title: "New benefit", body: "Describe this benefit." })}>
          Add card
        </AddButton>
      </div>
    </section>
  );
}

function StepsBlock({ section, update }: BlockProps<StepsSection>) {
  const items = listOps<StepsSection["items"][number]>((fn) => update((s) => fn(s.items)));
  return (
    <section className="bg-ink py-section text-on-primary">
      <div className={container}>
        <Reveal>
          <EditableText as="h2" className={`${h2} max-w-[14ch]`} value={section.heading} onChange={(v) => update((s) => void (s.heading = v))} placeholder="Heading" />
        </Reveal>
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-8">
          {section.items.map((step, i) => (
            <Reveal as="li" key={i} delay={i * 100} className="relative border-t border-on-primary/20 pt-6">
              <EditableText as="p" className="eyebrow text-primary-soft" value={step.label} onChange={(v) => update((s) => void (s.items[i].label = v))} placeholder="Label" />
              <EditableText as="h3" className="mt-4 text-xl font-semibold tracking-tight" value={step.title} onChange={(v) => update((s) => void (s.items[i].title = v))} placeholder="Title" />
              <EditableText as="p" className="mt-3 text-on-primary/80" value={step.body} onChange={(v) => update((s) => void (s.items[i].body = v))} placeholder="Description" />
              <ItemControls index={i} count={section.items.length} onMove={items.move} onDelete={() => items.remove(i)} label="step" tone="dark" className="absolute -top-4 right-0 z-10" />
            </Reveal>
          ))}
        </ol>
        <AddButton tone="dark" className="mt-10" onClick={() => items.add({ label: `Step ${section.items.length + 1}`, title: "New step", body: "Describe this step." })}>
          Add step
        </AddButton>
      </div>
    </section>
  );
}

function TextBlock({ section, update }: BlockProps<TextSection>) {
  return (
    <section className="py-section">
      <Reveal className={`${container} max-w-4xl text-center`}>
        <span aria-hidden="true" className="mx-auto block h-px w-16 bg-primary" />
        <EditableText as="h2" className={`${h2} mt-10`} value={section.heading} onChange={(v) => update((s) => void (s.heading = v))} placeholder="Heading" />
        <EditableText as="p" className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl" value={section.body} onChange={(v) => update((s) => void (s.body = v))} placeholder="Text" />
      </Reveal>
    </section>
  );
}

function FaqBlock({ section, update }: BlockProps<FaqSection>) {
  const { editing } = useSite();
  const items = listOps<FaqSection["items"][number]>((fn) => update((s) => fn(s.items)));
  return (
    <section className="border-t border-line py-section">
      <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
        <Reveal className="lg:col-span-5">
          <EditableText as="h2" className={h2} value={section.heading} onChange={(v) => update((s) => void (s.heading = v))} placeholder="Heading" />
        </Reveal>
        <div className="lg:col-span-7">
          <div className="divide-y divide-line border-y border-line">
            {section.items.map((item, i) =>
              editing ? (
                <div key={i} className="relative py-6">
                  <EditableText as="h3" className="pr-28 text-lg font-semibold" value={item.question} onChange={(v) => update((s) => void (s.items[i].question = v))} placeholder="Question" />
                  <EditableText as="p" className="mt-3 max-w-prose text-ink-muted" value={item.answer} onChange={(v) => update((s) => void (s.items[i].answer = v))} placeholder="Answer" />
                  <ItemControls index={i} count={section.items.length} onMove={items.move} onDelete={() => items.remove(i)} label="question" className="absolute right-0 top-5 z-10" />
                </div>
              ) : (
                <Reveal key={i} delay={i * 80}>
                  <details className="group py-6">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-6 rounded-sm text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                      {item.question}
                      <span aria-hidden="true" className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-primary/30 text-primary transition-transform duration-300 ease-soft group-open:rotate-45">
                        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                          <path d="M10 4v12M4 10h12" />
                        </svg>
                      </span>
                    </summary>
                    <p className="mt-3 max-w-prose pr-12 text-ink-muted">{item.answer}</p>
                  </details>
                </Reveal>
              ),
            )}
          </div>
          <AddButton className="mt-6" onClick={() => items.add({ question: "New question?", answer: "The answer." })}>
            Add question
          </AddButton>
        </div>
      </div>
    </section>
  );
}
