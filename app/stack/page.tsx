import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/ui/Section";
import { StackExplorer } from "@/components/stack/StackExplorer";
import { stack } from "@/lib/stack";

export const metadata: Metadata = {
  title: "Stack",
  description:
    "The tools I build with and why — the reasoning behind each choice, not a logo wall.",
};

/*
 * /stack — what I build with and why. Interactive: click a tool to read the
 * reasoning. Content lives in lib/stack.ts.
 */
export default function StackPage() {
  return (
    <Section className="pt-16 sm:pt-20">
      <header className="mb-12 max-w-2xl">
        <Eyebrow>Stack</Eyebrow>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          What I build with, and why.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Not a wall of logos. Every tool here earns its place — tap any one for
          the reasoning behind the choice.
        </p>
      </header>

      <StackExplorer groups={stack} />
    </Section>
  );
}
