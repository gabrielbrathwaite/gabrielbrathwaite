"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { nav, site } from "@/lib/site";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/Button";

/**
 * Nav — persistent, sticky top navigation. Highlights the active route, carries
 * the theme toggle and the primary CTA. Kept intentionally spare; the ⌘K
 * command palette (added in a later step) becomes the power-user entry point.
 */
export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-content items-center justify-between px-5 sm:px-8">
        {/* Wordmark → home. */}
        <Link
          href="/"
          className="font-serif text-lg font-semibold tracking-tight text-ink"
        >
          {site.name.split(" ")[0]}
          <span className="text-accent">.</span>
        </Link>

        {/* Center links (hidden on mobile; mobile uses the menu below). */}
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm transition-colors",
                  active
                    ? "text-ink"
                    : "text-muted hover:text-ink hover:bg-surface-2"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right cluster. */}
        <div className="flex items-center gap-2">
          {/* ⌘K palette trigger (desktop). Dispatches the event the global
              CommandPalette listens for. */}
          <button
            type="button"
            aria-label="Open command palette"
            onClick={() =>
              window.dispatchEvent(new Event("command-palette:open"))
            }
            className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm text-muted transition-colors hover:border-ink/30 hover:text-ink md:flex"
          >
            <span>Search</span>
            <kbd className="rounded border border-border px-1.5 font-mono text-[10px] text-faint">
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
          <Button href="/contact" size="sm" className="hidden sm:inline-flex">
            Let&rsquo;s talk
          </Button>
        </div>
      </div>

      {/* Mobile link row. */}
      <nav
        className="flex items-center gap-1 overflow-x-auto border-t border-border/60 px-5 py-2 sm:hidden"
        aria-label="Primary mobile"
      >
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors",
                active ? "bg-surface-2 text-ink" : "text-muted"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
