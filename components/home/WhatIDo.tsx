"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * WhatIDo — what working with me gets you, framed as OUTCOMES (not a skills
 * list). Each row is "give me X → you get Y", and expands on hover/focus/tap to
 * reveal a concrete example from real work. Interaction earns its place: it
 * progressively discloses detail instead of dumping everything at once.
 */
type Outcome = {
  give: string; // the input the client brings
  get: string; // the outcome they receive
  detail: string; // concrete, drawn from real work
};

const OUTCOMES: Outcome[] = [
  {
    give: "A process you do by hand every week",
    get: "An automation that does it while you sleep",
    detail:
      "Repetitive data entry, copying between tools, chasing the same updates — I find the loop and close it, with a human check only where it actually matters.",
  },
  {
    give: "Data scattered across tools and tabs",
    get: "One dashboard your whole team trusts",
    detail:
      "For Seraphym I unified moderation, support, economy, and tracking onto a single Supabase-backed dashboard — one source of truth, role-gated so you can delegate safely.",
  },
  {
    give: "A workflow no off-the-shelf tool fits",
    get: "An internal tool built exactly around it",
    detail:
      "Software you own, shaped to how your business actually runs — not a subscription you bend your process to fit. It grows with you because it's yours.",
  },
  {
    give: "A vague “we should use AI for this”",
    get: "A working, scoped feature in production",
    detail:
      "I turn the hand-wavy idea into something concrete and shippable — and I'm honest when the answer is a simple rule, not a model.",
  },
];

export function WhatIDo() {
  const [open, setOpen] = useState<number>(0); // first one open by default

  return (
    <ul className="divide-y divide-border border-y border-border">
      {OUTCOMES.map((o, i) => {
        const isOpen = open === i;
        return (
          <li key={i}>
            <button
              onMouseEnter={() => setOpen(i)}
              onFocus={() => setOpen(i)}
              onClick={() => setOpen(i)}
              aria-expanded={isOpen}
              className="group flex w-full flex-col gap-2 py-6 text-left transition-colors sm:flex-row sm:items-baseline sm:gap-8"
            >
              {/* give → get line */}
              <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                <span className="font-mono text-xs uppercase tracking-wide text-faint sm:w-8">
                  0{i + 1}
                </span>
                <p className="flex-1 text-lg text-muted">
                  <span className="text-muted">{o.give}</span>
                  <span className="mx-2 text-faint">→</span>
                  <span className="font-serif text-xl font-semibold text-ink">
                    {o.get}
                  </span>
                </p>
              </div>

              {/* Expanding detail. Grid-rows trick animates height cheaply. */}
              <div
                className={cn(
                  "grid overflow-hidden transition-all duration-300 ease-out sm:max-w-sm",
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0 sm:opacity-60"
                )}
              >
                <span className="min-h-0 text-sm leading-relaxed text-muted">
                  {o.detail}
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
