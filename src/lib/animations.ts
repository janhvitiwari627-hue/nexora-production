import type { Variants, Transition } from "framer-motion";

/** Smooth ease used across page-level animations. */
export const easeOut: Transition["ease"] = [0.16, 1, 0.3, 1];

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: easeOut } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: easeOut },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/** Use as a prop spread: `<motion.div {...scaleOnHover} />`. */
export const scaleOnHover = {
  whileHover: { scale: 1.03, transition: { duration: 0.2, ease: easeOut } },
  whileTap: { scale: 0.98 },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: easeOut } },
};

/** Skeleton → real content cross-fade. Apply to the real content. */
export const contentReveal: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

/** Default viewport options for `whileInView`. */
export const inViewOnce = { once: true, amount: 0.2 } as const;
