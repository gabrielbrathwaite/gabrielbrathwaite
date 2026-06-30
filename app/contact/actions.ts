"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { rateLimit } from "@/lib/rateLimit";

/**
 * Contact form server action.
 *
 * Flow: validate (zod) → honeypot check → rate-limit → insert into Supabase →
 * fire an email notification (Resend). The insert uses the project's
 * publishable key against an INSERT-ONLY RLS table, so no secret service key is
 * needed and submissions can't be read back through the API.
 *
 * Returns a typed state object consumed by the client form via useFormState.
 */

// Allowed option values — kept in sync with the <select>s in ContactForm.
const BUDGETS = ["Not sure yet", "Under $2k", "$2k–$5k", "$5k–$15k", "$15k+"] as const;
const TIMELINES = ["ASAP", "2–4 weeks", "1–2 months", "Just exploring"] as const;

const Schema = z.object({
  name: z.string().min(1, "Your name helps.").max(120),
  email: z.string().email("That email looks off."),
  company: z.string().max(160).optional().or(z.literal("")),
  need: z
    .string()
    .min(10, "A sentence or two about what you need.")
    .max(4000),
  budget: z.enum(BUDGETS).optional().or(z.literal("")),
  timeline: z.enum(TIMELINES).optional().or(z.literal("")),
  message: z.string().max(4000).optional().or(z.literal("")),
});

export type ContactState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof Schema>, string>>;
};

export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  // 1. Honeypot: a hidden "website" field real users never fill. Bots do.
  if ((formData.get("website") as string)?.trim()) {
    // Pretend success so bots don't learn they were caught.
    return { ok: true, message: "Thanks — I'll be in touch." };
  }

  // 2. Validate. FormData.get() returns `null` for any field not present in the
  // submission (e.g. the optional "message"), and `null` satisfies neither
  // z.string() nor z.literal("") — so normalize missing values to `undefined`,
  // which `.optional()` accepts.
  const field = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v : undefined;
  };
  const parsed = Schema.safeParse({
    name: field("name"),
    email: field("email"),
    company: field("company"),
    need: field("need"),
    budget: field("budget"),
    timeline: field("timeline"),
    message: field("message"),
  });

  if (!parsed.success) {
    const fieldErrors: ContactState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof z.infer<typeof Schema>;
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, message: "Quick fixes needed below.", fieldErrors };
  }

  // 3. Rate-limit per IP (best-effort; see lib/rateLimit).
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = rateLimit(`contact:${ip}`);
  if (!limit.ok) {
    return {
      ok: false,
      message: `That's a few submissions in a row — try again in ${Math.ceil(
        limit.retryAfterSec / 60
      )} min.`,
    };
  }

  const data = parsed.data;

  // 4. Store in Supabase (insert-only RLS table, publishable key).
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error("[contact] Supabase env vars missing");
    return {
      ok: false,
      message: "Something broke on my end. Email me directly instead?",
    };
  }

  try {
    const res = await fetch(
      `${url}/rest/v1/portfolio_contact_submissions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: key,
          Authorization: `Bearer ${key}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          company: data.company || null,
          need: data.need,
          budget_band: data.budget || null,
          timeline: data.timeline || null,
          message: data.message || null,
          user_agent: hdrs.get("user-agent")?.slice(0, 300) ?? null,
        }),
      }
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase ${res.status}: ${body}`);
    }
  } catch (err) {
    console.error("[contact] insert failed:", err);
    return {
      ok: false,
      message: "Couldn't save that. Mind emailing me directly?",
    };
  }

  // 5. Notify by email (best-effort — never block the user on this).
  await notify(data).catch((e) => console.error("[contact] email failed:", e));

  return {
    ok: true,
    message: "Got it — I'll get back to you within a day or two.",
  };
}

// Fire-and-forget Resend notification. No-ops cleanly if RESEND_API_KEY is unset.
async function notify(data: z.infer<typeof Schema>) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";
  if (!apiKey || !to) return; // email disabled until configured

  const lines = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.company && `Company: ${data.company}`,
    `Need: ${data.need}`,
    data.budget && `Budget: ${data.budget}`,
    data.timeline && `Timeline: ${data.timeline}`,
    data.message && `Message: ${data.message}`,
  ].filter(Boolean);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: `Portfolio <${from}>`,
      to: [to],
      reply_to: data.email,
      subject: `New project inquiry — ${data.name}`,
      text: lines.join("\n"),
    }),
  });

  // fetch only rejects on network errors, not HTTP 4xx/5xx — so surface Resend
  // API errors (e.g. unverified sender, bad key) instead of failing silently.
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${body}`);
  }
}
