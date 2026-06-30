import { z } from "zod";

/**
 * ════════════════════════════════════════════════════════════════════
 *  INBOX-TO-CRM DEMO — data, schema, and routing (single source of truth)
 * ════════════════════════════════════════════════════════════════════
 *
 *  The /projects/inbox-to-crm demo turns messy inbound email into clean,
 *  routed CRM records. Everything the demo needs lives here:
 *
 *    • CrmRecordSchema  — the structured shape the LLM must return (and the
 *      shape /api/extract validates defensively before trusting a model).
 *    • SEED_EMAILS      — 7 canned, realistic inbound emails (no real inbox).
 *    • FALLBACK_RECORDS — a pre-computed extraction for every seeded email,
 *      so the demo is fully functional with ZERO API calls when the key is
 *      missing or the rate limit is hit. The demo must never look broken.
 *    • ROUTES           — how each intent maps to a CRM queue + its colour.
 *
 *  The server route and the client UI both import from here, so the email
 *  list, the fallbacks, and the schema can never drift apart.
 */

// --- Enums (kept as const tuples so they drive both zod and the UI) --------
export const INTENTS = ["lead", "support", "billing", "spam", "other"] as const;
export const URGENCIES = ["low", "med", "high"] as const;

export type Intent = (typeof INTENTS)[number];
export type Urgency = (typeof URGENCIES)[number];

// --- The structured CRM record the model must produce ----------------------
export const CrmRecordSchema = z.object({
  contactName: z.string(), // best-guess full name, or "Unknown"
  company: z.string(), // company/org, or "Unknown"
  email: z.string(), // reply-to address (not validated as strict email — messy input)
  intent: z.enum(INTENTS),
  urgency: z.enum(URGENCIES),
  summary: z.string(), // one line, plain English
  owner: z.string(), // suggested owner/queue, e.g. "Sales — Gabriel"
  reply: z.string(), // a suggested 2-sentence reply
});

export type CrmRecord = z.infer<typeof CrmRecordSchema>;

// --- A seeded inbound email ------------------------------------------------
export type SeedEmail = {
  id: string;
  from: string; // "Name <addr@example.com>"
  subject: string;
  receivedAt: string; // display-only, relative-ish
  body: string;
};

// --- Routing: intent → CRM queue + colour treatment ------------------------
// Colours are literal Tailwind classes (dark-aware) so JIT keeps them.
export type Route = {
  queue: string; // the destination column / pipeline
  label: string; // human label
  dot: string; // colour swatch for the routing dot
  chip: string; // pill treatment for the intent badge
  ring: string; // left border accent on the CRM row
};

export const ROUTES: Record<Intent, Route> = {
  lead: {
    queue: "sales",
    label: "Sales",
    dot: "bg-emerald-500",
    chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    ring: "border-l-emerald-500/60",
  },
  support: {
    queue: "support",
    label: "Support",
    dot: "bg-sky-500",
    chip: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
    ring: "border-l-sky-500/60",
  },
  billing: {
    queue: "billing",
    label: "Billing",
    dot: "bg-violet-500",
    chip: "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400",
    ring: "border-l-violet-500/60",
  },
  other: {
    queue: "triage",
    label: "Triage",
    dot: "bg-amber-500",
    chip: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    ring: "border-l-amber-500/60",
  },
  spam: {
    queue: "spam",
    label: "Spam",
    dot: "bg-zinc-400",
    chip: "border-border bg-surface-2 text-faint",
    ring: "border-l-zinc-400/50",
  },
};

// Display order for the routing columns (spam last — it's the trash).
export const ROUTE_ORDER: Intent[] = ["lead", "support", "billing", "other", "spam"];

export const URGENCY_LABEL: Record<Urgency, string> = {
  low: "Low",
  med: "Medium",
  high: "High",
};

