/**
 * SmoothScroll - Lenis smooth scroll wrapper
 * 
 * Features:
 * - Only active on devices with pointer: fine (mouse)
 * - Disabled on touch devices to respect native scroll
 * - Respects prefers-reduced-motion
 * - Provides lenis instance via context for scroll-to functionality
 */

import { useEffect, useRef, createContext, useContext } from 'react';
import Lenis from 'lenis';

const LenisContext = createContext(null);

export const useLenis = () => useContext(LenisContext);

const SmoothScroll = ({ children }) => {
    const lenisRef = useRef(null);

    useEffect(() => {
        // Check if device has a fine pointer (mouse)
        const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Only enable Lenis on desktop with mouse and no reduced motion preference
        if (!hasFinePointer || prefersReducedMotion) {
            return;
        }

        // Initialize Lenis
        lenisRef.current = new Lenis({
            lerp: 0.1,
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        // Add lenis class to html for CSS adjustments
        document.documentElement.classList.add('lenis');

        // Animation frame loop
        function raf(time) {
            lenisRef.current?.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Cleanup
        return () => {
            lenisRef.current?.destroy();
            lenisRef.current = null;
            document.documentElement.classList.remove('lenis');
        };
    }, []);

    return (
        <LenisContext.Provider value={lenisRef.current}>
            {children}
        </LenisContext.Provider>
    );
};

export default SmoothScroll;
