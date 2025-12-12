/**
 * Error handling utilities for server
 */

/**
 * Extracts a message from an unknown error
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Error desconocido";
};

/**
 * Obtiene detalles del error solo en desarrollo
 * En producción devuelve undefined para evitar fugas de información
 */
export const getErrorForResponse = (error: unknown): string | undefined => {
  if (process.env.NODE_ENV === "development") {
    return getErrorMessage(error);
  }
  return undefined;
};
