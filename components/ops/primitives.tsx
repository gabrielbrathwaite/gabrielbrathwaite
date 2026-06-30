"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { fmtCurrency, fmtNumber, fmtPct } from "@/lib/ops/format";
import type { Trend } from "@/lib/ops/types";

/** True when the user asked the OS to minimize motion. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return reduced;
}

/**
 * AnimatedNumber — counts from the previous value to the new one whenever the
 * value changes, and briefly flashes so a live update catches the eye without
 * being a slot machine. Honors reduced-motion (snaps + no flash).
 */
export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: "currency" | "number";
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState(false);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (display === value) return;
    if (reduced) {
      setDisplay(value);
      return;
    }
    const from = fromRef.current;
    const to = value;
    const start = performance.now();
    const dur = 600;
    if (to !== from) {
      setFlash(true);
      const ft = setTimeout(() => setFlash(false), 700);
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        setDisplay(from + (to - from) * eased);
        if (t < 1) rafRef.current = requestAnimationFrame(step);
        else fromRef.current = to;
      };
      rafRef.current = requestAnimationFrame(step);
      return () => {
        clearTimeout(ft);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduced]);

  useEffect(() => {
    fromRef.current = display;
  }, [display]);

  const text = format === "currency" ? fmtCurrency(display) : fmtNumber(display);
  return (
    <span
      className={cn(
        "tabular-nums transition-colors duration-500",
        flash ? "text-accent" : "",
        className
      )}
    >
      {text}
    </span>
  );
}

/** A small ▲/▼ delta pill, colored by whether the move is good for the metric. */
export function DeltaPill({
  deltaPct,
  trend,
  good,
}: {
  deltaPct: number | null;
  trend: Trend;
  good: boolean;
}) {
  if (deltaPct === null || trend === "flat") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-faint">
        ▬ {trend === "flat" ? fmtPct(deltaPct) : "new"}
      </span>
    );
  }
  const arrow = trend === "up" ? "▲" : "▼";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium",
        good
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "border-accent/30 bg-accent/10 text-accent"
      )}
    >
      {arrow} {fmtPct(deltaPct)}
    </span>
  );
}

/**
 * Sparkline — a tiny normalized line+area over the 14-day series. Colored by
 * trend. Pure SVG, scales to its container via viewBox.
 */
export function Sparkline({ data, trend }: { data: number[]; trend: Trend }) {
  const w = 120;
  const h = 32;
  if (!data.length) return <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" />;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const stepX = w / Math.max(1, data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * stepX;
    const y = h - 3 - ((v - min) / span) * (h - 6);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const color =
    trend === "down"
      ? "rgb(var(--accent))"
      : trend === "up"
        ? "rgb(16 185 129)"
        : "rgb(var(--faint))";
  const id = `sp-${data.join("_").slice(0, 12)}-${trend}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2" fill={color} />
    </svg>
  );
}

export { fmtCurrency, fmtNumber };
