import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Card — the single surface primitive. If `href` is passed it becomes a fully
 * clickable card (with a hover lift); otherwise it's a plain container. Used by
 * project cards, the home highlight reel, process steps, etc. so every raised
 * surface on the site reads the same.
 */
export function Card({
  href,
  interactive,
  className,
  children,
}: {
  href?: string;
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const base = cn(
    "rounded-2xl border border-border bg-surface",
    (interactive || href) &&
      "transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-[0_12px_40px_-16px_rgb(0_0_0/0.25)]",
    className
  );

  if (href) {
    const external = href.startsWith("http");
    return (
      <Link
        href={href}
        className={cn(base, "block focus-visible:outline-offset-4")}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </Link>
    );
  }

  return <div className={base}>{children}</div>;
}
