import { useEffect, useRef } from "react";

/**
 * Hook para bloquear el scroll del body cuando un modal de pantalla completa está abierto.
 * 
 * ESTRATEGIA:
 * - Para modales de pantalla completa: bloquea el scroll del fondo completamente
 * - Los modales deben usar `data-lenis-prevent` en sus contenedores scrollables
 *   para permitir scroll nativo dentro de ellos
 * 
 * IMPORTANTE: No usar este hook para elementos flotantes como el ChatWidget
 * donde tiene sentido que el fondo scrollee cuando el mouse no está encima.
 *
 * @param isLocked - Booleano que indica si el scroll debe estar bloqueado
 */
export function useScrollLock(isLocked: boolean): void {
    const scrollY = useRef(0);

    useEffect(() => {
        if (!isLocked) return;

        // Guardar scroll position actual
        scrollY.current = window.scrollY;

        // Calcular el ancho del scrollbar para evitar saltos de layout
        const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;

        // Guardar estilos originales
        const originalStyles = {
            overflow: document.body.style.overflow,
            paddingRight: document.body.style.paddingRight,
        };

        // Bloquear scroll del body
        document.body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        // Pausar Lenis si existe
        const lenis = window.lenis;
        if (lenis) {
            lenis.stop();
        }

        // Cleanup: restaurar el estado original
        return () => {
            document.body.style.overflow = originalStyles.overflow;
            document.body.style.paddingRight = originalStyles.paddingRight;

            // Reanudar Lenis
            if (lenis) {
                lenis.start();
            }
        };
    }, [isLocked]);
}

export default useScrollLock;
