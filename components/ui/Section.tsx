import { cn } from "@/lib/cn";

/**
 * Container — the shared horizontal measure + padding. Everything sits inside
 * one of these so all pages share the same left/right rhythm.
 */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-content px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

/**
 * Section — a vertical band of the page with consistent spacing, optionally
 * wrapped in a <section> with an id (for in-page nav / the command palette).
 *
 * Use `bleed` to let the section's background run full-width while the content
 * stays in the Container measure.
 */
export function Section({
  id,
  className,
  containerClassName,
  bleed = false,
  children,
}: {
  id?: string;
  className?: string;
  containerClassName?: string;
  bleed?: boolean;
  children: React.ReactNode;
}) {
  const inner = <Container className={containerClassName}>{children}</Container>;
  return (
    <section
      id={id}
      className={cn("py-16 sm:py-24", className)}
      // When a section has its own background, scroll-margin keeps anchored
      // jumps from hiding behind the sticky nav.
      style={id ? { scrollMarginTop: "5rem" } : undefined}
    >
      {bleed ? children : inner}
    </section>
  );
}

/**
 * Eyebrow — the small uppercase label that sits above a section heading.
 * A recurring editorial device; centralized so it stays consistent.
 */
export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "font-mono text-xs uppercase tracking-[0.18em] text-accent",
        className
      )}
    >
      {children}
    </p>
  );
}
