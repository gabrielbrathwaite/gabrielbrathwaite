import "server-only";
import { sbSelect, sbInsert, sbDelete, opsConfigured } from "./supabase";

/**
 * The live event stream. Every poll of /api/ops-dashboard calls maybeTick(),
 * which inserts a fresh order (and, now and then, a support ticket) so the
 * numbers visibly move while you watch — without a casino of churn.
 *
 * Volume is capped three ways so the demo DB can't grow forever:
 *   1. DEBOUNCE — at most one insert every ~4s GLOBALLY. The check is the age
 *      of the most-recent order in the DB, so it holds across serverless
 *      instances and no matter how many people are watching at once.
 *   2. DAILY CAP — once "today" has MAX_TODAY orders, ticking stops inserting
 *      (it just lets the dashboard re-read). Each new day naturally resets.
 *   3. ROLLING WINDOW — old rows beyond RETAIN_DAYS are pruned occasionally.
 *
 * Writes use the anon key under a tightly-scoped INSERT policy (status='new'),
 * so the live demo needs no service-role secret. The browser never writes —
 * it only ever GETs our own API route.
 */

const DAY = 86_400_000;
const DEBOUNCE_MS = 4000;
const MAX_TODAY = 120;
const RETAIN_DAYS = 21;
const TICKET_CHANCE = 0.18; // ~1 in 5.5 ticks also opens a ticket
const PRUNE_CHANCE = 0.02;

type IdRow = { id: string };
type ProductRow = { id: string; price_per_bag: number | string };

const TICKET_SUBJECTS = [
  "Short by 2 bags on this morning's drop",
  "Can we move delivery to before 9am?",
  "Invoice question on last week's order",
  "Espresso tasting ashy — grind help?",
  "Need to add a decaf to the standing order",
  "Bag seal popped on one unit",
  "Requesting a rush order for the weekend",
  "Switch us to the medium roast going forward",
];
const PRIORITIES = ["low", "normal", "normal", "high"] as const;

const pick = <T>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const num = (v: number | string) => (typeof v === "string" ? parseFloat(v) : v);

export async function maybeTick(): Promise<void> {
  if (!opsConfigured()) return;
  try {
    // 1. Global debounce off the newest order's age.
    const latest = await sbSelect<{ created_at: string }>(
      `orders?select=created_at&order=created_at.desc&limit=1`
    );
    if (latest[0] && Date.now() - new Date(latest[0].created_at).getTime() < DEBOUNCE_MS) return;

    // 2. Daily cap.
    const todayIso = new Date(
      Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())
    ).toISOString();
    const todays = await sbSelect<IdRow>(`orders?select=id&created_at=gte.${todayIso}`);
    if (todays.length >= MAX_TODAY) return;

    const [accounts, products] = await Promise.all([
      sbSelect<IdRow>(`accounts?select=id&limit=60`),
      sbSelect<ProductRow>(`products?select=id,price_per_bag&limit=20`),
    ]);
    if (!accounts.length || !products.length) return;

    // Build 1–3 line items, compute the total, THEN insert the order with that
    // total (no UPDATE needed → works under the insert-only anon policy).
    const lineCount = 1 + Math.floor(Math.random() * 3);
    const lines = Array.from({ length: lineCount }, () => {
      const p = pick(products);
      const qty = 4 + Math.floor(Math.random() * 24);
      return { product_id: p.id, qty_bags: qty, price: num(p.price_per_bag) };
    });
    const total = Math.round(lines.reduce((s, l) => s + l.qty_bags * l.price, 0) * 100) / 100;

    const [order] = await sbInsert<IdRow>("orders", {
      account_id: pick(accounts).id,
      status: "new",
      total,
    });
    if (order?.id) {
      await sbInsert(
        "order_items",
        lines.map((l) => ({ order_id: order.id, product_id: l.product_id, qty_bags: l.qty_bags })),
        { returning: false }
      );
    }

    // 3. Occasionally a new support ticket arrives.
    if (Math.random() < TICKET_CHANCE) {
      await sbInsert(
        "support_tickets",
        { account_id: pick(accounts).id, subject: pick(TICKET_SUBJECTS), channel: pick(["email", "phone", "chat"]), priority: pick(PRIORITIES), status: "open" },
        { returning: false }
      );
    }

    if (Math.random() < PRUNE_CHANCE) await prune().catch(() => {});
  } catch (err) {
    // The dashboard must keep rendering even if a tick fails — never throw.
    console.error("[ops] tick failed:", err);
  }
}

/** Rolling-window prune: drop rows older than RETAIN_DAYS (items first, FK). */
async function prune(): Promise<void> {
  const cutoff = new Date(Date.now() - RETAIN_DAYS * DAY).toISOString();
  const old = await sbSelect<IdRow>(`orders?select=id&created_at=lt.${cutoff}&limit=100`);
  if (old.length) {
    const ids = old.map((o) => o.id).join(",");
    await sbDelete(`order_items?order_id=in.(${ids})`);
    await sbDelete(`orders?id=in.(${ids})`);
  }
  await sbDelete(`support_tickets?created_at=lt.${cutoff}`);
}
