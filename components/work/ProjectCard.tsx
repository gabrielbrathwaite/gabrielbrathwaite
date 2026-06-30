import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProjectImage } from "@/components/work/ProjectImage";
import type { Project } from "@/lib/projects";

/**
 * ProjectCard — the standard project tile used on /work (and reusable on home).
 * A clickable Card showing cover image, status, title, tagline, and tags.
 * Driven entirely by the Project object — no per-project markup.
 */
export function ProjectCard({ project }: { project: Project }) {
  // Cover = the first real gallery image, or nothing (→ placeholder, no 404).
  const cover = project.gallery[0];
  // A project can override where its card links (e.g. a live interactive demo)
  // — otherwise it goes to the standard /work case-study page.
  const href = project.cardHref ?? `/work/${project.slug}`;

  return (
    <Card href={href} className="group overflow-hidden">
      <div className="p-3">
        <ProjectImage
          src={cover}
          hint={`/projects/${project.slug}/cover.png`}
          alt={`${project.title} cover`}
          className="aspect-[16/10] rounded-lg"
        />
      </div>
      <div className="px-5 pb-5 pt-1">
        <div className="flex items-center gap-2">
          <Badge
            tone={project.status}
            withDot={project.status === "live" || project.status === "demo"}
          />
          <span className="font-mono text-xs text-faint">
            {project.timeframe}
          </span>
        </div>
        <h3 className="mt-3 font-serif text-xl font-semibold text-ink">
          {project.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {project.tagline}
        </p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.map((t) => (
            <li key={t}>
              <Badge>{t}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
