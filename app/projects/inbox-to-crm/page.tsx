import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { InboxDemo } from "@/components/inbox/InboxDemo";
import { site } from "@/lib/site";

/*
 * /projects/inbox-to-crm — the live, interactive demo for the Inbox-to-CRM
 * Automation project. This is the destination the /work card links to (instead
 * of the usual case-study page), so it stands on its own: a short framing, then
 * the working pipeline.
 */

const TITLE = "Inbox-to-CRM Automation — live demo";
const DESC =
  "An AI pipeline that turns messy inbound email into clean, routed CRM records — extract contact, intent, urgency, a summary, an owner, and a suggested reply. Try it live.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${site.url.replace(/\/$/, "")}/projects/inbox-to-crm` },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: `${site.url.replace(/\/$/, "")}/projects/inbox-to-crm`,
    type: "article",
  },
};

export default function InboxToCrmPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Inbox-to-CRM Automation",
    applicationCategory: "BusinessApplication",
    description: DESC,
    url: `${site.url.replace(/\/$/, "")}/projects/inbox-to-crm`,
    author: { "@type": "Person", name: site.name, url: site.url },
  };

  return (
    <article className="py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container>
        <Link
          href="/work"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
        >
          ← All work
        </Link>

        <header className="mt-6 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">Live demo</Badge>
            <span className="font-mono text-xs text-faint">
              AI automation · sample data
            </span>
          </div>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Inbox-to-CRM Automation
          </h1>
          <p className="mt-4 text-xl leading-relaxed text-muted">
            Messy inbound email goes in; clean, routed CRM records come out. Each
            message is read by an LLM that extracts the contact, the intent and
            urgency, a one-line summary, the queue it should land in, and a
            drafted reply — then files it where it belongs.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-faint">
            This is a working demo on a seeded inbox (no real mail). Extraction
            runs server-side on{" "}
            <span className="font-mono">claude-haiku-4-5</span>; with no API key
            or once a rate limit is hit it serves pre-computed results of the
            identical shape, so it always works.
          </p>
        </header>

        <div className="mt-12">
          <InboxDemo />
        </div>

        <div className="mt-16 border-t border-border pt-8">
          <p className="text-sm text-muted">
            Want this wired to your real inbox and CRM?{" "}
            <Link
              href="/contact"
              className="text-accent underline underline-offset-4"
            >
              Get in touch
            </Link>
            .
          </p>
        </div>
      </Container>
    </article>
  );
}
