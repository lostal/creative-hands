import { useEffect, useState } from "react";

/**
 * Overlay de grano de película (film grain) usando SVG feTurbulence.
 * Se oculta automáticamente en dispositivos táctiles.
 * La animación se desactiva con prefers-reduced-motion (ver CSS).
 */
function NoiseOverlay() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Detectar dispositivo táctil
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouch(isTouchDevice);
  }, []);

  // No renderizar en dispositivos táctiles
  if (isTouch) {
    return null;
  }

  return (
    <div className="noise-overlay" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.5"
            numOctaves="4"
            seed="0"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-filter)" />
      </svg>
    </div>
  );
}

export default NoiseOverlay;