// --- The seeded inbox ------------------------------------------------------
export const SEED_EMAILS: SeedEmail[] = [
  {
    id: "lead-westbrook",
    from: "Dana Whitfield <dana@westbrookdental.com>",
    subject: "do you do booking automation??",
    receivedAt: "9:14 AM",
    body: `hi there — found you through a friend. we're a 3-location dental practice and our front desk is drowning. patients call, we miss half of them, and we're double-booking on the paper calendar lol.

is this something you build? we'd want online booking + text reminders that actually sync to our system. ballpark we've got maybe $6-10k for it. how soon could you start? we're in Austin.

thanks,
Dana (office manager, Westbrook Family Dental)`,
  },
  {
    id: "support-portal",
    from: "marcus.reyes@brightline-logistics.com",
    subject: "PORTAL IS DOWN AGAIN — this is the third time",
    receivedAt: "8:02 AM",
    body: `This is unacceptable. The dispatch portal you built for us has been throwing a 500 error since 6am and my drivers can't pull their manifests. We have 40 trucks sitting in the yard right now.

Third outage this month. I need someone on the phone NOW, not a ticket number. If this isn't fixed in the next hour we're going to have to talk about the contract.

Marcus Reyes
Ops Director, Brightline Logistics`,
  },
  {
    id: "billing-invoice",
    from: "accounts@meridian-coffee.co",
    subject: "Question about invoice #2041",
    receivedAt: "Yesterday, 4:47 PM",
    body: `Hi Gabriel,

Quick one — we received invoice #2041 for $2,400 but our agreement was for the $1,800 maintenance tier. Looks like there may be an extra line item ("priority support") we didn't sign up for?

Could you take a look and resend a corrected copy? No rush, just want to get it into this month's books.

Thanks!
Priya, Meridian Coffee`,
  },
  {
    id: "spam-seo",
    from: "growth@rankboost-pro.biz",
    subject: "Re: Your website is INVISIBLE on Google 🚀🚀",
    receivedAt: "Yesterday, 2:13 PM",
    body: `Dear Website Owner,

I was reviewing gabrielbrathwaite.org and noticed you are NOT ranking for 1000s of high-value keywords!!! Our proprietary AI SEO system can get you to PAGE 1 GUARANTEED in 14 days.

Limited spots available this month. Reply "YES" to claim your FREE audit ($499 value) + 50% off our Platinum backlink package.

Best regards,
Viktor | RankBoost Pro Growth Team
Unsubscribe | Unsubscribe | Unsubscribe`,
  },
  {
    id: "vague-call",
    from: "j.tanaka@harborstone.vc",
    subject: "can we talk?",
    receivedAt: "Mon, 11:30 AM",
    body: `Gabriel — got your name from Sarah. Free for a quick call this week?

J.`,
  },
  {
    id: "partnership-agency",
    from: "partnerships@lumen-studio.design",
    subject: "Lumen × you — white-label partnership?",
    receivedAt: "Mon, 9:50 AM",
    body: `Hey Gabriel,

I run partnerships at Lumen, a brand & web studio in Brooklyn. We keep landing clients who need real automation + internal tooling work — exactly the stuff you do — and right now we turn it away.

Would you be open to a white-label arrangement where we bring you in under our umbrella? We'd handle the client relationship and design, you'd own the build. Happy to send over how we structure rev-share. Worth a chat?

Cheers,
Elena Cruz
Head of Partnerships, Lumen Studio`,
  },
  {
    id: "other-renewal",
    from: "no-reply@vercel.com",
    subject: "Your Pro plan renews on July 14",
    receivedAt: "Sun, 6:00 AM",
    body: `Hi there,

This is a reminder that your Vercel Pro subscription will automatically renew on July 14, 2026. Your payment method ending in 4242 will be charged $20.00.

No action is needed to continue your service. You can manage your subscription anytime from your dashboard.

— The Vercel Team`,
  },
];

