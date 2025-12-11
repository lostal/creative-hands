/**
 * GrainOverlay - Decorative film grain effect
 * 
 * Features:
 * - Subtle animated texture over the entire page
 * - Respects prefers-reduced-motion
 * - Different opacity in light/dark mode (via CSS variables)
 * - Fully accessible (aria-hidden, pointer-events: none)
 */

import { useEffect, useState } from 'react';

const GrainOverlay = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        // Check for reduced motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return (
        <div
            className={`grain-overlay ${!prefersReducedMotion ? 'grain-overlay--animated' : ''}`}
            aria-hidden="true"
        />
    );
};

export default GrainOverlay;
