import { useEffect, useRef } from "react";

/**
 * Hook para bloquear el scroll del body cuando un modal de pantalla completa está abierto.
 * 
 * ESTRATEGIA:
 * - Para modales de pantalla completa: bloquea el scroll del fondo completamente
 * - Usa position: fixed para prevenir scroll nativo (funciona en PWA standalone)
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

        // Guardar estilos originales del body
        const originalBodyStyles = {
            overflow: document.body.style.overflow,
            paddingRight: document.body.style.paddingRight,
            position: document.body.style.position,
            top: document.body.style.top,
            left: document.body.style.left,
            right: document.body.style.right,
            width: document.body.style.width,
        };

        // Guardar estilos originales del html (para touch-action en móvil/PWA)
        const originalHtmlStyles = {
            overflow: document.documentElement.style.overflow,
            touchAction: document.documentElement.style.touchAction,
        };

        // Bloquear scroll del body usando position: fixed
        // Esto es más efectivo que solo overflow: hidden, especialmente en iOS PWA
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY.current}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        // Bloquear en html también (necesario para PWA standalone en iOS)
        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.touchAction = "none";

        // Pausar Lenis si existe
        const lenis = window.lenis;
        if (lenis) {
            lenis.stop();
        }

        // Cleanup: restaurar el estado original
        return () => {
            // Restaurar estilos del body
            document.body.style.overflow = originalBodyStyles.overflow;
            document.body.style.paddingRight = originalBodyStyles.paddingRight;
            document.body.style.position = originalBodyStyles.position;
            document.body.style.top = originalBodyStyles.top;
            document.body.style.left = originalBodyStyles.left;
            document.body.style.right = originalBodyStyles.right;
            document.body.style.width = originalBodyStyles.width;

            // Restaurar estilos del html
            document.documentElement.style.overflow = originalHtmlStyles.overflow;
            document.documentElement.style.touchAction = originalHtmlStyles.touchAction;

            // Restaurar posición del scroll
            window.scrollTo(0, scrollY.current);

            // Reanudar Lenis si existe
            if (lenis) {
                lenis.start();
            }
        };
    }, [isLocked]);
}

export default useScrollLock;
