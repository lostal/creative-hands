import { ReactNode, useRef } from "react";
import { useInView } from "framer-motion";
import { MotionDiv } from "../lib/motion";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  once?: boolean;
  amount?: number;
}

/**
 * Componente de animación al hacer scroll
 * Envuelve contenido para animarlo cuando entra en el viewport
 */
const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.5,
  once = true,
  amount = 0.2,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });

  const directions = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
    none: {},
  };

  const initial = {
    opacity: 0,
    ...directions[direction],
  };

  const animate = isInView ? { opacity: 1, x: 0, y: 0 } : initial;

  return (
    <MotionDiv
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </MotionDiv>
  );
};

export default ScrollReveal;
