/**
 * Typed Framer Motion exports
 * Eliminates the need for `as any` casts throughout the codebase
 */
import { motion, HTMLMotionProps, SVGMotionProps } from "framer-motion";
import { Link } from "react-router";

// HTML element motion components
export const MotionDiv = motion.div;
export const MotionSpan = motion.span;
export const MotionP = motion.p;
export const MotionH1 = motion.h1;
export const MotionH2 = motion.h2;
export const MotionH3 = motion.h3;
export const MotionButton = motion.button;
export const MotionImg = motion.img;
export const MotionNav = motion.nav;
export const MotionUl = motion.ul;
export const MotionLi = motion.li;
export const MotionA = motion.a;
export const MotionSection = motion.section;
export const MotionArticle = motion.article;
export const MotionHeader = motion.header;
export const MotionFooter = motion.footer;
export const MotionForm = motion.form;
export const MotionInput = motion.input;
export const MotionTextarea = motion.textarea;
export const MotionLabel = motion.label;

// SVG element motion components
export const MotionSvg = motion.svg;
export const MotionPath = motion.path;
export const MotionCircle = motion.circle;

// React Router Link with motion
export const MotionLink = motion(Link);

// Re-export types for convenience
export type { HTMLMotionProps, SVGMotionProps };

// Common animation variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

// Stagger children helper
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
