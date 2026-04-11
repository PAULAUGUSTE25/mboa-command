import { motion } from 'framer-motion';
import { ReactNode } from 'react';

const pageVariants = {
  initial:  { opacity: 0, y: 18 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -10 },
};

const pageTransition = {
  type: 'tween',
  ease: [0.25, 0.46, 0.45, 0.94],
  duration: 0.32,
};

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

/* ── Stagger container for lists ── */
export const staggerContainer = {
  hidden:  {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

/* ── Item variant for stagger children ── */
export const fadeSlideUp = {
  hidden:  { opacity: 0, y: 20 },
  show:    { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
};

/* ── Fade in only ── */
export const fadeIn = {
  hidden:  { opacity: 0 },
  show:    { opacity: 1, transition: { duration: 0.4 } },
};

/* ── Scale pop ── */
export const scalePop = {
  hidden:  { opacity: 0, scale: 0.88 },
  show:    { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 22 } },
};
