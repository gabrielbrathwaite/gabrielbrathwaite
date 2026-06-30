import "server-only";

/**
 * ════════════════════════════════════════════════════════════════════
 *  OPS DASHBOARD — server-only Supabase access
 * ════════════════════════════════════════════════════════════════════
 *
 *  The live ops dashboard (/projects/ops-dashboard) talks to the
 *  `meridian-coffee-ops` Supabase project. ALL access happens here, on the
 *  server — the browser never sees a Supabase key. The public page is genuinely
 *  read-only: it only ever hits our own /api/ops-dashboard route, which reads
 *  data and ticks the simulation.
 *
 *  Keys (in priority order):
 *   • Reads + the keyless live ticker use SUPABASE_ANON_KEY (publishable). The
 *     ops tables expose anon SELECT, and a tightly-scoped anon INSERT policy
 *     lets the ticker add demo-shaped rows — so the demo is live with zero
 *     extra secrets. orders/products are world-readable by design.
 *   • Destructive work (the full reseed script, pruning) prefers
 *     SUPABASE_SERVICE_ROLE_KEY when present. It is SERVER-ONLY and never
 *     shipped to the client. Mirrors how lib/projects.ts frames its data seam.
 *
 *  This module mirrors the raw-REST pattern already used in
 *  app/contact/actions.ts (apikey + Bearer headers), so there's no new client
 *  dependency to reason about.
 */

const URL = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Is the ops dashboard wired to a database at all? (Drives the demo banner.) */
export function opsConfigured(): boolean {
  return Boolean(URL && ANON);
}

function rest(): { url: string; readKey: string; writeKey: string } {
  if (!URL || !ANON) throw new Error("ops: SUPABASE_URL / SUPABASE_ANON_KEY missing");
  // Writes go through the service role if available (bypasses RLS, needed for
  // the reseed), otherwise the anon key under the scoped demo-insert policy.
  return { url: URL, readKey: ANON, writeKey: SERVICE || ANON };
}

function headers(key: string, extra?: Record<string, string>): HeadersInit {
  return { apikey: key, Authorization: `Bearer ${key}`, ...extra };
}

/** GET a PostgREST query (path is everything after `/rest/v1/`). */
export async function sbSelect<T = unknown>(query: string): Promise<T[]> {
  const { url, readKey } = rest();
  const res = await fetch(`${url}/rest/v1/${query}`, {
    headers: headers(readKey),
    // Always live — this is a real-time dashboard, never serve a cached body.
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`ops select ${res.status}: ${await res.text()}`);
  return (await res.json()) as T[];
}

/** INSERT rows; returns the created rows. */
export async function sbInsert<T = unknown>(
  table: string,
  rows: unknown,
  { returning = true }: { returning?: boolean } = {}
): Promise<T[]> {
  const { url, writeKey } = rest();
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: headers(writeKey, {
      "Content-Type": "application/json",
      Prefer: returning ? "return=representation" : "return=minimal",
    }),
    body: JSON.stringify(rows),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`ops insert ${res.status}: ${await res.text()}`);
  return returning ? ((await res.json()) as T[]) : [];
}

/** DELETE rows matching a PostgREST filter (e.g. `orders?created_at=lt.X`). */
export async function sbDelete(query: string): Promise<void> {
  const { url, writeKey } = rest();
  const res = await fetch(`${url}/rest/v1/${query}`, {
    method: "DELETE",
    headers: headers(writeKey, { Prefer: "return=minimal" }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`ops delete ${res.status}: ${await res.text()}`);
}
