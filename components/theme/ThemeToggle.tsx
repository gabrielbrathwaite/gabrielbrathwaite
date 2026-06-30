"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/**
 * ThemeToggle — sun/moon button. Because the server can't know the resolved
 * theme, we render a neutral placeholder until mounted to avoid a hydration
 * mismatch (a known next-themes pattern), then show the real icon.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      // Before mount, server and client can't agree on the theme, so we keep
      // every theme-dependent attribute (label, icon) neutral until mounted to
      // avoid a hydration mismatch. The click handler only ever fires post-mount.
      aria-label={
        !mounted
          ? "Toggle theme"
          : isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-ink hover:border-ink/30"
    >
      {/* Placeholder keeps layout stable before mount. */}
      {!mounted ? (
        <span className="h-4 w-4" />
      ) : isDark ? (
        // Sun
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        // Moon
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
