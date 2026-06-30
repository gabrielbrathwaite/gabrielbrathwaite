"use client";

import { cn } from "@/lib/cn";
import { fmtAge } from "@/lib/ops/format";
import type { LowStock, AgingTicket } from "@/lib/ops/types";

function Panel({
  title,
  count,
  tone = "neutral",
  children,
}: {
  title: string;
  count: number;
  tone?: "neutral" | "alert";
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-faint">{title}</h3>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium",
            count === 0
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : tone === "alert"
                ? "border-accent/30 bg-accent/10 text-accent"
                : "border-border bg-surface-2 text-muted"
          )}
        >
          {count === 0 ? "all clear" : count}
        </span>
      </div>
      {children}
    </div>
  );
}

// ── Low-stock alerts (red severity bar) ──────────────────────────────────────
export function LowStockTable({ rows }: { rows: LowStock[] }) {
  return (
    <Panel title="Low-stock alerts" count={rows.length} tone="alert">
      {rows.length === 0 ? (
        <Empty>Every product is at or above par.</Empty>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((p) => (
            <li key={p.name} className="flex items-center gap-3 py-2.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm text-ink">{p.name}</span>
                  <span className="shrink-0 font-mono text-xs text-accent">
                    {p.stock}<span className="text-faint">/{p.par} bags</span>
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round(p.severity * 100)}%` }} />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wide text-faint">{p.roast}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

const PRIORITY_STYLE: Record<AgingTicket["priority"], string> = {
  urgent: "border-accent/40 bg-accent/15 text-accent",
  high: "border-accent/30 bg-accent/10 text-accent",
  normal: "border-border bg-surface-2 text-muted",
  low: "border-border bg-surface-2 text-faint",
};

// ── Aging support tickets (oldest first) ─────────────────────────────────────
export function AgingTicketsTable({ rows }: { rows: AgingTicket[] }) {
  return (
    <Panel title="Support tickets aging > 24h" count={rows.length} tone="alert">
      {rows.length === 0 ? (
        <Empty>No tickets have been waiting longer than a day.</Empty>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((t, i) => (
            <li key={`${t.subject}-${i}`} className="flex items-start gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{t.subject}</p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-faint">
                  {t.account} · {t.channel}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="font-mono text-xs font-medium text-accent">{fmtAge(t.ageHours)}</span>
                <span className={cn("rounded-full border px-1.5 py-0.5 font-mono text-[10px] uppercase", PRIORITY_STYLE[t.priority])}>
                  {t.priority}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-faint">{children}</p>;
}
