"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

function useFadeUp(): Variants {
  const reduced = useReducedMotion();
  return {
    hidden: { opacity: 0, y: reduced ? 0 : 24 },
    visible: { opacity: 1, y: 0 },
  };
}

/**
 * Staggers its direct <Reveal> children in as the group scrolls into view.
 * `animate` runs immediately instead of waiting for the viewport (hero use).
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.1,
  animate = false,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  animate?: boolean;
}) {
  const reduced = useReducedMotion();
  const variants = {
    visible: { transition: { staggerChildren: reduced ? 0 : stagger } },
  };

  if (animate) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={variants}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Reveal({
  children,
  className,
  duration = 0.5,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const fadeUp = useFadeUp();
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: reduced ? 0 : duration, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
