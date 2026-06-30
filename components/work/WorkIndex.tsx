"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { ProjectCard } from "@/components/work/ProjectCard";
import { Button } from "@/components/ui/Button";
import type { Project } from "@/lib/projects";

/**
 * WorkIndex — the interactive project index. Filters by a single tag and sorts
 * client-side (the dataset is small and fully present, so no refetch). Designed
 * to look intentional from 1 project to 30:
 *   - 1–2 projects: still a composed grid, not a lonely card.
 *   - filter with no matches: a clear empty state with a reset, never a blank.
 */
type Sort = "featured" | "newest" | "az";

const SORTS: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "az", label: "A–Z" },
];

export function WorkIndex({
  projects,
  tags,
}: {
  projects: Project[];
  tags: string[];
}) {
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("featured");

  const visible = useMemo(() => {
    const filtered = tag
      ? projects.filter((p) => p.tags.includes(tag))
      : projects;

    const sorted = [...filtered];
    if (sort === "featured") {
      // Featured first, then by curated order.
      sorted.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order
      );
    } else if (sort === "newest") {
      // Newest timeframe first (string compare works for "2026" > "2025").
      sorted.sort((a, b) => b.timeframe.localeCompare(a.timeframe));
    } else {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    return sorted;
  }, [projects, tag, sort]);

  return (
    <div>
      {/* Controls: tag chips + sort. Hidden entirely if there's nothing to
          filter (a single project doesn't need a filter bar). */}
      {projects.length > 1 && (
        <div className="mb-10 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by tag">
            <Chip active={tag === null} onClick={() => setTag(null)}>
              All
            </Chip>
            {tags.map((t) => (
              <Chip key={t} active={tag === t} onClick={() => setTag(t)}>
                {t}
              </Chip>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-muted">
            <span className="font-mono text-xs uppercase tracking-wide text-faint">
              Sort
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-ink"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* Results. The visually-hidden heading keeps the document outline
          sequential (page h1 → this h2 → card h3s). */}
      <h2 className="sr-only">Projects</h2>
      {visible.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {visible.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      ) : (
        // Empty state — only reachable via a filter, so offer a reset.
        <div className="rounded-2xl border border-dashed border-border bg-surface-2/40 py-16 text-center">
          <p className="font-serif text-xl text-ink">No projects tagged “{tag}”.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            That filter doesn&rsquo;t match anything yet. Clear it to see
            everything.
          </p>
          <div className="mt-5 flex justify-center">
            <Button variant="secondary" size="sm" onClick={() => setTag(null)}>
              Show all projects
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active
          ? "border-accent bg-accent text-accent-ink"
          : "border-border bg-surface text-muted hover:border-ink/30 hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}
