import Link from "next/link";
import { Section, Eyebrow } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FeaturedReel } from "@/components/home/FeaturedReel";
import { WhatIDo } from "@/components/home/WhatIDo";
import { getFeaturedProjects } from "@/lib/projects";
import { site } from "@/lib/site";

/*
 * HOME — composed top to bottom:
 *   1. Hero (who I am / what I build / who for / one proof line + CTA)
 *   2. Featured reel (3 projects, pulled from data, with near-live previews)
 *   3. What I do (outcomes, interactive)
 *   4. CTA band
 *
 * Server component: it loads the featured projects at build time and passes
 * them to the client reel. No project is hardcoded here.
 */
export default function Home() {
  const featured = getFeaturedProjects(3);

  return (
    <>
      {/* 1 — HERO */}
      <Section className="pt-20 sm:pt-28">
        <div className="max-w-3xl">
          <Badge tone="accent" withDot>
            Available for new projects
          </Badge>

          <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl md:text-7xl">
            Software that does
            <br />
            the work for you.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            I&rsquo;m {site.name.split(" ")[0]} — a Brooklyn developer building{" "}
            <span className="text-ink">AI automation</span>,{" "}
            <span className="text-ink">internal tools</span>, and{" "}
            <span className="text-ink">dashboards</span> for small businesses.
            The kind of software that quietly removes hours of manual work every
            week.
          </p>

          <p className="mt-5 font-mono text-sm text-faint">
            Most recent build: a gated staff dashboard with OAuth, a Supabase
            backend, and real-time data — running in production today.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button href="/contact">Book a call</Button>
            <Button href="/work" variant="secondary">
              See the work
            </Button>
          </div>
        </div>
      </Section>

      {/* 2 — FEATURED REEL */}
      {featured.length > 0 && (
        <Section className="pt-4">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <Eyebrow>Selected work</Eyebrow>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                A few things I&rsquo;ve shipped.
              </h2>
            </div>
            <Link
              href="/work"
              className="hidden shrink-0 text-sm font-medium text-accent underline underline-offset-4 hover:opacity-80 sm:inline"
            >
              All work →
            </Link>
          </div>
          <FeaturedReel projects={featured} />
        </Section>
      )}

      {/* 3 — WHAT I DO (outcomes) */}
      <Section>
        <div className="mb-10 max-w-2xl">
          <Eyebrow>What you get</Eyebrow>
          <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            You bring the bottleneck. I build the fix.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Not a list of technologies — a list of outcomes. Hover any row for a
            real example.
          </p>
        </div>
        <WhatIDo />
      </Section>

      {/* 4 — CTA BAND */}
      <Section>
        <div className="overflow-hidden rounded-3xl border border-border bg-surface px-6 py-14 text-center sm:px-12 sm:py-20">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Have a process that should run itself?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Tell me what&rsquo;s eating your week. If I&rsquo;m the right fit,
            we&rsquo;ll scope it. If I&rsquo;m not, I&rsquo;ll point you
            somewhere better.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/contact">Book a call</Button>
            <Button href={`mailto:${site.email}`} variant="secondary">
              Email me
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
