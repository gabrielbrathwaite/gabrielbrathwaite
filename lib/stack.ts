/**
 * STACK PAGE CONTENT — the tools I build with and *why*. Edit freely.
 * Each item explains the reasoning, not just the name — this page is an
 * argument, not a logo wall.
 */
export type StackItem = {
  name: string;
  why: string; // the one-line reason this earns its place
};

export type StackGroup = {
  category: string;
  blurb: string;
  items: StackItem[];
};

export const stack: StackGroup[] = [
  {
    category: "Frontend",
    blurb: "What the client actually touches. It has to be fast and obvious.",
    items: [
      {
        name: "Next.js",
        why: "One framework for the UI, the API, and the server logic — fewer moving parts to keep in sync, and it deploys anywhere.",
      },
      {
        name: "TypeScript",
        why: "Types catch the dumb mistakes before the client ever sees them. Non-negotiable on anything I expect to maintain.",
      },
      {
        name: "Tailwind CSS",
        why: "Lets me build a consistent, custom-looking interface fast — without a 4,000-line stylesheet nobody can touch later.",
      },
      {
        name: "Framer Motion",
        why: "Motion that guides attention instead of decorating. Used sparingly, it makes software feel considered.",
      },
    ],
  },
  {
    category: "Backend & Data",
    blurb: "Where the truth lives. Boring and reliable beats clever and fragile.",
    items: [
      {
        name: "Supabase",
        why: "A real Postgres database with auth, row-level security, and realtime built in — production-grade without standing up infrastructure.",
      },
      {
        name: "PostgreSQL",
        why: "The database I trust with data that matters. It's been battle-tested for decades; your business records deserve that.",
      },
      {
        name: "Node.js",
        why: "The runtime behind the automations and bots — one language across the whole stack keeps things simple.",
      },
    ],
  },
  {
    category: "Infrastructure",
    blurb: "Where it runs, and how it stays up without me watching it.",
    items: [
      {
        name: "Vercel",
        why: "Push to deploy, preview every change, scale automatically. The right default for anything web-facing.",
      },
      {
        name: "Railway",
        why: "Dead-simple hosting for the always-on services — bots and workers — without babysitting servers.",
      },
      {
        name: "Oracle Cloud",
        why: "A free, always-on box for the long-running jobs where I want full control of the machine.",
      },
      {
        name: "PM2",
        why: "Keeps the always-on processes alive and restarts them when they fall over. Quiet, dependable plumbing.",
      },
    ],
  },
  {
    category: "Tooling",
    blurb: "How the work gets made and shipped.",
    items: [
      {
        name: "GitHub",
        why: "Version control and history. If it's not in git, it doesn't exist — and you can always see exactly what changed.",
      },
      {
        name: "discord.js",
        why: "The library behind the bots — where a lot of this craft started, and still some of my favorite work.",
      },
    ],
  },
];
