import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

/**
 * Open Graph image for the Inbox-to-CRM live demo — same warm-dark palette +
 * ember accent as the rest of the site's share cards.
 */
export const alt = "Inbox-to-CRM Automation — live demo";
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
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#ff6a3d" }} />
          <div style={{ color: "#ada89b", fontSize: 26 }}>
            {`${site.name} — live demo`}
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
            Inbox-to-CRM Automation
          </div>
          <div
            style={{
              display: "flex",
              color: "#ada89b",
              fontSize: 30,
              marginTop: 22,
              lineHeight: 1.3,
              maxWidth: 940,
            }}
          >
            Messy inbound email in → clean, routed CRM records out. Contact,
            intent, urgency, summary, and a drafted reply.
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
