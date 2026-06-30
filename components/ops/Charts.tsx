"use client";

import { cn } from "@/lib/cn";
import { fmtCurrency } from "@/lib/ops/format";
import type { RevenuePoint, HourPoint, TopProduct } from "@/lib/ops/types";

/**
 * Hand-rolled SVG charts — deliberately lightweight (no charting dependency) so
 * they inherit the site's editorial type + color tokens exactly and add nothing
 * to the client bundle. Each is a dumb render of pre-computed snapshot data.
 */

function Panel({
  title,
  hint,
  children,
  className,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-5", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-faint">{title}</h3>
        {hint && <span className="font-mono text-[11px] text-faint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Revenue, last 14 days (area + line) ──────────────────────────────────────
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const w = 560;
  const h = 180;
  const padX = 6;
  const padTop = 12;
  const padBottom = 22;
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const stepX = (w - padX * 2) / Math.max(1, data.length - 1);
  const x = (i: number) => padX + i * stepX;
  const y = (v: number) => padTop + (1 - v / max) * (h - padTop - padBottom);
  const pts = data.map((d, i) => [x(i), y(d.revenue)] as const);
  const line = pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1)} ${h - padBottom} L${x(0)} ${h - padBottom} Z`;
  const today = data[data.length - 1];

  return (
    <Panel title="Revenue — last 14 days" hint={today ? `today ${fmtCurrency(today.revenue)}` : undefined}>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="rev-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--accent))" stopOpacity="0.20" />
            <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* baseline */}
        <line x1={padX} y1={h - padBottom} x2={w - padX} y2={h - padBottom} stroke="rgb(var(--border))" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d={area} fill="url(#rev-area)" />
        <path d={line} fill="none" stroke="rgb(var(--accent))" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {/* today marker */}
        {pts.length > 0 && (
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill="rgb(var(--accent))" stroke="rgb(var(--surface))" strokeWidth="1.5" />
        )}
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-faint">
        {data.map((d, i) =>
          i % 3 === 0 || i === data.length - 1 ? (
            <span key={d.date}>{i === data.length - 1 ? "today" : d.label}</span>
          ) : (
            <span key={d.date} className="opacity-0">
              .
            </span>
          )
        )}
      </div>
    </Panel>
  );
}

// ── Orders by hour, today (vertical bars; current hour highlighted) ──────────
export function OrdersByHourChart({ data }: { data: HourPoint[] }) {
  const max = Math.max(...data.map((d) => d.orders), 1);
  const nowHour = new Date().getUTCHours();
  const total = data.reduce((s, d) => s + d.orders, 0);
  return (
    <Panel title="Orders by hour — today" hint={`${total} so far`}>
      <div className="flex h-44 items-end gap-[3px]">
        {data.map((d) => {
          const isNow = d.hour === nowHour;
          return (
            <div key={d.hour} className="group flex flex-1 flex-col items-center justify-end gap-1" style={{ height: "100%" }}>
              <span className="font-mono text-[9px] text-faint opacity-0 transition-opacity group-hover:opacity-100">
                {d.orders}
              </span>
              <div
                className={cn(
                  "w-full rounded-t-[3px] transition-all duration-500",
                  isNow ? "bg-accent" : "bg-ink/15 group-hover:bg-ink/30"
                )}
                style={{ height: `${Math.max(2, (d.orders / max) * 100)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-faint">
        {data.map((d, i) => (i % 3 === 0 ? <span key={d.hour}>{d.label}</span> : <span key={d.hour} className="opacity-0">.</span>))}
      </div>
    </Panel>
  );
}

// ── Top 5 products by revenue, last 14 days (horizontal bars) ────────────────
export function TopProductsChart({ data }: { data: TopProduct[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <Panel title="Top products — last 14 days" hint="by revenue">
      <ul className="space-y-3">
        {data.map((p, i) => (
          <li key={p.name}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="truncate text-sm text-ink">
                <span className="mr-1.5 font-mono text-[11px] text-faint">{i + 1}</span>
                {p.name}
              </span>
              <span className="shrink-0 font-mono text-xs text-muted">
                {fmtCurrency(p.revenue)} <span className="text-faint">· {p.qty} bags</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent/80 transition-all duration-500"
                style={{ width: `${(p.revenue / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
