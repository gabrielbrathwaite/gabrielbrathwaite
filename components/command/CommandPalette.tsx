"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { CommandItem } from "@/lib/commands";
import { cn } from "@/lib/cn";

/**
 * CommandPalette — a from-scratch ⌘K palette (no dependencies). Opens on
 * ⌘K / Ctrl+K (or a "command-palette:open" window event from the nav trigger),
 * fuzzy-filters pages, projects, actions, and links, and is fully keyboard-
 * driven: ↑/↓ to move, ↵ to run, esc to close. Restores focus on close.
 *
 * Accessibility: role="dialog" + aria-modal, the input owns the listbox via
 * aria-activedescendant, and results have role="option".
 */
export function CommandPalette({ items }: { items: CommandItem[] }) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Remember what was focused before opening, to restore on close.
  const restoreFocus = useRef<HTMLElement | null>(null);

  // Filter + rank by a tiny subsequence fuzzy score.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items
      .map((it) => ({
        it,
        score: fuzzyScore(q, `${it.label} ${it.keywords ?? ""}`.toLowerCase()),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.it);
  }, [items, query]);

  // Keep the active index in range as results change.
  useEffect(() => {
    setActive(0);
  }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    restoreFocus.current?.focus?.();
  }, []);

  const openPalette = useCallback(() => {
    restoreFocus.current = document.activeElement as HTMLElement;
    setOpen(true);
  }, []);

  // Run the selected item.
  const run = useCallback(
    (item: CommandItem | undefined) => {
      if (!item) return;
      close();
      if (item.action === "toggle-theme") {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
        return;
      }
      if (!item.href) return;
      if (item.href.startsWith("http") || item.href.startsWith("mailto:")) {
        window.open(item.href, item.href.startsWith("http") ? "_blank" : "_self");
      } else {
        router.push(item.href);
      }
    },
    [close, router, setTheme, resolvedTheme]
  );

  // Global hotkeys: open on ⌘K / Ctrl+K, plus a custom event from the nav.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) close();
        else openPalette();
      }
    };
    const onOpenEvent = () => openPalette();
    window.addEventListener("keydown", onKey);
    window.addEventListener("command-palette:open", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("command-palette:open", onOpenEvent);
    };
  }, [open, close, openPalette]);

  // Focus the input when opened.
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // Scroll the active option into view.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  if (!open) return null;

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (results.length ? (a + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) =>
        results.length ? (a - 1 + results.length) % results.length : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  // Group the flat results for display while keeping a global active index.
  let runningIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop. */}
      <button
        aria-label="Close command palette"
        onClick={close}
        className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm animate-[fade-up_0.15s_ease]"
      />

      {/* Panel. */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_30px_80px_-20px_rgb(0_0_0/0.5)]">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-faint" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search pages, projects, actions…"
            aria-label="Search"
            aria-activedescendant={`cmd-opt-${active}`}
            className="h-14 flex-1 bg-transparent text-ink placeholder:text-faint focus:outline-none"
          />
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-faint sm:block">
            esc
          </kbd>
        </div>

        <div
          ref={listRef}
          role="listbox"
          className="max-h-[55vh] overflow-y-auto p-2"
        >
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-faint">
              No matches for “{query}”.
            </p>
          ) : (
            GROUPS.map((group) => {
              const groupItems = results.filter((r) => r.group === group);
              if (groupItems.length === 0) return null;
              return (
                <div key={group} className="mb-1">
                  <p className="px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">
                    {group}
                  </p>
                  {groupItems.map((item) => {
                    runningIndex += 1;
                    const idx = runningIndex;
                    const isActive = idx === active;
                    return (
                      <button
                        key={item.id}
                        id={`cmd-opt-${idx}`}
                        data-idx={idx}
                        role="option"
                        aria-selected={isActive}
                        onMouseMove={() => setActive(idx)}
                        onClick={() => run(item)}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left",
                          isActive ? "bg-surface-2" : "bg-transparent"
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-ink">
                            {item.label}
                          </span>
                          {item.hint && (
                            <span className="block truncate text-xs text-faint">
                              {item.hint}
                            </span>
                          )}
                        </span>
                        {isActive && (
                          <kbd className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-faint">
                            ↵
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const GROUPS: CommandItem["group"][] = [
  "Pages",
  "Projects",
  "Actions",
  "Elsewhere",
];

/**
 * fuzzyScore — cheap subsequence matcher. Returns 0 for no match, higher for
 * tighter/earlier matches. Rewards contiguous runs and an early first hit.
 */
function fuzzyScore(query: string, text: string): number {
  let score = 0;
  let ti = 0;
  let streak = 0;
  for (const ch of query) {
    const found = text.indexOf(ch, ti);
    if (found === -1) return 0;
    // earlier matches and contiguous runs score higher
    streak = found === ti ? streak + 1 : 0;
    score += 10 - Math.min(found - ti, 8) + streak * 2;
    ti = found + 1;
  }
  // small bonus for exact substring
  if (text.includes(query)) score += 15;
  return score;
}
