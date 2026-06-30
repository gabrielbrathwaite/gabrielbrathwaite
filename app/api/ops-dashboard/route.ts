import { NextResponse } from "next/server";
import { getSnapshot } from "@/lib/ops/snapshot";
import { maybeTick } from "@/lib/ops/simulate";

/**
 * The dashboard's live endpoint. The client polls this every few seconds. Each
 * call (a) advances the simulation by at most one event (debounced + capped in
 * maybeTick), then (b) returns the freshly-computed snapshot. The browser only
 * ever reads from here — no Supabase key ever reaches the client.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  await maybeTick();
  const snapshot = await getSnapshot();
  return NextResponse.json(snapshot, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
