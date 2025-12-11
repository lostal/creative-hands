/**
 * Logger estructurado para el servidor
 * Envuelve console.log/error para control por entorno
 */

const isDev = process.env.NODE_ENV !== "production";

const logger = {
    /**
     * Log de información general (solo en desarrollo)
     */
    info: (...args) => {
        if (isDev) console.log(...args);
    },

    /**
     * Log de errores (siempre activo)
     */
    error: (...args) => {
        console.error(...args);
    },

    /**
     * Log de advertencias (siempre activo)
     */
    warn: (...args) => {
        console.warn(...args);
    },

    /**
     * Log específico para Socket.IO (solo en desarrollo)
     */
    socket: (...args) => {
        if (isDev) console.log("🔌", ...args);
    },

    /**
     * Log de startup del servidor (siempre activo)
     */
    startup: (...args) => {
        console.log(...args);
    },

    /**
     * Log de base de datos (solo en desarrollo)
     */
    db: (...args) => {
        if (isDev) console.log("🗄️", ...args);
    },
};

module.exports = logger;
