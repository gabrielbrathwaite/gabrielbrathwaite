"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Section";
import { cn } from "@/lib/cn";
import { AnimatedNumber, DeltaPill, Sparkline } from "@/components/ops/primitives";
import { RevenueChart, OrdersByHourChart, TopProductsChart } from "@/components/ops/Charts";
import { LowStockTable, AgingTicketsTable } from "@/components/ops/Tables";
import type { Snapshot, Briefing, Kpi } from "@/lib/ops/types";

const POLL_MS = 4000;

/**
 * OpsDashboard — the live, read-only ops board. It paints the server-computed
 * snapshot, then polls /api/ops-dashboard every few seconds. Each poll also
 * advances the simulation server-side, so orders and tickets visibly tick up
 * while you watch. All math lives on the server; this component just renders.
 */
export function OpsDashboard({ initial }: { initial: Snapshot }) {
  const [snap, setSnap] = useState<Snapshot>(initial);
  const [ago, setAgo] = useState(0);
  const [live, setLive] = useState(true);

  // Poll for fresh snapshots; pause while the tab is hidden (no point churning
  // the demo DB for a tab nobody's looking at).
  useEffect(() => {
    let alive = true;
    const fetchSnap = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch("/api/ops-dashboard", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const next = (await res.json()) as Snapshot;
        if (alive) {
          setSnap(next);
          setLive(true);
        }
      } catch {
        if (alive) setLive(false);
      }
    };
    const poll = setInterval(fetchSnap, POLL_MS);
    const onVis = () => !document.hidden && fetchSnap();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // "updated Ns ago" ticker.
  useEffect(() => {
    const id = setInterval(() => {
      setAgo(Math.max(0, Math.round((Date.now() - new Date(snap.generatedAt).getTime()) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [snap.generatedAt]);

  return (
    <div className="py-8 sm:py-10">
      <Container>
        <Header live={live} ago={ago} demo={snap.source === "demo"} />

        {/* 1 — MORNING BRIEFING (the hook; first thing, on every screen size). */}
        <BriefingStrip items={snap.briefing} />

        {/* 2 — KPI ROW. */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {snap.kpis.map((k) => (
            <KpiCard key={k.key} kpi={k} />
          ))}
        </div>

        {/* 3 — CHARTS. */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <RevenueChart data={snap.revenue14d} />
          </div>
          <OrdersByHourChart data={snap.ordersByHour} />
          <TopProductsChart data={snap.topProducts} />
        </div>

        {/* 4 — ATTENTION TABLES. */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <LowStockTable rows={snap.lowStock} />
          <AgingTicketsTable rows={snap.agingTickets} />
        </div>

        <p className="mt-8 text-center font-mono text-[11px] text-faint">
          Read-only public demo · sample data · Meridian Coffee is a fictional roastery ·
          numbers update live as simulated orders and tickets come in.
        </p>
      </Container>
    </div>
  );
}

// ── Header ───────────────────────────────────────────────────────────────────
function Header({ live, ago, demo }: { live: boolean; ago: number; demo: boolean }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return (
    <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          Meridian Coffee · Operations
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {greeting}. Here&rsquo;s your shop today.
        </h1>
        <p className="mt-1.5 text-sm text-muted">{today}</p>
      </div>
      <div className="flex items-center gap-2 self-start rounded-full border border-border bg-surface px-3 py-1.5 sm:self-auto">
        <span className="relative flex h-2 w-2">
          {live && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          )}
          <span className={cn("relative inline-flex h-2 w-2 rounded-full", live ? "bg-emerald-500" : "bg-faint")} />
        </span>
        <span className="font-mono text-[11px] text-muted">
          {live ? (ago <= 2 ? "Live · just now" : `Live · ${ago}s ago`) : "Reconnecting…"}
        </span>
        {demo && (
          <span className="ml-1 rounded-full bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-faint">
            offline
          </span>
        )}
      </div>
    </header>
  );
}

// ── Briefing strip ───────────────────────────────────────────────────────────
const TONE_DOT: Record<Briefing["tone"], string> = {
  alert: "bg-accent",
  watch: "bg-amber-500",
  good: "bg-emerald-500",
  info: "bg-faint",
};
const TONE_RING: Record<Briefing["tone"], string> = {
  alert: "border-accent/30",
  watch: "border-amber-500/30",
  good: "border-emerald-500/30",
  info: "border-border",
};

function BriefingStrip({ items }: { items: Briefing[] }) {
  return (
    <section
      aria-label="Morning briefing"
      className="rounded-2xl border border-border bg-surface-2/50 p-4 sm:p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-faint">Morning briefing</h2>
        <span className="font-mono text-[11px] text-faint">— what changed &amp; what needs you</span>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((b, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2.5 rounded-xl border bg-surface p-3",
              TONE_RING[b.tone]
            )}
          >
            <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", TONE_DOT[b.tone])} aria-hidden />
            <p className="text-sm leading-snug text-ink/90">{b.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">{kpi.label}</span>
        <DeltaPill deltaPct={kpi.deltaPct} trend={kpi.trend} good={kpi.good} />
      </div>
      <div className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink">
        <AnimatedNumber value={kpi.value} format={kpi.format} />
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <span className="text-xs text-muted">{kpi.sub}</span>
        <div className="w-24 shrink-0">
          <Sparkline data={kpi.spark} trend={kpi.trend} />
        </div>
      </div>
    </div>
  );
}
