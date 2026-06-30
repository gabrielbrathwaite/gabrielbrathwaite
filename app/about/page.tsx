import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import Reveal from "@/components/fx/Reveal";
import { AboutHero } from "@/components/about/AboutHero";
import { ProcessFlow } from "@/components/about/ProcessFlow";
import { Strengths } from "@/components/about/Strengths";
import { story, offTheClock } from "@/lib/about";

export const metadata: Metadata = {
  title: "About",
  description:
    "How I got here, how I work, and what you get when we build something together.",
};

/*
 * /about — the immersive page. A sequence of self-contained interactive units:
 *   hero (motion signature) → story (expandable decision points) → process
 *   (interactive flow) → strengths (give→get) → personality → CTA.
 *
 * Every interaction reveals real content, nothing traps the reader, and it all
 * degrades to readable static under prefers-reduced-motion / no-JS (the story
 * uses native <details>; the interactive bits keep their content in the DOM).
 */
export default function AboutPage() {
  return (
    <>
      <Section className="pt-16 sm:pt-20">
        <AboutHero />
      </Section>

      {/* THE STORY — native <details> so it expands even without JS. */}
      <Section className="pt-0">
        <Reveal>
          <Eyebrow>The story</Eyebrow>
          <h2 className="mt-2 max-w-2xl font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Three turns that got me here.
          </h2>
          <p className="mt-3 text-muted">Open any one to read the detail.</p>
        </Reveal>

        <div className="mt-8 border-t border-border">
          {story.map((step, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <details className="group border-b border-border py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-start gap-5">
                  <span className="mt-1 font-mono text-xs uppercase tracking-[0.15em] text-accent sm:w-36 sm:shrink-0">
                    {step.marker}
                  </span>
                  <span className="flex-1">
                    <span className="block font-serif text-xl font-semibold text-ink sm:text-2xl">
                      {step.title}
                    </span>
                    <span className="mt-1 block text-muted">{step.summary}</span>
                  </span>
                  {/* Chevron rotates when open. */}
                  <svg
                    className="mt-1.5 h-5 w-5 shrink-0 text-faint transition-transform group-open:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/90 sm:pl-[10.25rem]">
                  {step.detail}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* HOW I WORK */}
      <Section>
        <Reveal>
          <Eyebrow>How I work</Eyebrow>
          <h2 className="mt-2 max-w-2xl font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            What working together actually looks like.
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            Click through the phases — this is the whole engagement, start to
            finish.
          </p>
        </Reveal>
        <div className="mt-8">
          <ProcessFlow />
        </div>
      </Section>

      {/* WHAT I'M GOOD AT */}
      <Section>
        <Reveal>
          <Eyebrow>What I&rsquo;m good at</Eyebrow>
          <h2 className="mt-2 max-w-2xl font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Give me the problem. Here&rsquo;s what comes back.
          </h2>
        </Reveal>
        <div className="mt-8">
          <Strengths />
        </div>
      </Section>

      {/* OFF THE CLOCK */}
      <Section>
        <Reveal>
          <div className="max-w-2xl">
            <Eyebrow>Off the clock</Eyebrow>
            <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {offTheClock.title}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              {offTheClock.body}
            </p>
          </div>
        </Reveal>
      </Section>

      {/* CTA */}
      <Section>
        <Reveal>
          <div className="rounded-3xl border border-border bg-surface px-6 py-14 text-center sm:px-12 sm:py-16">
            <h2 className="mx-auto max-w-xl font-serif text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
              That&rsquo;s me. Now tell me about the thing you keep meaning to
              fix.
            </h2>
            <div className="mt-7 flex justify-center">
              <Button href="/contact">Start a conversation</Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
