import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

/**
 * 404 — intentional, on-brand, and useful (offers the way back). Rendered
 * inside the root layout, so nav, footer, and the ⌘K palette are all present.
 */
export default function NotFound() {
  return (
    <Section className="pt-24 sm:pt-32">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-accent">
          404
        </p>
        <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          This page wandered off.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          The link&rsquo;s broken or the page moved. No dead ends here — head
          back, or hit{" "}
          <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs text-faint">
            ⌘K
          </kbd>{" "}
          to jump anywhere.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/">Back home</Button>
          <Button href="/work" variant="secondary">
            See the work
          </Button>
        </div>
      </div>
    </Section>
  );
}
