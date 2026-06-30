/**
 * cn — join class names, dropping falsy values.
 *
 * A deliberately tiny replacement for `clsx`. It does NOT de-dupe conflicting
 * Tailwind classes (that's what `tailwind-merge` does); our primitives are
 * structured so the caller's classes come last and naturally win, which is
 * enough. If we ever need true conflict resolution, this is the seam to swap.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
