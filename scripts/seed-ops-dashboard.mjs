#!/usr/bin/env node
/**
 * ════════════════════════════════════════════════════════════════════
 *  SEED — Ops Dashboard demo  (meridian-coffee-ops Supabase project)
 * ════════════════════════════════════════════════════════════════════
 *
 *  Resets and regenerates a realistic 14 days of data for the live demo at
 *  /projects/ops-dashboard:
 *    • orders + line items, spread across business hours (today only up to
 *      "now", so "vs this time yesterday" is apples-to-apples)
 *    • product stock with a few items knocked below par (the red alerts)
 *    • a handful of refunds (credits) on recent orders
 *    • support tickets, several aged past 24h (the aging table)
 *
 *  The whole reset lives in ONE privileged Postgres function
 *  (`seed_ops_dashboard`, SECURITY DEFINER) so this script can call it with the
 *  publishable key alone — no service-role secret needed. The key is read from
 *  .env.local (SUPABASE_URL + SUPABASE_ANON_KEY), exactly like the rest of the
 *  app, and never leaves the server/CLI.
 *
 *  Run:  npm run seed:ops      (or: node scripts/seed-ops-dashboard.mjs)
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
for (const line of safeRead(join(root, ".env.local")).split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const URL = process.env.SUPABASE_URL;
// Service role works too, but the publishable (anon) key is all that's needed.
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!URL || !KEY) fail("SUPABASE_URL / SUPABASE_ANON_KEY missing in .env.local.");

console.log("→ Reseeding the ops dashboard demo…");
const res = await fetch(`${URL}/rest/v1/rpc/seed_ops_dashboard`, {
  method: "POST",
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
  body: "{}",
});
if (!res.ok) fail(`Seed RPC failed → ${res.status}: ${await res.text()}`);

const r = await res.json();
console.log(`✓ ${r.orders} orders · ${r.order_items} line items · ${r.tickets} tickets · ${r.low_stock} low-stock · ${r.orders_today} orders today.`);
console.log("✓ Open /projects/ops-dashboard — the numbers update live as the ticker runs.");

function safeRead(p) {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return "";
  }
}
function fail(msg) {
  console.error("✗ " + msg);
  process.exit(1);
}
