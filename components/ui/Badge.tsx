import { cn } from "@/lib/cn";

/**
 * Badge — a small status / tag pill. `tone` picks the color treatment.
 *  - default: neutral, for tags
 *  - accent:  ember, for emphasis
 *  - live / case-study / wip: project status colors (used on cards + detail)
 */
type Tone = "default" | "accent" | "live" | "demo" | "case-study" | "wip";

const TONES: Record<Tone, string> = {
  default: "border-border bg-surface-2 text-muted",
  accent: "border-accent/30 bg-accent/10 text-accent",
  live: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  // "demo" = an explorable demo (interactive, but not production) — the ember accent.
  demo: "border-accent/30 bg-accent/10 text-accent",
  "case-study": "border-border bg-surface-2 text-muted",
  wip: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

// Human-readable labels for the status tones.
const STATUS_LABEL: Partial<Record<Tone, string>> = {
  live: "Live",
  demo: "Demo",
  "case-study": "Case study",
  wip: "In progress",
};

export function Badge({
  tone = "default",
  withDot = false,
  className,
  children,
}: {
  tone?: Tone;
  withDot?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-wide",
        TONES[tone],
        className
      )}
    >
      {withDot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      )}
      {children ?? STATUS_LABEL[tone] ?? null}
    </span>
  );
}
