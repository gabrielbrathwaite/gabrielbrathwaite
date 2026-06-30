"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ProjectImage } from "@/components/work/ProjectImage";
import type { Project } from "@/lib/projects";

/**
 * ════════════════════════════════════════════════════════════════════
 *  <LiveDemo> — the attachable live-preview block.
 * ════════════════════════════════════════════════════════════════════
 *
 *  Renders a project's demo based on its `embed` frontmatter field. To attach
 *  a real demo to ANY project, you only edit that project's .mdx file — never
 *  this component:
 *
 *    embed: "iframe"      + demoUrl: "https://app.example.com"
 *        → the running app inside a browser-chrome frame, loaded on click
 *          (so it never slows the page), with a fallback if the site refuses
 *          to be embedded (X-Frame-Options / CSP frame-ancestors).
 *    embed: "video"       + poster + gallery:[".../demo.mp4"]
 *        → a poster image with click-to-play screen recording.
 *    embed: "screenshots" + gallery:[...]
 *        → the gallery images as the demo.
 *    embed: "none"
 *        → nothing (pure case-study mode).
 *
 *  See CONTENT.md for the copy-paste recipe.
 */
export function LiveDemo({ project }: { project: Project }) {
  switch (project.embed) {
    case "iframe":
      return <IframeDemo project={project} />;
    case "video":
      return <VideoDemo project={project} />;
    case "screenshots":
      return <ScreenshotsDemo project={project} />;
    case "none":
    default:
      return null;
  }
}

// A reusable browser-chrome wrapper so embeds read as "a real running app".
function BrowserChrome({
  url,
  children,
}: {
  url?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_70px_-30px_rgb(0_0_0/0.4)]">
      <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-border" />
        <span className="h-3 w-3 rounded-full bg-border" />
        <span className="h-3 w-3 rounded-full bg-border" />
        {url && (
          <span className="ml-3 truncate rounded-md bg-surface px-3 py-1 font-mono text-xs text-faint">
            {url.replace(/^https?:\/\//, "")}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// --- iframe mode -----------------------------------------------------------
function IframeDemo({ project }: { project: Project }) {
  const { demoUrl, demoNote } = project;
  const [active, setActive] = useState(false); // user clicked "load"
  const [blocked, setBlocked] = useState(false); // site refused to frame
  const loadedRef = useRef(false);

  // Heuristic: if the iframe never reports `load` within a few seconds after
  // the user starts it, assume the site blocks framing and show the fallback.
  // (Cross-origin frames don't fire `error`, so a timeout is the honest check.)
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      if (!loadedRef.current) setBlocked(true);
    }, 4000);
    return () => clearTimeout(t);
  }, [active]);

  if (!demoUrl) return <ScreenshotsDemo project={project} />;

  // The honest caption under the demo (e.g. "anonymized, no-login, sample data").
  const note = demoNote ? (
    <p className="text-sm leading-relaxed text-muted">{demoNote}</p>
  ) : null;

  // Fallback: framing blocked → screenshots (if any) + a clear open button.
  if (blocked) {
    return (
      <div className="space-y-3">
        <ScreenshotsDemo project={project} />
        <p className="text-sm text-muted">
          This app can&rsquo;t be embedded here.{" "}
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-4"
          >
            Open the live demo ↗
          </a>
        </p>
        {note}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* MOBILE (< md): a full dashboard doesn't fit a phone-sized frame, so we
          show the screenshots and a clear link out instead of a cramped iframe. */}
      <div className="space-y-3 md:hidden">
        <ScreenshotsDemo project={project} />
        <Button href={demoUrl} className="w-full">
          View live demo ↗
        </Button>
      </div>

      {/* DESKTOP (md+): the real app in a browser frame, loaded on click so the
          page stays light until the visitor opts in. */}
      <div className="hidden md:block">
        <BrowserChrome url={demoUrl}>
          {active ? (
            <iframe
              src={demoUrl}
              title={`${project.title} live demo`}
              loading="lazy"
              onLoad={() => (loadedRef.current = true)}
              // Allow the app to run + its own same-origin assets/API, but
              // nothing that can break out of our page.
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              className="h-[600px] w-full bg-white"
            />
          ) : (
            <button
              onClick={() => setActive(true)}
              className="group relative flex h-[600px] w-full items-center justify-center bg-surface-2"
            >
              <span className="flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-medium text-accent-ink transition-transform group-hover:scale-105">
                ▶ Load live demo
              </span>
              <span className="absolute bottom-4 font-mono text-xs text-faint">
                loads the real app, in-frame
              </span>
            </button>
          )}
        </BrowserChrome>

        <div className="mt-3 flex justify-end">
          <Button href={demoUrl} variant="secondary" size="sm">
            Open full site ↗
          </Button>
        </div>
      </div>

      {note}
    </div>
  );
}

// --- video mode ------------------------------------------------------------
function VideoDemo({ project }: { project: Project }) {
  const [playing, setPlaying] = useState(false);
  // Convention: the video file is the first gallery entry for embed:"video".
  const videoSrc = project.gallery[0];

  if (!videoSrc) return <ScreenshotsDemo project={project} />;

  return (
    <BrowserChrome>
      {playing ? (
        <video
          src={videoSrc}
          controls
          autoPlay
          className="h-auto w-full bg-black"
        />
      ) : (
        <button
          onClick={() => setPlaying(true)}
          className="group relative block w-full"
          aria-label="Play demo video"
        >
          {project.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.poster}
              alt={`${project.title} demo`}
              className="h-auto w-full"
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center bg-surface-2">
              <span className="font-mono text-xs text-faint">{videoSrc}</span>
            </div>
          )}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-ink transition-transform group-hover:scale-110">
              ▶
            </span>
          </span>
        </button>
      )}
    </BrowserChrome>
  );
}

// --- screenshots mode ------------------------------------------------------
function ScreenshotsDemo({ project }: { project: Project }) {
  if (project.gallery.length === 0) {
    // No images yet → a single labeled placeholder (no request, no 404).
    return (
      <ProjectImage
        hint={`/projects/${project.slug}/cover.png`}
        alt={`${project.title} screenshot`}
        priority
      />
    );
  }
  return (
    <div className="grid gap-4">
      {project.gallery.map((src, i) => (
        <ProjectImage
          key={src}
          src={src}
          alt={`${project.title} — screenshot ${i + 1}`}
          priority={i === 0}
        />
      ))}
    </div>
  );
}
