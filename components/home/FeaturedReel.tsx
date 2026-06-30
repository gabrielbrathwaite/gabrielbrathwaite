"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { ProjectImage } from "@/components/work/ProjectImage";
import type { Project } from "@/lib/projects";

/**
 * FeaturedReel — the home highlight reel. Renders the featured projects (passed
 * in from the server via getFeaturedProjects) as cards that show a *near-live*
 * preview on intent rather than a flat screenshot:
 *
 *   - iframe projects → lazily mount a scaled, non-interactive live <iframe>
 *     of the real app (only on hover/in-view, never on first paint).
 *   - projects with a multi-image gallery → cross-fade through the gallery.
 *   - otherwise → a gentle ken-burns push on the cover image.
 *
 * Performance + accessibility guards:
 *   - desktop (hover-capable): activates on pointer-enter / focus.
 *   - touch: activates when the card scrolls into view (no tap needed; the tap
 *     itself navigates to the project).
 *   - respects prefers-reduced-motion and the Save-Data header (both → static
 *     cover, no iframe, no animation).
 */
export function FeaturedReel({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((p, i) => (
        <FeaturedCard key={p.slug} project={p} priority={i === 0} />
      ))}
    </div>
  );
}

function FeaturedCard({
  project,
  priority,
}: {
  project: Project;
  priority: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const [active, setActive] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);

  // Decide whether to allow the heavy iframe preview at all.
  const [allowRich, setAllowRich] = useState(false);
  useEffect(() => {
    const saveData =
      typeof navigator !== "undefined" &&
      // @ts-expect-error - connection is not in all TS lib targets
      navigator.connection?.saveData === true;
    setAllowRich(!reduceMotion && !saveData);
  }, [reduceMotion]);

  // Touch / no-hover devices: activate when the card enters the viewport.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const hoverCapable = window.matchMedia("(hover: hover)").matches;
    if (hoverCapable) return; // desktop uses pointer events instead

    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Gallery cross-fade while active.
  const gallery = project.gallery;
  useEffect(() => {
    if (!active || reduceMotion || gallery.length < 2) return;
    const t = setInterval(
      () => setGalleryIdx((n) => (n + 1) % gallery.length),
      1400
    );
    return () => clearInterval(t);
  }, [active, reduceMotion, gallery.length]);

  const useIframe = allowRich && project.embed === "iframe" && project.demoUrl;

  return (
    <Link
      ref={ref}
      href={`/work/${project.slug}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_18px_50px_-20px_rgb(0_0_0/0.35)]"
    >
      {/* Media area — fixed aspect so there's never layout shift. */}
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        {/* Base cover (always present; the preview layers on top). */}
        <div
          className={`absolute inset-0 transition-transform duration-[1200ms] ease-out ${
            active && !reduceMotion ? "scale-105" : "scale-100"
          }`}
        >
          <ProjectImage
            src={gallery[galleryIdx]}
            hint={`/projects/${project.slug}/cover.png`}
            alt={`${project.title} preview`}
            className="aspect-[16/10] rounded-none border-0"
            priority={priority}
          />
        </div>

        {/* Live iframe preview, mounted only once active. Non-interactive so it
            reads as a preview and the card stays a single click target. */}
        {useIframe && active && (
          <div className="absolute inset-0 animate-fade-up">
            <iframe
              src={project.demoUrl!}
              title={`${project.title} live preview`}
              loading="lazy"
              tabIndex={-1}
              sandbox="allow-scripts allow-same-origin"
              // Render the app at desktop width, then scale it down to fit the
              // card — so the preview looks like a real screen, not a squished
              // mobile view.
              className="pointer-events-none h-[200%] w-[200%] origin-top-left scale-50 bg-white"
            />
          </div>
        )}

        {/* "Live preview" hint chip when an iframe preview is showing. */}
        {useIframe && (
          <span className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10px] text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            live preview
          </span>
        )}
      </div>

      {/* Caption. */}
      <div className="p-5">
        <div className="flex items-center gap-2">
          <Badge
            tone={project.status}
            withDot={project.status === "live" || project.status === "demo"}
          />
          <span className="font-mono text-xs text-faint">
            {project.tags[0]}
          </span>
        </div>
        <h3 className="mt-3 font-serif text-xl font-semibold text-ink">
          {project.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
          {project.tagline}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
          View project
          <span className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