// --- Pre-computed extractions (the static, zero-API fallback) --------------
// One per seed email. These are what a good extraction looks like; the live
// API path produces the same shape, so the UI is identical either way.
export const FALLBACK_RECORDS: Record<string, CrmRecord> = {
  "lead-westbrook": {
    contactName: "Dana Whitfield",
    company: "Westbrook Family Dental",
    email: "dana@westbrookdental.com",
    intent: "lead",
    urgency: "high",
    summary:
      "3-location dental practice wants online booking + synced text reminders; $6–10k budget, ready to start soon.",
    owner: "Sales — Gabriel",
    reply:
      "Hi Dana — yes, this is squarely what I build, and a 3-location front desk is a perfect fit for booking plus synced text reminders. I have time this week to scope it; would a 20-minute call Thursday work?",
  },
  "support-portal": {
    contactName: "Marcus Reyes",
    company: "Brightline Logistics",
    email: "marcus.reyes@brightline-logistics.com",
    intent: "support",
    urgency: "high",
    summary:
      "Dispatch portal returning 500 errors since 6am; 40 trucks blocked, third outage this month, contract at risk.",
    owner: "Support — urgent escalation",
    reply:
      "Marcus — I'm treating this as a priority incident and am digging into the 500s right now; I'll call you within the next few minutes. I'll also send a written root-cause once your drivers are unblocked so we can make sure this stops recurring.",
  },
  "billing-invoice": {
    contactName: "Priya",
    company: "Meridian Coffee",
    email: "accounts@meridian-coffee.co",
    intent: "billing",
    urgency: "med",
    summary:
      "Invoice #2041 billed $2,400 but agreed tier is $1,800; disputes an extra 'priority support' line item.",
    owner: "Billing — review & reissue",
    reply:
      "Hi Priya — you're right, the 'priority support' line was added in error and your tier is $1,800. I'll void #2041 and send a corrected invoice today so it's clean for this month's books.",
  },
  "spam-seo": {
    contactName: "Viktor",
    company: "RankBoost Pro",
    email: "growth@rankboost-pro.biz",
    intent: "spam",
    urgency: "low",
    summary:
      "Unsolicited guaranteed-SEO / backlink sales pitch with urgency hooks; not a real inquiry.",
    owner: "Spam — no action",
    reply:
      "No reply needed — this is an unsolicited SEO solicitation. Filtering to spam and blocking the sender domain.",
  },
  "vague-call": {
    contactName: "J. Tanaka",
    company: "Harborstone VC",
    email: "j.tanaka@harborstone.vc",
    intent: "other",
    urgency: "med",
    summary:
      "Warm intro via Sarah requesting a call this week; purpose unstated (likely investor/network).",
    owner: "Triage — Gabriel to qualify",
    reply:
      "Hi J. — good to hear from you, and thanks to Sarah for the intro. I'm open Wednesday or Thursday afternoon; send a couple of times that suit and I'll lock one in.",
  },
  "partnership-agency": {
    contactName: "Elena Cruz",
    company: "Lumen Studio",
    email: "partnerships@lumen-studio.design",
    intent: "other",
    urgency: "med",
    summary:
      "Brooklyn design studio proposing a white-label arrangement to subcontract automation/internal-tooling builds with rev-share.",
    owner: "Triage — partnerships",
    reply:
      "Hi Elena — a white-label arrangement sounds genuinely worth exploring; the build side is exactly where I'd add value to your client work. Send over how you structure rev-share and let's grab 30 minutes next week.",
  },
  "other-renewal": {
    contactName: "Unknown",
    company: "Vercel",
    email: "no-reply@vercel.com",
    intent: "other",
    urgency: "low",
    summary:
      "Automated notice: Vercel Pro plan auto-renews July 14 for $20.00; no action required.",
    owner: "Triage — file / no action",
    reply:
      "No reply needed — automated renewal notice. Logging the July 14 $20 charge for expense tracking.",
  },
};
