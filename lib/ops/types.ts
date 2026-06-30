/**
 * Shapes returned by getSnapshot() and consumed by the dashboard UI. The whole
 * dashboard renders from ONE Snapshot object, so the client never does math —
 * it just paints. That keeps the live-polling client dumb and the logic
 * server-side + testable.
 */

export type Trend = "up" | "down" | "flat";

export type Kpi = {
  key: "revenue" | "orders" | "refunds" | "tickets";
  label: string;
  /** Pre-formatted headline value, e.g. "$4,210" or "30". */
  display: string;
  /** Raw value (for the count-up animation). */
  value: number;
  /** Whole-number prefix/suffix for the animator. */
  format: "currency" | "number";
  /** % change vs the same point yesterday (null when yesterday was zero). */
  deltaPct: number | null;
  /** Direction, and whether that direction is good or bad for this metric. */
  trend: Trend;
  good: boolean;
  /** Short context line, e.g. "vs $4,800 by this time yesterday". */
  sub: string;
  /** 14-point series for the sparkline. */
  spark: number[];
};

export type Briefing = {
  /** Plain-English callout, e.g. "Revenue is down 12% vs this time yesterday". */
  text: string;
  /** Drives the dot color: needs attention vs. just-so-you-know vs. good news. */
  tone: "alert" | "watch" | "good" | "info";
};

export type RevenuePoint = { date: string; label: string; revenue: number };
export type HourPoint = { hour: number; label: string; orders: number };
export type TopProduct = { name: string; revenue: number; qty: number };

export type LowStock = {
  name: string;
  roast: string;
  stock: number;
  par: number;
  /** 0–1, how far below par (1 = empty). */
  severity: number;
};

export type AgingTicket = {
  subject: string;
  account: string;
  priority: "low" | "normal" | "high" | "urgent";
  channel: string;
  ageHours: number;
};

export type Snapshot = {
  /** ISO timestamp the snapshot was computed (for "updated Ns ago"). */
  generatedAt: string;
  /** Whether the data is real (Supabase) or the built-in offline fallback. */
  source: "live" | "demo";
  briefing: Briefing[];
  kpis: Kpi[];
  revenue14d: RevenuePoint[];
  ordersByHour: HourPoint[];
  topProducts: TopProduct[];
  lowStock: LowStock[];
  agingTickets: AgingTicket[];
};
