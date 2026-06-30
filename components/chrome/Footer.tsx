import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { nav, socials, site } from "@/lib/site";

/**
 * Footer — real links, not decoration. Mirrors the nav, lists socials, and
 * carries the contact CTA so every page ends with a way to reach Gabriel.
 */
export function Footer() {
  const year = "2026"; // static to keep the page fully static / cache-friendly

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <Container className="py-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          {/* Identity + pitch. */}
          <div className="max-w-sm">
            <p className="font-serif text-xl font-semibold text-ink">
              {site.name}
              <span className="text-accent">.</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {site.role} for small businesses. Based in {site.location}.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-block text-sm font-medium text-accent underline underline-offset-4 hover:opacity-80"
            >
              Start a project →
            </Link>
          </div>

          {/* Link columns. */}
          <div className="grid grid-cols-2 gap-10">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-faint">
                Pages
              </p>
              <ul className="mt-3 space-y-2">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted transition-colors hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-faint">
                Elsewhere
              </p>
              <ul className="mt-3 space-y-2">
                {socials.map((s) => {
                  const external = s.href.startsWith("http");
                  return (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        {...(external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="text-sm text-muted transition-colors hover:text-ink"
                      >
                        {s.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-1 border-t border-border pt-6 text-xs text-faint sm:flex-row sm:justify-between">
          <p>
            © {year} {site.name}. Built in Brooklyn.
          </p>
          <p className="font-mono">Next.js · TypeScript · Tailwind</p>
        </div>
      </Container>
    </footer>
  );
}
