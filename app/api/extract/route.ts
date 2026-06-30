import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";
import {
  CrmRecordSchema,
  FALLBACK_RECORDS,
  SEED_EMAILS,
  type CrmRecord,
} from "@/lib/inboxDemo";

/**
 * POST /api/extract — turn one seeded inbound email into a structured CRM record.
 *
 * Design goals (the demo must NEVER look broken):
 *   • The Anthropic key is read server-side only (ANTHROPIC_API_KEY) and never
 *     reaches the client bundle — this file runs only on the server.
 *   • Every seeded email ships a pre-computed extraction (lib/inboxDemo). If the
 *     key is missing, the per-IP rate limit is hit, or the model call/parse
 *     fails for any reason, we return that fallback. The client gets the same
 *     shape either way and shows a small "source" badge.
 *   • Strict JSON: the system prompt forbids prose; we parse defensively (strip
 *     fences, slice to the outermost braces) and zod-validate before trusting it.
 *
 * Request:  { id: string }      — a seeded email id
 * Response: { record, source }  — source is "live" | "fallback" | "rate-limited"
 */

export const runtime = "nodejs";

const MODEL = "claude-haiku-4-5"; // cheap + fast, plenty for extraction
const RATE_LIMIT = { max: 20, windowMs: 60 * 60 * 1000 }; // 20 / IP / hour

type Source = "live" | "fallback" | "rate-limited";

const SYSTEM_PROMPT = `You are an inbound-email triage engine for a CRM. You read one raw email and output ONE structured record.

Output ONLY a single JSON object — no prose, no markdown, no code fences, nothing before or after it. The object must have exactly these keys:

- "contactName": the sender's best-guess full name, or "Unknown".
- "company": the sender's company/org, or "Unknown".
- "email": the sender's reply-to email address.
- "intent": one of "lead", "support", "billing", "spam", "other".
   • lead = a sales/new-work inquiry. • support = an existing customer with a problem/complaint. • billing = an invoice/payment/charge question. • spam = unsolicited bulk/sales spam. • other = anything else (vague, partnership, automated notice, etc.).
- "urgency": one of "low", "med", "high".
- "summary": ONE plain-English sentence capturing the ask.
- "owner": a short suggested owner/queue, e.g. "Sales — Gabriel", "Support — urgent escalation", "Billing — review", "Triage", "Spam — no action".
- "reply": a suggested reply of at most two sentences, in a warm professional voice. For spam or automated notices, say a reply isn't needed and state the action.

Return only the JSON object.`;

export async function POST(req: Request): Promise<Response> {
  // Parse the body defensively — bad input shouldn't 500.
  let id: unknown;
  try {
    ({ id } = await req.json());
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  if (typeof id !== "string") {
    return json({ error: "Expected { id: string }." }, 400);
  }

  const email = SEED_EMAILS.find((e) => e.id === id);
  if (!email) {
    return json({ error: `Unknown email id: ${id}` }, 404);
  }

  const fallback = FALLBACK_RECORDS[email.id];

  // Rate-limit per IP. On limit, fall back instead of failing — the demo keeps working.
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = rateLimit(`extract:${ip}`, RATE_LIMIT);
  if (!limit.ok) {
    return json({ record: fallback, source: "rate-limited" satisfies Source });
  }

  // No key → serve the pre-computed extraction (the default, keyless demo path).
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ record: fallback, source: "fallback" satisfies Source });
  }

  // Live path: call Claude, parse defensively, fall back on any failure.
  try {
    const record = await extractWithClaude(apiKey, email.from, email.subject, email.body);
    return json({ record, source: "live" satisfies Source });
  } catch (err) {
    console.error("[extract] live extraction failed, using fallback:", err);
    return json({ record: fallback, source: "fallback" satisfies Source });
  }
}

// --- Anthropic call (raw fetch — matches the repo's no-SDK convention) ------
async function extractWithClaude(
  apiKey: string,
  from: string,
  subject: string,
  body: string
): Promise<CrmRecord> {
  const userContent = `From: ${from}\nSubject: ${subject}\n\n${body}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    }),
    // Don't let a slow upstream hang the request forever.
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text =
    data.content?.find((b) => b.type === "text")?.text ?? "";

  return parseRecord(text);
}

// --- Defensive JSON parsing -------------------------------------------------
// The model is told JSON-only, but we never trust that blindly: strip code
// fences, slice to the outermost braces, JSON.parse, then zod-validate.
function parseRecord(raw: string): CrmRecord {
  let text = raw.trim();

  // Strip ```json ... ``` fences if the model added them anyway.
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  // Slice to the first "{" … last "}" in case of stray prose.
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }

  const parsed = CrmRecordSchema.safeParse(JSON.parse(text));
  if (!parsed.success) {
    throw new Error(
      `Schema mismatch: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`
    );
  }
  return parsed.data;
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}
