/**
 * Site-wide config: identity, nav, and links. Edit here, not in components.
 */
export const site = {
  name: "Gabriel Brathwaite",
  // Short role line used in nav / OG / footer.
  role: "AI automation & internal tools",
  location: "Brooklyn, NY",
  email: "gabembrathwaite@gmail.com",
  // Set once you have the deployed domain; used for absolute OG/sitemap URLs.
  url: "https://gabrielbrathwaite.org",
  description:
    "Brooklyn developer building AI automation and internal tools, dashboards, and software for small businesses.",
};

// Primary navigation.
export const nav = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Stack", href: "/stack" },
  { label: "Contact", href: "/contact" },
] as const;

// External / social links shown in the footer.
export const socials = [
  { label: "Email", href: "mailto:gabembrathwaite@gmail.com" },
  { label: "GitHub", href: "https://github.com/gabrielbrathwaite" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/gabriel-brathwaite-939a86392",
  },
] as const;
