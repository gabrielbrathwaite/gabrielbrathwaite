# Running & editing this site

Everything you'll routinely change lives in a few content files. You should
almost never need to touch a component. This doc is the two-minute reference.

---

## Run it locally

```bash
npm install      # first time only
npm run dev      # → http://localhost:3000
```

Edit a file, save, the page updates. `Ctrl+C` to stop.

To ship: commit and push (or run `npm run build` to check it compiles), then
deploy — see **Deploying** at the bottom.

---

## Add a new project  (the important one)

A project is **one file**. No code changes anywhere.

1. Create `content/projects/<your-slug>.mdx`.
2. Copy the frontmatter block below and fill it in.
3. Drop screenshots in `public/projects/<your-slug>/` (see **Screenshots**).
4. Done — it appears on `/work`, in the ⌘K palette, and in the sitemap
   automatically. Set `featured: true` to also surface it on the home page.

```mdx
---
title: Acme Ops Dashboard
slug: acme-ops                      # must match the filename
tagline: One line, focused on the outcome — what it did for them.
status: live                        # live | case-study | wip
tags: [dashboard, internal-tool]    # used by the /work filter
client: Acme Co                     # or "Self-initiated" / null
timeframe: 2026
role: What you actually did.
problem: What was broken or missing.
approach: How you solved it.
outcome: The result — include a number if one exists.
stack: [Next.js, TypeScript, Supabase]
demoUrl: https://app.acme.com       # the live site, or null
repoUrl: null                       # or a GitHub URL
embed: screenshots                  # iframe | video | screenshots | none
gallery:
  - /projects/acme-ops/cover.png
  - /projects/acme-ops/detail.png
featured: false
order: 4                            # sort position (lower = earlier)
---

Optional long-form write-up goes here in Markdown. It renders on the detail
page under the problem/approach/outcome. You can delete this entirely.
```

**The frontmatter is validated when the site builds.** If you mistype a field
or leave one out, the build fails with the filename and the exact problem — so
a broken project can never quietly ship.

---

## Attach a live demo  (the `embed` field)

When a project's public URL is ready, just set two fields in its `.mdx` and it
goes live. `<LiveDemo>` does the rest.

| You want…                                   | Set this                                              |
| ------------------------------------------- | ----------------------------------------------------- |
| **The real running app, embedded**          | `embed: iframe` + `demoUrl: https://...`              |
| A screen-recording                          | `embed: video` + `gallery: [/projects/slug/demo.mp4]` + optional `poster:` |
| Just screenshots                            | `embed: screenshots` + fill `gallery:`                |
| Case study, no live preview                 | `embed: none`                                         |

For `iframe`: the app loads inside a browser-frame on click (so it never slows
the page). If the site blocks framing (many apps do, for security), it falls
back automatically to the screenshots + an "open full site" link — so set a
`gallery` too as a safety net.

**Example — attaching Seraphym's demo when it's ready:** open
`content/projects/seraphym.mdx` and change:

```diff
- demoUrl: null
- embed: screenshots
+ demoUrl: https://your-seraphym-demo-url.com
+ embed: iframe
```

---

## Screenshots

- Put image files under `public/projects/<slug>/`.
- Reference them in the project's `gallery:` (and they're used as the cover —
  the first gallery image is the card cover).
- Until a file exists, the site shows a tidy labeled placeholder with the exact
  path it's looking for — nothing ever looks broken.
- Aim for ~16:10, lazy-loaded automatically. Keep them reasonably small.

**The two `sample-*.mdx` files are placeholders** — delete them once you have
real projects, or edit them in place.

---

## Edit the other pages

| Page / thing                    | Edit this file        |
| ------------------------------- | --------------------- |
| Home hero, proof line, CTAs     | `app/page.tsx`        |
| Home "what you get" outcomes    | `components/home/WhatIDo.tsx` |
| About story / process / strengths | `lib/about.ts`      |
| Stack items + reasoning         | `lib/stack.ts`        |
| Name, role, nav, social links   | `lib/site.ts`         |
| Colors (light + dark)           | `app/globals.css` + `tailwind.config.ts` |

---

## Contact form & email

- Submissions are stored in Supabase (table `portfolio_contact_submissions`).
- **Email notifications are off until you add a Resend key.** Submissions still
  save; you just won't get pinged. To turn them on:
  1. Get a key at <https://resend.com> → API Keys.
  2. Add it locally in `.env.local` as `RESEND_API_KEY=...`
  3. Add the same in Vercel: project → Settings → Environment Variables
     (Production), then redeploy.
  4. To send from your own domain (not the Resend test sender), verify the
     domain in Resend and set `CONTACT_FROM_EMAIL=noreply@yourdomain.com`.

Read submissions in the Supabase dashboard (they're insert-only via the public
key, so they can't be read through the site's API).

---

## Deploying

The site is on Vercel (team `seraphym1`). Deploy a production build with:

```bash
vercel deploy --prod --yes --scope seraphym1
```

Or connect the repo to Vercel's Git integration and push to deploy.

---

## Where this could grow later (the seams)

- **Projects → a CMS / Supabase.** Right now projects are MDX files read at
  build (simple, version-controlled, free). Everything downstream consumes the
  typed `Project` object from `getAllProjects()` / `getProject()` in
  `lib/projects.ts`. To make projects editable without a deploy, reimplement
  **only those two functions** to fetch + `zod`-parse rows from a Supabase
  `projects` table — pages, cards, and `<LiveDemo>` never touch the filesystem
  directly, so nothing else changes. That's the whole migration.
- **Spam / rate limiting.** The contact rate-limiter is in-memory
  (`lib/rateLimit.ts`) — fine for now. If abuse appears, swap it for an
  Upstash/Redis limiter behind the same function signature.
- **More immersive home previews.** The featured-card live preview already
  switches on a project's `embed` mode; richer previews slot in there.
