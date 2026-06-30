/** Tiny formatters shared by server (snapshot) and client (UI). No deps. */

export function fmtCurrency(n: number, cents = false): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
}

export function fmtNumber(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/** "+12%" / "−7%" / "0%". Uses a real minus sign for typographic polish. */
export function fmtPct(p: number | null): string {
  if (p === null) return "—";
  const r = Math.round(p);
  if (r === 0) return "0%";
  return `${r > 0 ? "+" : "−"}${Math.abs(r)}%`;
}

/** "3h" / "2d 4h" — compact age from a number of hours. */
export function fmtAge(hours: number): string {
  if (hours < 1) return "just now";
  if (hours < 24) return `${Math.floor(hours)}h`;
  const d = Math.floor(hours / 24);
  const h = Math.floor(hours % 24);
  return h ? `${d}d ${h}h` : `${d}d`;
}
