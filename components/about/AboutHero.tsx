"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Eyebrow } from "@/components/ui/Section";
import { intro } from "@/lib/about";

/**
 * AboutHero — the opening. The "motion signature" is a quiet one: an accent
 * line draws itself underneath the headline and the intro fades up on load.
 *
 * The headline itself is painted immediately and never animated — it's the
 * page's largest contentful paint, so hiding it behind an entrance animation
 * would hurt LCP (and readability). The flourish lives on secondary elements.
 * Under prefers-reduced-motion everything renders in place.
 */
export function AboutHero() {
  const reduce = useReducedMotion();

  return (
    <header className="max-w-3xl">
      <Eyebrow>{intro.eyebrow}</Eyebrow>

      <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-6xl">
        {intro.headline}
      </h1>

      {/* The drawing accent line — the signature flourish. */}
      <motion.div
        className="mt-6 h-px origin-left bg-gradient-to-r from-accent to-transparent"
        initial={reduce ? false : { scaleX: 0 }}
        animate={reduce ? {} : { scaleX: 1 }}
        transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
      />

      <motion.p
        className="mt-6 text-lg leading-relaxed text-muted"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={reduce ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      >
        {intro.body}
      </motion.p>
    </header>
  );
}
