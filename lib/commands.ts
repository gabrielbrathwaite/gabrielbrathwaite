import { getAllProjects } from "@/lib/projects";
import { nav, socials, site } from "@/lib/site";

/**
 * Command-palette items, assembled on the server so projects come straight from
 * the content layer (no client fetch). The list is fully serializable and
 * handed to the client <CommandPalette/>. Special behaviours (theme toggle) are
 * encoded as an `action` string the client interprets; everything else is a
 * plain link via `href`.
 */
export type CommandItem = {
  id: string;
  label: string;
  group: "Pages" | "Projects" | "Actions" | "Elsewhere";
  hint?: string;
  href?: string;
  action?: "toggle-theme";
  keywords?: string; // extra search terms
};

export function getCommandItems(): CommandItem[] {
  const pages: CommandItem[] = [
    { id: "home", label: "Home", group: "Pages", href: "/" },
    ...nav.map((n) => ({
      id: `page-${n.href}`,
      label: n.label,
      group: "Pages" as const,
      href: n.href,
    })),
  ];

  const projects: CommandItem[] = getAllProjects().map((p) => ({
    id: `project-${p.slug}`,
    label: p.title,
    group: "Projects",
    hint: p.tagline,
    href: `/work/${p.slug}`,
    keywords: p.tags.join(" "),
  }));

  const actions: CommandItem[] = [
    {
      id: "toggle-theme",
      label: "Toggle theme",
      group: "Actions",
      action: "toggle-theme",
      keywords: "dark light mode appearance",
    },
    {
      id: "email",
      label: "Email Gabriel",
      group: "Actions",
      href: `mailto:${site.email}`,
      keywords: "contact reach hire",
    },
  ];

  const links: CommandItem[] = socials
    .filter((s) => s.href.startsWith("http"))
    .map((s) => ({
      id: `link-${s.label}`,
      label: s.label,
      group: "Elsewhere",
      href: s.href,
    }));

  return [...pages, ...projects, ...actions, ...links];
}
