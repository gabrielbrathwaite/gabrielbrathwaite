import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Button — the single button language for the whole site. Renders as a real
 * <a> (via next/link) when `href` is set, otherwise a <button>. Three variants
 * and two sizes cover every call-to-action we need.
 */
type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  // The one loud action — solid accent.
  primary:
    "bg-accent text-accent-ink hover:opacity-90 active:opacity-100 shadow-sm",
  // The quieter action — outlined.
  secondary:
    "border border-border bg-surface text-ink hover:border-ink/40 hover:bg-surface-2",
  // The barely-there action — text only.
  ghost: "text-muted hover:text-ink hover:bg-surface-2",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[15px]",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps &
  (
    | ({ href: string } & React.ComponentProps<typeof Link>)
    | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  )) {
  const classes = cn(base, VARIANTS[variant], SIZES[size], className);

  if (href) {
    // External links open safely; internal links use client routing.
    const external = href.startsWith("http");
    return (
      <Link
        {...(rest as React.ComponentProps<typeof Link>)}
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
