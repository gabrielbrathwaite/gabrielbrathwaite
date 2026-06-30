import { cn } from "@/lib/cn";

/**
 * Prose — typographic wrapper for long-form / rich content (project narrative,
 * MDX bodies, the about page copy). We style descendants directly rather than
 * pulling in @tailwindcss/typography, keeping the dependency count down and the
 * type scale matched to our display/sans pairing.
 */
export function Prose({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "max-w-prose text-[17px] leading-relaxed text-muted",
        // Headings use the editorial serif; body stays sans.
        "[&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink",
        "[&_h3]:mt-8 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink",
        "[&_p]:mt-4",
        "[&_strong]:font-semibold [&_strong]:text-ink",
        "[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:opacity-80",
        "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1.5",
        "[&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
        // Markdown tables (problem / before-after).
        "[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
        "[&_th]:border-b [&_th]:border-border [&_th]:py-2 [&_th]:pr-4 [&_th]:text-left [&_th]:font-semibold [&_th]:text-ink",
        "[&_td]:border-b [&_td]:border-border/60 [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top",
        // Body images (screenshots in the case study).
        "[&_img]:my-6 [&_img]:w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-border",
        // Code blocks (the architecture diagram) — scroll wide content, and
        // drop the inline-code chrome inside a <pre>.
        "[&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-surface-2 [&_pre]:p-4 [&_pre]:text-xs [&_pre]:leading-relaxed",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
        className
      )}
    >
      {children}
    </div>
  );
}
