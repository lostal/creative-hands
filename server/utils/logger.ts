/**
 * Logger estructurado para el servidor
 * Envuelve console.log/error para control por entorno
 */

const isDev = process.env.NODE_ENV !== "production";

/** Tipo para argumentos de log - incluye unknown para errores capturados */
type LogArg = string | number | boolean | object | Error | null | undefined | unknown;

const logger = {
  /**
   * Log de información general (solo en desarrollo)
   */
  info: (...args: LogArg[]) => {
    if (isDev) console.log(...args);
  },

  /**
   * Log de errores (siempre activo)
   */
  error: (...args: LogArg[]) => {
    console.error(...args);
  },

  /**
   * Log de advertencias (siempre activo)
   */
  warn: (...args: LogArg[]) => {
    console.warn(...args);
  },

  /**
   * Log específico para Socket.IO (solo en desarrollo)
   */
  socket: (...args: LogArg[]) => {
    if (isDev) console.log("🔌", ...args);
  },

  /**
   * Log de startup del servidor (siempre activo)
   */
  startup: (...args: LogArg[]) => {
    console.log(...args);
  },

  /**
   * Log de base de datos (solo en desarrollo)
   */
  db: (...args: LogArg[]) => {
    if (isDev) console.log("🗄️", ...args);
  },
};

export default logger;