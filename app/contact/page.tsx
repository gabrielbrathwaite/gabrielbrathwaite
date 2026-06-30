import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/ui/Section";
import { ContactForm } from "@/components/contact/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell me about the process you want to automate or the tool you need built.",
};

/*
 * /contact — a real qualifying form, framed as a filter (easy to decline), not
 * a wall. Two columns: the human pitch + direct email on the left, the form on
 * the right.
 */
export default function ContactPage() {
  return (
    <Section className="pt-16 sm:pt-20">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* Left: the pitch + the easy out. */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Let&rsquo;s see if it&rsquo;s a fit.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Tell me what&rsquo;s slowing you down. I&rsquo;ll read it properly
            and reply within a day or two with an honest take — whether
            that&rsquo;s a plan, a few questions, or a pointer to someone better
            suited.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-muted">
            <li className="flex gap-3">
              <Dot /> Best for automation, internal tools, and dashboards.
            </li>
            <li className="flex gap-3">
              <Dot /> Small businesses and solo operators especially welcome.
            </li>
            <li className="flex gap-3">
              <Dot /> No budget figured out yet? That&rsquo;s fine — say so.
            </li>
          </ul>

          <p className="mt-8 text-sm text-muted">
            Prefer email?{" "}
            <a
              href={`mailto:${site.email}`}
              className="text-accent underline underline-offset-4 hover:opacity-80"
            >
              {site.email}
            </a>
          </p>
        </div>

        {/* Right: the form. */}
        <div>
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}

function Dot() {
  return (
    <span
      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
      aria-hidden
    />
  );
}
