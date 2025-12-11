import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * Hook para inicializar Lenis smooth scroll.
 * Se desactiva automáticamente en:
 * - Dispositivos táctiles
 * - Usuarios con prefers-reduced-motion
 * 
 * Expone la instancia en window.lenis para uso externo.
 */
export function useLenis() {
    const lenisRef = useRef(null);

    useEffect(() => {
        // Detectar dispositivos táctiles
        const isTouchDevice =
            'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Detectar preferencia de movimiento reducido
        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;

        // No inicializar Lenis en estos casos
        if (isTouchDevice || prefersReducedMotion) {
            return;
        }

        // Crear instancia de Lenis
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => 1.001 - Math.pow(2, -10 * t), // Exponencial
            orientation: 'vertical',
            smoothWheel: true,
        });

        lenisRef.current = lenis;

        // Exponer globalmente para otros scripts
        window.lenis = lenis;

        // RAF loop
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Cleanup
        return () => {
            lenis.destroy();
            lenisRef.current = null;
            delete window.lenis;
        };
    }, []);

    return lenisRef;
}

export default useLenis;
