import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

/**
 * Default Open Graph / social-share image (1200×630), generated at build with
 * next/og — no extra dependency, no static asset to maintain. Applies to every
 * page that doesn't define its own. Uses the site's warm-dark palette + ember
 * accent so shared links look on-brand.
 */
export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Og() {
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
        {/* top row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#ff6a3d",
            }}
          />
          <div style={{ color: "#ada89b", fontSize: 26 }}>{site.location}</div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              color: "#f5f2ea",
              fontSize: 92,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -2,
            }}
          >
            {site.name}
            <span style={{ color: "#ff6a3d" }}>.</span>
          </div>
          <div style={{ color: "#ada89b", fontSize: 38, marginTop: 24 }}>
            AI automation, internal tools &amp; dashboards
          </div>
        </div>

        {/* accent rule */}
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
