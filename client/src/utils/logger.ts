/**
 * Logger estructurado para el cliente
 * Controla la salida de logs según el entorno
 * En producción solo muestra errores críticos
 */

const isDev = import.meta.env.DEV;

/** Tipo para argumentos de log */
type LogArg = string | number | boolean | object | Error | null | undefined;

const logger = {
  /**
   * Log de información general (solo en desarrollo)
   */
  info: (...args: LogArg[]) => {
    if (isDev) console.log(...args);
  },

  /**
   * Log de errores (siempre activo - necesario para debugging en producción)
   */
  error: (...args: LogArg[]) => {
    console.error(...args);
  },

  /**
   * Log de advertencias (solo en desarrollo)
   */
  warn: (...args: LogArg[]) => {
    if (isDev) console.warn(...args);
  },

  /**
   * Log de debug (solo en desarrollo)
   */
  debug: (...args: LogArg[]) => {
    if (isDev) console.debug(...args);
  },

  /**
   * Log de socket/conexión (solo en desarrollo)
   */
  socket: (...args: LogArg[]) => {
    if (isDev) console.log("🔌", ...args);
  },

  /**
   * Log de PWA/Service Worker (solo en desarrollo)
   */
  pwa: (...args: LogArg[]) => {
    if (isDev) console.log("📱", ...args);
  },
};

export default logger;
