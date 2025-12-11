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
