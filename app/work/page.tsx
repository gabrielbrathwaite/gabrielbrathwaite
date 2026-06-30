import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { WorkIndex } from "@/components/work/WorkIndex";
import { getAllProjects, getAllTags } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected projects — AI automation, internal tools, and dashboards for small businesses.",
};

/*
 * /work — the project index. Server component: it loads + validates projects at
 * build time and hands the typed data to the interactive <WorkIndex> client
 * component for filtering and sorting.
 */
export default function WorkPage() {
  const projects = getAllProjects();
  const tags = getAllTags();

  return (
    <Section className="pt-16 sm:pt-20">
      <header className="mb-12 max-w-2xl">
        <Eyebrow>Work</Eyebrow>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Things I&rsquo;ve built.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          A small, honest selection. Each one removed real manual work for a
          real team — open any project to see the problem, the approach, and the
          result.
        </p>
      </header>

      {projects.length === 0 ? (
        // Zero-project state (e.g. before any content exists). Intentional, not
        // a broken page.
        <div className="rounded-2xl border border-dashed border-border bg-surface-2/40 py-20 text-center">
          <p className="font-serif text-2xl text-ink">New work, incoming.</p>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Projects are being written up right now. In the meantime, the fastest
            way to see what I build is to ask.
          </p>
          <div className="mt-6 flex justify-center">
            <Button href="/contact">Start a conversation</Button>
          </div>
        </div>
      ) : (
        <WorkIndex projects={projects} tags={tags} />
      )}
    </Section>
  );
}
