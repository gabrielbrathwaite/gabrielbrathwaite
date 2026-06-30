import { ImageResponse } from "next/og";
import { getAllProjects, getProject } from "@/lib/projects";
import { site } from "@/lib/site";

/**
 * Per-project Open Graph image — composed at build with the project's title and
 * tagline so each case study gets a unique, on-brand share card. Same warm-dark
 * palette + ember accent as the site-wide OG.
 */
export const alt = "Project case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// One image per project slug.
export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export default async function Og({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  const title = project?.title ?? site.name;
  const tagline = project?.tagline ?? site.description;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0b0a",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#ff6a3d" }} />
          <div style={{ color: "#ada89b", fontSize: 26 }}>
            {`${site.name} — selected work`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#f5f2ea",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1.5,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              color: "#ada89b",
              fontSize: 30,
              marginTop: 22,
              lineHeight: 1.3,
              maxWidth: 920,
            }}
          >
            {tagline.length > 130 ? tagline.slice(0, 127) + "…" : tagline}
          </div>
        </div>

        <div
          style={{
            height: 6,
            width: 220,
            background: "linear-gradient(90deg, #ff6a3d, transparent)",
            borderRadius: 999,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
