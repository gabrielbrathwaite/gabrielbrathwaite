"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * ProjectImage — a gallery/screenshot image with a graceful placeholder.
 *
 * If `src` is omitted (the common case before you've added screenshots), the
 * placeholder renders directly — we do NOT request a non-existent file, so
 * there are no 404s in the console. `hint` shows the path to drop the real
 * image at. When a real `src` is given, it lazy-loads (unless `priority`) and
 * still falls back to the placeholder if that file happens to be missing.
 */
export function ProjectImage({
  src,
  alt,
  hint,
  className,
  priority = false,
}: {
  src?: string;
  alt: string;
  hint?: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const showImage = !!src && !failed;
  const showPlaceholder = !src || failed || !loaded;

  return (
    <div
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-surface-2",
        className
      )}
    >
      {showImage && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          priority={priority}
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
          className={cn(
            "object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {showPlaceholder && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-faint"
            aria-hidden
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          {hint && (
            <code className="font-mono text-[11px] text-faint">{hint}</code>
          )}
        </div>
      )}
    </div>
  );
}
