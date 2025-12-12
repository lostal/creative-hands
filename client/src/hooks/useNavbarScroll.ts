/**
 * Custom hook for scroll-based navbar styling
 * Extracted from Navbar for better separation of concerns
 */
import { useState, useEffect } from "react";

/**
 * Hook that tracks scroll position and returns whether the page has been scrolled
 * Uses requestAnimationFrame for throttling to optimize performance
 * @param threshold - Scroll position in pixels to trigger "scrolled" state (default: 20)
 */
export const useNavbarScroll = (threshold: number = 20): boolean => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > threshold);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return scrolled;
};

export default useNavbarScroll;
