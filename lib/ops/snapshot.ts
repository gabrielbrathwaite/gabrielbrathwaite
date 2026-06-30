import "server-only";
import { sbSelect, opsConfigured } from "./supabase";
import { fmtCurrency, fmtNumber } from "./format";
import type {
  Snapshot,
  Kpi,
  Briefing,
  Trend,
  RevenuePoint,
  HourPoint,
  TopProduct,
  LowStock,
  AgingTicket,
} from "./types";

/**
 * getSnapshot() — the single server-side function that turns raw rows into the
 * fully-computed dashboard. The client never does math; it just paints what
 * this returns and re-fetches it every few seconds.
 *
 * All bucketing is done in UTC (matching how the data is seeded), so "today",
 * deltas, and the hourly chart are internally consistent regardless of where
 * the visitor is.
 */

const DAY = 86_400_000;
const HOUR = 3_600_000;
const BIZ_START = 6;
const BIZ_END = 20; // hourly chart window

type OrderRow = { total: number | string; created_at: string; refunded_at: string | null };
type ProductRow = {
  name: string;
  current_stock_bags: number;
  par_level_bags: number;
  roast_level: string;
  price_per_bag: number | string;
};
type ItemRow = {
  qty_bags: number;
  products: { name: string; price_per_bag: number | string } | null;
  orders: { created_at: string } | null;
};
type TicketRow = {
  subject: string;
  priority: AgingTicket["priority"];
  channel: string;
  created_at: string;
  status?: string;
  accounts: { name: string } | null;
};

const num = (v: number | string) => (typeof v === "string" ? parseFloat(v) : v);
const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const shortLabel = (key: string) => {
  const [, m, d] = key.split("-");
  return `${parseInt(m)}/${parseInt(d)}`;
};

export async function getSnapshot(): Promise<Snapshot> {
  if (!opsConfigured()) return demoSnapshot();
  try {
    return await liveSnapshot();
  } catch (err) {
    console.error("[ops] snapshot failed, serving demo fallback:", err);
    return demoSnapshot();
  }
}

