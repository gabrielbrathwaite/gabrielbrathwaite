"use client";

import { ThemeProvider as NextThemes } from "next-themes";

/**
 * ThemeProvider — wraps the app so dark mode is first-class:
 *  - defaults to the OS preference (`defaultTheme: "system"`)
 *  - lets the user override and persists the choice (next-themes → localStorage)
 *  - toggles the `.dark` class on <html>, which all our tokens key off of
 *
 * `disableTransitionOnChange` prevents a color-flash when switching themes.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemes>
  );
}
