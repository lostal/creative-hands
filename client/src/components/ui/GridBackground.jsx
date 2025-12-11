import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * GridBackground Component - v2 Design System
 * Dot grid pattern with parallax effect
 */

const GridBackground = ({
    dotSize = 1,
    dotSpacing = 24,
    parallaxStrength = 0.1,
    className = '',
    children,
    overlay = true,
    overlayGradient = 'radial',
}) => {
    const containerRef = useRef(null);
    const [windowHeight, setWindowHeight] = useState(0);

    useEffect(() => {
        setWindowHeight(window.innerHeight);
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { scrollY } = useScroll();

    const y = useTransform(
        scrollY,
        [0, windowHeight],
        [0, windowHeight * parallaxStrength]
    );

    const overlayStyles = {
        radial: 'bg-gradient-radial from-transparent via-transparent to-background',
        linear: 'bg-gradient-to-b from-transparent via-transparent to-background',
        none: '',
    };

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden ${className}`}
        >
            {/* Dot Grid Pattern */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ y }}
            >
                <div
                    className="absolute inset-[-50%] w-[200%] h-[200%]"
                    style={{
                        backgroundImage: `radial-gradient(circle, var(--border-default) ${dotSize}px, transparent ${dotSize}px)`,
                        backgroundSize: `${dotSpacing}px ${dotSpacing}px`,
                    }}
                />
            </motion.div>

            {/* Optional Overlay */}
            {overlay && (
                <div
                    className={`absolute inset-0 pointer-events-none ${overlayStyles[overlayGradient]}`}
                    style={{
                        background: overlayGradient === 'radial'
                            ? 'radial-gradient(ellipse 80% 50% at 50% 50%, transparent 0%, var(--bg-primary) 100%)'
                            : undefined,
                    }}
                />
            )}

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default GridBackground;
