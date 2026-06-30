"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { strengths } from "@/lib/about";

/**
 * Strengths — "give me X → you get Y", as a grid of cards that reveal a concrete
 * example on hover/focus/tap. Not a skills bar chart (those are meaningless);
 * every card pays off with something real from the work. The example is always
 * in the DOM (so it's readable without JS); interaction just foregrounds it.
 */
export function Strengths() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {strengths.map((s, i) => {
        const isOpen = open === i;
        return (
          <button
            key={i}
            onMouseEnter={() => setOpen(i)}
            onMouseLeave={() => setOpen(null)}
            onFocus={() => setOpen(i)}
            onBlur={() => setOpen(null)}
            onClick={() => setOpen(isOpen ? null : i)}
            aria-expanded={isOpen}
            className="group rounded-2xl border border-border bg-surface p-6 text-left transition-colors hover:border-accent/40"
          >
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-faint">
              Give me
            </p>
            <p className="mt-1 text-lg text-muted">{s.give}</p>

            <div className="mt-4 flex items-center gap-2 text-accent">
              <span className="font-mono text-xs uppercase tracking-[0.15em]">
                You get
              </span>
              <span
                className={cn(
                  "h-px flex-1 origin-left bg-accent/40 transition-transform duration-300",
                  isOpen ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )}
              />
            </div>
            <p className="mt-1 font-serif text-xl font-semibold text-ink">
              {s.get}
            </p>

            {/* Example — revealed on open, but present for no-JS / screen readers. */}
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen
                  ? "mt-3 grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              )}
            >
              <span className="min-h-0 overflow-hidden text-sm leading-relaxed text-muted">
                {s.example}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
