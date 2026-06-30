/**
 * ════════════════════════════════════════════════════════════════════
 *  ABOUT PAGE CONTENT — edit this file to change the /about story.
 * ════════════════════════════════════════════════════════════════════
 *
 *  This is the most personal page on the site, so it's the most worth making
 *  truly yours. The copy below is grounded in what's known (Brooklyn, Discord
 *  tooling → small-business tooling, Seraphym) but you should rewrite it in
 *  your own voice. Nothing here requires touching the components.
 */

// ── INTRO ─────────────────────────────────────────────────────────────
export const intro = {
  eyebrow: "About",
  // Big plain-language statement of who you are.
  headline: "I build the unglamorous software that makes a business run.",
  body: "I'm Gabriel — a developer in Brooklyn. I didn't come up through a CS degree or a big-tech pipeline; I came up by building things people actually used, breaking them, and fixing them until they held. Today I build AI automation, internal tools, and dashboards for small businesses — the stuff that quietly saves hours and rarely gets shown off.",
};

// ── THE STORY (decision points you can expand) ────────────────────────
// Each step is a turning point. `detail` is revealed when the reader opens it.
export const story = [
  {
    marker: "Where it started",
    title: "Running a community taught me to build systems.",
    summary:
      "I architected Seraphym — a Discord community with thousands of moving parts.",
    detail:
      "Moderation, a member economy, support tickets, reputation — all of it had to run without me babysitting it. That's where I learned that the hard part isn't the code, it's designing a system people can actually live inside.",
  },
  {
    marker: "The turn",
    title: "I realized small businesses have the exact same problems.",
    summary:
      "Scattered data, manual busywork, tools that don't fit how they work.",
    detail:
      "A shop owner copy-pasting between five tabs is the same problem as a server drowning in manual moderation. Different words, identical shape. I started building for businesses with the same instincts I'd sharpened on Seraphym.",
  },
  {
    marker: "How I work now",
    title: "I pick the boring, durable solution on purpose.",
    summary: "Software you own, shaped to your process — not a rented template.",
    detail:
      "I'd rather ship something simple that runs for years than something clever that breaks the moment you look away. When the right answer is a plain rule instead of an AI model, I'll tell you — and build that instead.",
  },
];

// ── HOW I WORK (interactive client-process flow) ──────────────────────
// Click a phase → see what happens, what you do, and what you walk away with.
export const process = [
  {
    phase: "Scope",
    duration: "Week 1",
    happens:
      "We talk through the actual bottleneck — not the feature you think you want, but the time you're losing and why. I map it and tell you honestly whether it's worth building.",
    youDo: "Show me the messy reality: the spreadsheet, the inbox, the workflow.",
    youGet: "A clear, written scope with a fixed price and a definition of done.",
  },
  {
    phase: "Design",
    duration: "Week 1–2",
    happens:
      "I design the smallest thing that solves the whole problem, and walk you through it before a line of production code is written.",
    youDo: "React to a concrete plan and flag anything that doesn't fit.",
    youGet: "A shared picture of exactly what's being built — no surprises later.",
  },
  {
    phase: "Build",
    duration: "Week 2–4",
    happens:
      "I build in the open with regular check-ins, so you see it taking shape and can course-correct early instead of at the end.",
    youDo: "Try it on real data and tell me where it pinches.",
    youGet: "Working software, tested, with the rough edges already sanded down.",
  },
  {
    phase: "Hand off",
    duration: "Ongoing",
    happens:
      "I ship it, document it so you're never locked to me, and stay available for the inevitable 'can it also…'.",
    youDo: "Use it. Come back when the business changes.",
    youGet: "Something you own outright — plus someone who knows it cold.",
  },
];

// ── WHAT I'M GOOD AT (give → get) ─────────────────────────────────────
export const strengths = [
  {
    give: "A repetitive task",
    get: "An automation that runs itself",
    example:
      "Inbound emails parsed into clean CRM records; weekly reports that build themselves.",
  },
  {
    give: "A mess of data",
    get: "A dashboard that makes it obvious",
    example:
      "Seraphym's whole operation on one screen, refreshed live, role-gated by staff level.",
  },
  {
    give: "A workflow nothing fits",
    get: "A tool built exactly around it",
    example:
      "Internal apps shaped to your process instead of forcing your process into someone else's SaaS.",
  },
  {
    give: "A half-formed AI idea",
    get: "A scoped, shipped feature",
    example:
      "The honest version: I build the part that helps and skip the part that's just hype.",
  },
];

// ── OFF THE CLOCK (the human bit — keep it short + real) ───────────────
export const offTheClock = {
  title: "When I'm not building",
  body: "I'm usually deep in a community somewhere, taking apart something that works to see why, or wandering Brooklyn for the specific kind of coffee that justifies the walk. I care a lot about how things feel — software included — and I think the details nobody notices are exactly the ones that matter.",
};
