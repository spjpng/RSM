"use client";

import { useLayoutEffect, useRef, type ElementType, type ReactNode } from "react";
import { useSite } from "@/components/SiteProvider";

type TextProps = {
  value: string;
  onChange: (value: string) => void;
  as?: ElementType;
  className?: string;
  /** Shown while the text is empty in edit mode. */
  placeholder?: string;
};

/** Plain text for visitors; click-to-edit inline text in edit mode. */
export function EditableText({ value, onChange, as: Tag = "span", className, placeholder = "Type here…" }: TextProps) {
  const { editing } = useSite();
  if (!editing) {
    if (Tag === "span" && !className) return <>{value}</>;
    // Visitors never see empty headings or paragraphs the admin cleared.
    return value ? <Tag className={className}>{value}</Tag> : null;
  }
  return <InlineEditor {...{ value, onChange, Tag, className, placeholder }} />;
}

function InlineEditor({
  value,
  onChange,
  Tag,
  className,
  placeholder,
}: Omit<TextProps, "as"> & { Tag: ElementType }) {
  const ref = useRef<HTMLElement>(null);

  // The DOM owns the text while typing; sync it from state only when it changed elsewhere
  // (discard, reorder, a live update), so the caret never jumps.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && el.textContent !== value && document.activeElement !== el) el.textContent = value;
  }, [value]);

  return (
    <Tag
      ref={ref}
      data-editable=""
      data-placeholder={placeholder}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      role="textbox"
      aria-label={placeholder}
      spellCheck
      className={className}
      onInput={(e: React.FormEvent<HTMLElement>) => onChange(e.currentTarget.textContent ?? "")}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      onPaste={(e: React.ClipboardEvent<HTMLElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain").replace(/\s*\n\s*/g, " ");
        document.execCommand("insertText", false, text);
      }}
      // Keep clicks from following links or toggling parents while editing.
      onClick={(e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    />
  );
}

type Tone = "light" | "dark";

const controlTone: Record<Tone, string> = {
  light: "border-line bg-surface text-ink shadow-sm hover:bg-background",
  dark: "border-on-primary/25 bg-ink text-on-primary hover:bg-on-primary/10",
};

/** Move up / move down / delete buttons for one item in a list. Edit mode only. */
export function ItemControls({
  index,
  count,
  onMove,
  onDelete,
  label = "item",
  tone = "light",
  className = "absolute -top-3 right-2 z-10",
  minItems = 0,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onDelete: () => void;
  label?: string;
  tone?: Tone;
  className?: string;
  minItems?: number;
}) {
  const { editing } = useSite();
  if (!editing) return null;
  const btn = "grid h-7 w-7 place-items-center rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 text-xs font-semibold ${controlTone[tone]} ${className}`}
    >
      <button type="button" className={btn} disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={`Move ${label} up`} title="Move up">
        <Chevron dir="up" />
      </button>
      <button type="button" className={btn} disabled={index === count - 1} onClick={() => onMove(index, index + 1)} aria-label={`Move ${label} down`} title="Move down">
        <Chevron dir="down" />
      </button>
      <button
        type="button"
        className={`${btn} hover:text-error`}
        disabled={count <= minItems}
        onClick={() => {
          if (window.confirm(`Delete this ${label}?`)) onDelete();
        }}
        aria-label={`Delete ${label}`}
        title="Delete"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M5 5l10 10M15 5 5 15" />
        </svg>
      </button>
    </span>
  );
}

/** Dashed "+ Add …" button shown at the end of lists in edit mode. */
export function AddButton({
  onClick,
  children,
  tone = "light",
  className = "",
}: {
  onClick: () => void;
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const { editing } = useSite();
  if (!editing) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border border-dashed px-4 py-2 text-sm font-semibold transition-colors ${
        tone === "dark"
          ? "border-on-primary/40 text-on-primary/85 hover:border-on-primary hover:text-on-primary"
          : "border-primary/40 text-primary hover:border-primary hover:bg-primary/5"
      } ${className}`}
    >
      <span aria-hidden="true" className="text-base leading-none">+</span>
      {children}
    </button>
  );
}

function Chevron({ dir }: { dir: "up" | "down" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === "up" ? "M5 12.5 10 7.5l5 5" : "M5 7.5l5 5 5-5"} />
    </svg>
  );
}
