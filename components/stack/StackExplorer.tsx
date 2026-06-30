"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { StackGroup } from "@/lib/stack";

/**
 * StackExplorer — interactive "what I build with and why". Click any tool to
 * read the reasoning; the why is always in the DOM (readable without JS), the
 * click just expands it. Not a logo wall — every item makes an argument.
 */
export function StackExplorer({ groups }: { groups: StackGroup[] }) {
  // Track the open item by a composite key so only one is open at a time.
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <section key={group.category}>
          <div className="flex flex-col gap-1 border-b border-border pb-4 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="font-serif text-2xl font-semibold text-ink">
              {group.category}
            </h2>
            <p className="max-w-md text-sm text-muted sm:text-right">
              {group.blurb}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {group.items.map((item) => {
              const key = `${group.category}:${item.name}`;
              const isOpen = open === key;
              return (
                <button
                  key={key}
                  onClick={() => setOpen(isOpen ? null : key)}
                  aria-expanded={isOpen}
                  className={cn(
                    "rounded-xl border bg-surface p-5 text-left transition-colors",
                    isOpen
                      ? "border-accent/50"
                      : "border-border hover:border-ink/25"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink">{item.name}</span>
                    <span
                      className={cn(
                        "font-mono text-lg leading-none text-faint transition-transform",
                        isOpen && "rotate-45 text-accent"
                      )}
                      aria-hidden
                    >
                      +
                    </span>
                  </div>
                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-out",
                      isOpen
                        ? "mt-3 grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <span className="min-h-0 overflow-hidden text-sm leading-relaxed text-muted">
                      {item.why}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
