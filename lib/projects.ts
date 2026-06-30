import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

/**
 * ════════════════════════════════════════════════════════════════════
 *  PROJECT CONTENT PIPELINE
 * ════════════════════════════════════════════════════════════════════
 *
 *  Every project is ONE MDX file in /content/projects/*.mdx. The YAML
 *  frontmatter is validated against the schema below at build time — if a
 *  field is missing or the wrong type, the build fails with a clear message
 *  (so a broken project can never ship silently). The text after the
 *  frontmatter is optional long-form MDX, rendered on the detail page.
 *
 *  To ADD a project: drop a new .mdx file in /content/projects/. No code
 *  changes anywhere. See CONTENT.md.
 *
 *  MIGRATION SEAM → Supabase: everything downstream consumes the typed
 *  `Project` object from `getAllProjects()` / `getProject()`. To move projects
 *  into a Supabase table later, reimplement ONLY those two functions to fetch +
 *  zod-parse rows instead of reading files. Pages, cards, and <LiveDemo> never
 *  touch the filesystem directly, so nothing else changes.
 */

// --- Schema (single source of truth for a project's shape) ----------------
export const ProjectSchema = z.object({
  title: z.string(),
  slug: z.string(),
  tagline: z.string(), // one line, outcome-focused
  status: z.enum(["live", "case-study", "wip"]),
  tags: z.array(z.string()), // for filtering
  client: z.string().nullable(), // or "Personal" / "Self-initiated"
  // Coerce so an unquoted year in YAML (parsed as a number) is accepted.
  timeframe: z.coerce.string(), // e.g. "2025"
  role: z.string(),
  problem: z.string(),
  approach: z.string(),
  outcome: z.string(),
  stack: z.array(z.string()),
  demoUrl: z.string().url().nullable(),
  repoUrl: z.string().url().nullable(),
  // Optional honest caption shown under a live (iframe) demo — e.g. "this is an
  // anonymized, no-login version with sample data".
  demoNote: z.string().optional(),
  embed: z.enum(["iframe", "video", "screenshots", "none"]),
  gallery: z.array(z.string()).default([]),
  // Optional poster image for the "video" embed mode.
  poster: z.string().optional(),
  featured: z.boolean().default(false),
  order: z.number().default(0),
});

export type ProjectMeta = z.infer<typeof ProjectSchema>;

// A fully-loaded project: validated frontmatter + the raw MDX body.
export type Project = ProjectMeta & { body: string };

const CONTENT_DIR = path.join(process.cwd(), "content", "projects");

// Module-level cache so we read + validate the files only once per build.
let cache: Project[] | null = null;

/** Load, validate, and sort every project. Throws on invalid frontmatter. */
export function getAllProjects(): Project[] {
  // Cache only in production builds; in dev we re-read so new/edited .mdx files
  // appear without restarting the server.
  if (cache && process.env.NODE_ENV === "production") return cache;

  // No directory yet → return empty so the /work page renders its empty state.
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"));

  const projects = files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const { data, content } = matter(raw);

    const parsed = ProjectSchema.safeParse(data);
    if (!parsed.success) {
      // Fail loudly with the filename so the typo is easy to find.
      throw new Error(
        `Invalid frontmatter in content/projects/${file}:\n` +
          parsed.error.issues
            .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
            .join("\n")
      );
    }

    return { ...parsed.data, body: content.trim() };
  });

  // Sort by `order` (asc), then title for stable ties.
  projects.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  cache = projects;
  return projects;
}

/** One project by slug, or undefined. */
export function getProject(slug: string): Project | undefined {
  return getAllProjects().find((p) => p.slug === slug);
}

/** Just the featured projects (for the home highlight reel), capped. */
export function getFeaturedProjects(limit = 3): Project[] {
  return getAllProjects()
    .filter((p) => p.featured)
    .slice(0, limit);
}

/** Every distinct tag across all projects, sorted, for the filter UI. */
export function getAllTags(): string[] {
  const set = new Set<string>();
  for (const p of getAllProjects()) p.tags.forEach((t) => set.add(t));
  return [...set].sort();
}

/** Prev/next neighbours (by sort order) for the detail page footer nav. */
export function getProjectNeighbours(slug: string): {
  prev: Project | null;
  next: Project | null;
} {
  const all = getAllProjects();
  const i = all.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? all[i - 1] : null,
    next: i < all.length - 1 ? all[i + 1] : null,
  };
}
