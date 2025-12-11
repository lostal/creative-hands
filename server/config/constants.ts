/**
 * Constantes de configuración del servidor
 * Centraliza valores que antes estaban dispersos como "magic numbers"
 */

/**
 * Límites de subida de archivos
 */
export const UPLOAD_LIMITS = {
  /** Número máximo de imágenes por producto */
  MAX_IMAGES_PER_PRODUCT: 5,
  /** Tamaño máximo de archivo en bytes (2 MB) */
  MAX_FILE_SIZE_BYTES: 2 * 1024 * 1024,
  /** Tamaño máximo en formato legible */
  MAX_FILE_SIZE_MB: 2,
} as const;

/**
 * Configuración de rate limiting
 */
export const RATE_LIMITS = {
  /** Ventana de tiempo para autenticación (15 minutos en ms) */
  AUTH_WINDOW_MS: 15 * 60 * 1000,
  /** Máximo de intentos de autenticación por ventana */
  AUTH_MAX_ATTEMPTS: 5,
} as const;

/**
 * Configuración de paginación
 */
export const PAGINATION = {
  /** Productos por página por defecto */
  DEFAULT_PAGE_SIZE: 12,
  /** Máximo de productos por página */
  MAX_PAGE_SIZE: 50,
} as const;

/**
 * Configuración de JWT
 */
export const JWT_CONFIG = {
  /** Tiempo de expiración por defecto */
  DEFAULT_EXPIRE: "7d",
} as const;
