import type { Metadata } from "next";
import { getSnapshot } from "@/lib/ops/snapshot";
import { OpsDashboard } from "@/components/ops/OpsDashboard";
import { site } from "@/lib/site";

/*
 * /projects/ops-dashboard — the live operations dashboard demo. Server-rendered
 * with a fresh snapshot for an instant, real first paint (and SEO), then the
 * client polls /api/ops-dashboard to stay live. Public + read-only: there is no
 * login wall and the browser never touches a Supabase key.
 */

export const dynamic = "force-dynamic"; // always render against live data

const title = "Ops Dashboard — live demo";
const description =
  "A real-time operations dashboard for a small coffee roastery — the one screen an owner checks with their morning coffee. Live revenue, orders, low-stock alerts, and aging support tickets.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${site.url}/projects/ops-dashboard` },
  openGraph: {
    title: `${title} — ${site.name}`,
    description,
    url: `${site.url}/projects/ops-dashboard`,
    type: "website",
  },
};

export default async function OpsDashboardPage() {
  const initial = await getSnapshot();
  return <OpsDashboard initial={initial} />;
}
