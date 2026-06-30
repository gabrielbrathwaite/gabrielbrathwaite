"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { process } from "@/lib/about";

/**
 * ProcessFlow — the interactive "how I work" flow and a quiet sales tool. Pick
 * a phase to see what happens, what the client does, and what they walk away
 * with. Keyboard-accessible (real buttons, arrow-key navigation), and the panel
 * content is always in the DOM for the selected phase.
 *
 * Doubles as honest expectation-setting: a prospect can see the whole
 * engagement before they ever email.
 */
export function ProcessFlow() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const current = process[active];

  return (
    <div>
      {/* Phase selector — a horizontal stepper. */}
      <div
        role="tablist"
        aria-label="My process"
        className="flex flex-wrap gap-2"
      >
        {process.map((p, i) => {
          const isActive = i === active;
          return (
            <button
              key={p.phase}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight")
                  setActive((a) => (a + 1) % process.length);
                if (e.key === "ArrowLeft")
                  setActive((a) => (a - 1 + process.length) % process.length);
              }}
              className={cn(
                "flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm transition-colors",
                isActive
                  ? "border-accent bg-accent text-accent-ink"
                  : "border-border bg-surface text-muted hover:border-ink/30 hover:text-ink"
              )}
            >
              <span className="font-mono text-xs">
                {String(i + 1).padStart(2, "0")}
              </span>
              {p.phase}
            </button>
          );
        })}
      </div>

      {/* Panel for the active phase. */}
      <div className="relative mt-6 overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-serif text-2xl font-semibold text-ink">
                {current.phase}
              </h3>
              <span className="font-mono text-xs uppercase tracking-wide text-faint">
                {current.duration}
              </span>
            </div>

            <p className="mt-4 text-lg leading-relaxed text-ink/90">
              {current.happens}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Cell label="What you do" body={current.youDo} />
              <Cell label="What you get" body={current.youGet} accent />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Cell({
  label,
  body,
  accent = false,
}: {
  label: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg p-4">
      <p
        className={cn(
          "font-mono text-xs uppercase tracking-[0.15em]",
          accent ? "text-accent" : "text-faint"
        )}
      >
        {label}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