async function liveSnapshot(): Promise<Snapshot> {
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const msIntoDay = now.getTime() - todayStart.getTime();
  const yStart = new Date(todayStart.getTime() - DAY);
  const yCutoff = new Date(yStart.getTime() + msIntoDay); // same wall-time yesterday
  const since15 = new Date(todayStart.getTime() - 14 * DAY).toISOString();
  const since14 = new Date(todayStart.getTime() - 13 * DAY).toISOString();

  const [orders, products, items, openTickets, recentTickets] = await Promise.all([
    sbSelect<OrderRow>(
      `orders?select=total,created_at,refunded_at&created_at=gte.${since15}&order=created_at.asc`
    ),
    sbSelect<ProductRow>(
      `products?select=name,current_stock_bags,par_level_bags,roast_level,price_per_bag`
    ),
    sbSelect<ItemRow>(
      `order_items?select=qty_bags,products(name,price_per_bag),orders!inner(created_at)&orders.created_at=gte.${since14}`
    ),
    sbSelect<TicketRow>(
      `support_tickets?select=subject,priority,channel,created_at,accounts(name)&status=eq.open&order=created_at.asc`
    ),
    sbSelect<{ created_at: string }>(
      `support_tickets?select=created_at&created_at=gte.${since15}`
    ),
  ]);

  // ── Window helpers ────────────────────────────────────────────────────────
  const inToday = (iso: string | null) => iso != null && new Date(iso) >= todayStart;
  const inYestToDate = (iso: string | null) => {
    if (!iso) return false;
    const t = new Date(iso);
    return t >= yStart && t < yCutoff;
  };

  // ── KPI raw values ────────────────────────────────────────────────────────
  const revToday = sum(orders.filter((o) => inToday(o.created_at)).map((o) => num(o.total)));
  const revYest = sum(orders.filter((o) => inYestToDate(o.created_at)).map((o) => num(o.total)));
  const ordToday = orders.filter((o) => inToday(o.created_at)).length;
  const ordYest = orders.filter((o) => inYestToDate(o.created_at)).length;
  const refToday = orders.filter((o) => inToday(o.refunded_at)).length;
  const refYest = orders.filter((o) => inYestToDate(o.refunded_at)).length;
  const refTodayAmt = sum(orders.filter((o) => inToday(o.refunded_at)).map((o) => num(o.total)));
  const openCount = openTickets.length;
  const ticketsToday = recentTickets.filter((t) => inToday(t.created_at)).length;
  const ticketsYest = recentTickets.filter((t) => inYestToDate(t.created_at)).length;

  // ── 14-day sparkline series ───────────────────────────────────────────────
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) days.push(dayKey(new Date(todayStart.getTime() - i * DAY)));
  const byDay = (rows: { iso: string | null; v: number }[]) => {
    const m = new Map<string, number>(days.map((d) => [d, 0]));
    for (const r of rows) {
      if (!r.iso) continue;
      const k = r.iso.slice(0, 10);
      if (m.has(k)) m.set(k, (m.get(k) || 0) + r.v);
    }
    return days.map((d) => m.get(d) || 0);
  };
  const revSpark = byDay(orders.map((o) => ({ iso: o.created_at, v: num(o.total) })));
  const ordSpark = byDay(orders.map((o) => ({ iso: o.created_at, v: 1 })));
  const refSpark = byDay(orders.map((o) => ({ iso: o.refunded_at, v: 1 })));
  const tktSpark = byDay(recentTickets.map((t) => ({ iso: t.created_at, v: 1 })));

  const kpis: Kpi[] = [
    kpi("revenue", "Revenue today", revToday, revYest, "currency", true, revSpark, "vs this time yesterday"),
    kpi("orders", "Orders today", ordToday, ordYest, "number", true, ordSpark, "vs this time yesterday"),
    kpi("refunds", "Refunds today", refToday, refYest, "number", false, refSpark,
      refToday ? `${fmtCurrency(refTodayAmt)} credited` : "none yet today"),
    kpi("tickets", "Open tickets", openCount, null, "number", false, tktSpark,
      `${ticketsToday} opened today`, ticketsToday, ticketsYest),
  ];

  // ── Charts ────────────────────────────────────────────────────────────────
  const revenue14d: RevenuePoint[] = days.map((d, i) => ({
    date: d,
    label: shortLabel(d),
    revenue: Math.round(revSpark[i]),
  }));

  const hourCounts = new Array(24).fill(0);
  for (const o of orders) if (inToday(o.created_at)) hourCounts[new Date(o.created_at).getUTCHours()]++;
  const ordersByHour: HourPoint[] = [];
  for (let h = BIZ_START; h <= BIZ_END; h++) {
    ordersByHour.push({ hour: h, label: hourLabel(h), orders: hourCounts[h] });
  }

  const prodAgg = new Map<string, { revenue: number; qty: number }>();
  for (const it of items) {
    if (!it.products) continue;
    const name = it.products.name;
    const rev = it.qty_bags * num(it.products.price_per_bag);
    const cur = prodAgg.get(name) || { revenue: 0, qty: 0 };
    cur.revenue += rev;
    cur.qty += it.qty_bags;
    prodAgg.set(name, cur);
  }
  const topProducts: TopProduct[] = [...prodAgg.entries()]
    .map(([name, v]) => ({ name, revenue: Math.round(v.revenue), qty: v.qty }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ── Tables ────────────────────────────────────────────────────────────────
  const lowStock: LowStock[] = products
    .filter((p) => p.current_stock_bags < p.par_level_bags)
    .map((p) => ({
      name: p.name,
      roast: p.roast_level.replace("_", " "),
      stock: p.current_stock_bags,
      par: p.par_level_bags,
      severity: clamp01(1 - p.current_stock_bags / Math.max(1, p.par_level_bags)),
    }))
    .sort((a, b) => b.severity - a.severity);

  const agingTickets: AgingTicket[] = openTickets
    .map((t) => ({
      subject: t.subject,
      account: t.accounts?.name ?? "Unknown account",
      priority: t.priority,
      channel: t.channel,
      ageHours: (now.getTime() - new Date(t.created_at).getTime()) / HOUR,
    }))
    .filter((t) => t.ageHours > 24)
    .sort((a, b) => b.ageHours - a.ageHours);

  const briefing = buildBriefing({
    revToday, revYest, ordToday, ordYest, refToday, refTodayAmt, lowStock, agingTickets,
  });

  return {
    generatedAt: now.toISOString(),
    source: "live",
    briefing,
    kpis,
    revenue14d,
    ordersByHour,
    topProducts,
    lowStock,
    agingTickets,
  };
}

// ── KPI builder ──────────────────────────────────────────────────────────────
function kpi(
  key: Kpi["key"],
  label: string,
  value: number,
  compare: number | null,
  format: Kpi["format"],
  upIsGood: boolean,
  spark: number[],
  sub: string,
  altValue?: number,
  altCompare?: number
): Kpi {
  // Some KPIs (open tickets) compare an inflow rate rather than the headline.
  const cur = altValue ?? value;
  const prev = altCompare ?? compare;
  const deltaPct = prev && prev > 0 ? ((cur - prev) / prev) * 100 : null;
  let trend: Trend = "flat";
  if (prev != null && prev > 0) {
    if (cur > prev * 1.02) trend = "up";
    else if (cur < prev * 0.98) trend = "down";
  } else if (cur > 0 && (prev === 0 || prev == null)) {
    trend = cur > 0 ? "up" : "flat";
  }
  const good = upIsGood ? trend !== "down" : trend !== "up";
  return {
    key,
    label,
    display: format === "currency" ? fmtCurrency(value) : fmtNumber(value),
    value,
    format,
    deltaPct,
    trend,
    good,
    sub,
    spark,
  };
}

// ── Briefing builder ─────────────────────────────────────────────────────────
function buildBriefing(d: {
  revToday: number;
  revYest: number;
  ordToday: number;
  ordYest: number;
  refToday: number;
  refTodayAmt: number;
  lowStock: LowStock[];
  agingTickets: AgingTicket[];
}): Briefing[] {
  const lead: Briefing = revenueLine(d.revToday, d.revYest);
  const rest: Briefing[] = [];

  if (d.agingTickets.length > 0) {
    const oldest = d.agingTickets[0];
    rest.push({
      tone: d.agingTickets.length >= 5 ? "alert" : "watch",
      text: `${d.agingTickets.length} support ${plural(d.agingTickets.length, "ticket")} aging past 24h — oldest is “${oldest.subject}” (${Math.floor(oldest.ageHours)}h).`,
    });
  }
  if (d.lowStock.length > 0) {
    const names = d.lowStock.slice(0, 2).map((p) => p.name).join(" and ");
    const critical = d.lowStock.some((p) => p.severity >= 0.8);
    rest.push({
      tone: critical ? "alert" : "watch",
      text: `${d.lowStock.length} ${plural(d.lowStock.length, "product")} below par — restock ${names}${d.lowStock.length > 2 ? " and more" : ""}.`,
    });
  }
  if (d.refToday >= 1) {
    rest.push({
      tone: d.refToday >= 3 ? "watch" : "info",
      text: `${d.refToday} ${plural(d.refToday, "refund")} today totaling ${fmtCurrency(d.refTodayAmt)} in credits.`,
    });
  }
  // Orders pace as a "what changed" line if we have room.
  rest.push(ordersPaceLine(d.ordToday, d.ordYest));

  const rank = { alert: 0, watch: 1, info: 2, good: 3 } as const;
  rest.sort((a, b) => rank[a.tone] - rank[b.tone]);
  return [lead, ...rest].slice(0, 4);
}

function revenueLine(today: number, yest: number): Briefing {
  if (yest <= 0) {
    return { tone: "info", text: `${fmtCurrency(today)} in revenue so far today.` };
  }
  const pct = Math.round(((today - yest) / yest) * 100);
  if (pct <= -5) {
    return {
      tone: pct <= -15 ? "alert" : "watch",
      text: `Revenue is down ${Math.abs(pct)}% vs this time yesterday (${fmtCurrency(today)} vs ${fmtCurrency(yest)}).`,
    };
  }
  if (pct >= 5) {
    return {
      tone: "good",
      text: `Revenue is up ${pct}% vs this time yesterday — ${fmtCurrency(today)} and climbing.`,
    };
  }
  return { tone: "info", text: `Revenue is tracking yesterday — ${fmtCurrency(today)} so far.` };
}

function ordersPaceLine(today: number, yest: number): Briefing {
  if (yest <= 0) return { tone: "info", text: `${today} orders booked so far today.` };
  if (today > yest) return { tone: "good", text: `${today} orders so far — ahead of yesterday’s pace (${yest}).` };
  if (today < yest) return { tone: "watch", text: `${today} orders so far — behind yesterday’s pace (${yest}).` };
  return { tone: "info", text: `${today} orders so far — level with yesterday.` };
}

// ── small utils ──────────────────────────────────────────────────────────────
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const plural = (n: number, w: string) => (n === 1 ? w : `${w}s`);
function hourLabel(h: number): string {
  const ampm = h < 12 ? "a" : "p";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${ampm}`;
}

// ── Offline fallback (Supabase unreachable) — deterministic, never breaks ─────
function demoSnapshot(): Snapshot {
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) days.push(dayKey(new Date(todayStart.getTime() - i * DAY)));
  const base = [18, 16, 19, 21, 17, 14, 13, 20, 22, 19, 23, 21, 20, 11];
  const revSpark = base.map((n) => n * 720);
  const revenue14d = days.map((d, i) => ({ date: d, label: shortLabel(d), revenue: revSpark[i] }));
  const ordersByHour: HourPoint[] = [];
  const shape = [1, 2, 4, 5, 6, 5, 4, 5, 4, 3, 2, 1, 1, 0, 0];
  for (let h = BIZ_START; h <= BIZ_END; h++)
    ordersByHour.push({ hour: h, label: hourLabel(h), orders: shape[h - BIZ_START] ?? 0 });
  return {
    generatedAt: now.toISOString(),
    source: "demo",
    briefing: [
      { tone: "watch", text: "Revenue is down 8% vs this time yesterday ($7,920 vs $8,610)." },
      { tone: "alert", text: "6 support tickets aging past 24h — oldest is “Bags arrived stale” (73h)." },
      { tone: "watch", text: "3 products below par — restock Foundry and Nightshift." },
      { tone: "info", text: "2 refunds today totaling $410 in credits." },
    ],
    kpis: [
      kpi("revenue", "Revenue today", 7920, 8610, "currency", true, revSpark, "vs this time yesterday"),
      kpi("orders", "Orders today", 11, 13, "number", true, base, "vs this time yesterday"),
      kpi("refunds", "Refunds today", 2, 1, "number", false, [0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 2, 2], "$410 credited"),
      kpi("tickets", "Open tickets", 10, null, "number", false, [1, 0, 2, 1, 1, 0, 2, 1, 0, 1, 2, 1, 1, 2], "2 opened today", 2, 1),
    ],
    revenue14d,
    ordersByHour,
    topProducts: [
      { name: "Nightshift", revenue: 4120, qty: 258 },
      { name: "Foundry", revenue: 3480, qty: 278 },
      { name: "Daybreak", revenue: 2910, qty: 194 },
      { name: "Cordial Decaf", revenue: 2240, qty: 160 },
      { name: "Riverstone", revenue: 1980, qty: 132 },
    ],
    lowStock: [
      { name: "Foundry", roast: "medium", stock: 4, par: 40, severity: 0.9 },
      { name: "Nightshift", roast: "dark", stock: 11, par: 40, severity: 0.72 },
      { name: "Daybreak", roast: "light", stock: 18, par: 40, severity: 0.55 },
    ],
    agingTickets: [
      { subject: "Bags arrived stale — whole shipment", account: "Bolt Coffee Roasters", priority: "urgent", channel: "email", ageHours: 73 },
      { subject: "Wrong roast delivered (got dark, ordered med)", account: "White Electric Coffee", priority: "high", channel: "email", ageHours: 52 },
      { subject: "Invoice #4471 doesn’t match delivery", account: "Ceremony Coffee", priority: "high", channel: "phone", ageHours: 41 },
      { subject: "Missing 6 bags from Tuesday drop", account: "Gracie’s Cafe", priority: "normal", channel: "email", ageHours: 33 },
      { subject: "Auto-reorder didn’t trigger this week", account: "Newport Roasters", priority: "normal", channel: "email", ageHours: 28 },
      { subject: "Grinder setting question for new espresso", account: "Bevy Coffee Bar", priority: "low", channel: "chat", ageHours: 26 },
    ],
  };
}
