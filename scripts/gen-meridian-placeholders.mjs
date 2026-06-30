/**
 * One-off: generate tasteful, on-brand placeholder screenshots for the Meridian
 * case study so the page is complete (zero 404s) until the real captures land.
 * Each placeholder is labeled with the EXACT shot to capture as a replacement.
 *
 *   node scripts/gen-meridian-placeholders.mjs
 *
 * Palette matches the site OG: warm-dark #0c0b0a / cream #f5f2ea / ember #ff6a3d.
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "projects", "meridian");
mkdirSync(OUT, { recursive: true });

const EMBER = "#ff6a3d";

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// A single placeholder frame: brand dot + role label + "capture:" instruction,
// on either a cream (light) or warm-dark (dark) ground.
function svg({ w, h, dark, seat, capture }) {
  const bg = dark ? "#0c0b0a" : "#f5f2ea";
  const ink = dark ? "#f5f2ea" : "#1a1714";
  const muted = dark ? "#ada89b" : "#6b6358";
  const line = dark ? "#26221d" : "#e4ddcf";
  const pad = Math.round(w * 0.06);

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${Math.round(w * 0.02)}" fill="none" stroke="${line}" stroke-width="2"/>
  <g transform="translate(${pad}, ${pad})">
    <circle cx="9" cy="9" r="9" fill="${EMBER}"/>
    <text x="30" y="15" font-family="Georgia, 'Times New Roman', serif" font-size="${Math.round(w * 0.018)}" fill="${muted}">Meridian Coffee Roasters — Wholesale Operations</text>
  </g>
  <g transform="translate(${pad}, ${Math.round(h * 0.46)})">
    <text x="0" y="0" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="${Math.round(w * 0.055)}" fill="${ink}">${esc(seat)}</text>
    <text x="0" y="${Math.round(h * 0.085)}" font-family="ui-monospace, 'SF Mono', Menlo, monospace" font-size="${Math.round(w * 0.02)}" fill="${EMBER}">placeholder — replace with real capture</text>
    <text x="0" y="${Math.round(h * 0.135)}" font-family="ui-monospace, 'SF Mono', Menlo, monospace" font-size="${Math.round(w * 0.017)}" fill="${muted}">capture: ${esc(capture)}</text>
  </g>
</svg>`);
}

const shots = [
  {
    file: "hero.png",
    w: 1600, h: 1000, dark: false,
    seat: "Hero",
    capture:
      "Owner view, light, full window — the one-screen overview (used as the card cover + share image).",
  },
  {
    file: "owner.png",
    w: 1600, h: 900, dark: false,
    seat: "Owner",
    capture:
      "Owner seat — revenue, cash-in vs. outstanding, low-stock alerts, full order book.",
  },
  {
    file: "production.png",
    w: 1600, h: 900, dark: false,
    seat: "Production",
    capture:
      "Production seat — roast-queue board with Queued / Roasting / Done columns.",
  },
  {
    file: "delivery.png",
    w: 1600, h: 900, dark: false,
    seat: "Delivery",
    capture:
      "Delivery seat — today's route-ordered manifest as a checklist, a few stops ticked.",
  },
  {
    file: "mobile-dark.png",
    w: 820, h: 1640, dark: true,
    seat: "Mobile · dark",
    capture:
      "One seat on a phone in dark mode (DevTools iPhone frame) — show the PWA install affordance if visible.",
  },
];

for (const s of shots) {
  const out = join(OUT, s.file);
  await sharp(svg(s)).png().toFile(out);
  console.log("wrote", out, `(${s.w}×${s.h})`);
}
console.log("\nDone — drop real captures over these same paths to replace them.");
