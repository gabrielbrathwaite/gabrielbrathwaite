import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { Container } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Prose } from "@/components/ui/Prose";
import { LiveDemo } from "@/components/work/LiveDemo";
import {
  getAllProjects,
  getProject,
  getProjectNeighbours,
} from "@/lib/projects";

/*
 * /work/[slug] — ONE template, driven entirely by frontmatter. Adding a project
 * never touches this file. Statically generated for every project at build.
 */

// Pre-render a static page per project.
export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

// Per-project metadata (title + description + share preview).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.tagline,
    openGraph: { title: project.title, description: project.tagline },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { prev, next } = getProjectNeighbours(slug);

  return (
    <article className="py-12 sm:py-16">
      <Container>
        {/* Back link. */}
        <Link
          href="/work"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
        >
          ← All work
        </Link>

        {/* Hero. */}
        <header className="mt-6 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={project.status} withDot={project.status === "live"} />
            {project.client && (
              <span className="font-mono text-xs text-faint">
                {project.client} · {project.timeframe}
              </span>
            )}
          </div>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 text-xl leading-relaxed text-muted">
            {project.tagline}
          </p>

          {/* Demo + repo buttons (only when a URL exists). */}
          {(project.demoUrl || project.repoUrl) && (
            <div className="mt-7 flex flex-wrap gap-3">
              {project.demoUrl && (
                <Button href={project.demoUrl}>Visit live site ↗</Button>
              )}
              {project.repoUrl && (
                <Button href={project.repoUrl} variant="secondary">
                  View code ↗
                </Button>
              )}
            </div>
          )}
        </header>

        {/* Live demo block — only rendered when there's something to show. */}
        {project.embed !== "none" && (
          <div className="mt-12">
            <LiveDemo project={project} />
          </div>
        )}

        {/* Narrative + sidebar. */}
        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr]">
          {/* Problem → Approach → Outcome. */}
          <div className="space-y-10">
            <NarrativeBlock label="The problem" body={project.problem} />
            <NarrativeBlock label="The approach" body={project.approach} />
            <NarrativeBlock label="The outcome" body={project.outcome} accent />

            {/* Optional long-form body. Authored by us in the .mdx file and
                rendered from Markdown at build time (server-only, no client
                cost). Content is trusted (version-controlled), not user input. */}
            {project.body && (
              <div className="border-t border-border pt-8">
                <Prose>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(project.body) as string,
                    }}
                  />
                </Prose>
              </div>
            )}
          </div>

          {/* Sidebar: role + stack. */}
          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <div>
              <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-faint">
                My role
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {project.role}
              </p>
            </div>
            <div>
              <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-faint">
                Built with
              </h2>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {project.stack.map((s) => (
                  <li key={s}>
                    <Badge>{s}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* Prev / next nav. */}
        {(prev || next) && (
          <nav className="mt-20 grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-2">
            {prev ? (
              <NeighbourLink dir="prev" slug={prev.slug} title={prev.title} />
            ) : (
              <span />
            )}
            {next && (
              <NeighbourLink dir="next" slug={next.slug} title={next.title} />
            )}
          </nav>
        )}
      </Container>
    </article>
  );
}

function NarrativeBlock({
  label,
  body,
  accent = false,
}: {
  label: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <section>
      <h2
        className={`font-mono text-xs uppercase tracking-[0.18em] ${
          accent ? "text-accent" : "text-faint"
        }`}
      >
        {label}
      </h2>
      <p className="mt-3 text-lg leading-relaxed text-ink/90">{body}</p>
    </section>
  );
}

function NeighbourLink({
  dir,
  slug,
  title,
}: {
  dir: "prev" | "next";
  slug: string;
  title: string;
}) {
  return (
    <Link
      href={`/work/${slug}`}
      className={`group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-ink/25 ${
        dir === "next" ? "sm:text-right" : ""
      }`}
    >
      <span className="font-mono text-xs text-faint">
        {dir === "prev" ? "← Previous" : "Next →"}
      </span>
      <span className="mt-1 block font-serif text-lg text-ink group-hover:text-accent">
        {title}
      </span>
    </Link>
  );
}
