"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Reveal — fade + rise a block into view on scroll. Backed by Framer Motion's
 * whileInView (an IntersectionObserver under the hood) with `once: true`, so it
 * animates a single time and then stops watching. Under prefers-reduced-motion
 * it renders content in place with no animation.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.5, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}
