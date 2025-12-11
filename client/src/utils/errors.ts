/**
 * Error handling utilities
 * Provides type-safe error message extraction
 */

/**
 * Extracts a human-readable message from an unknown error type
 * Use this instead of `(error as any).message`
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Ha ocurrido un error inesperado";
};

/**
 * Type guard to check if error has a response property (Axios-like errors)
 */
export const isAxiosError = (
  error: unknown,
): error is { response: { data: { message?: string } } } => {
  if (error === null || typeof error !== "object") {
    return false;
  }
  if (!("response" in error)) {
    return false;
  }
  const errorWithResponse = error as { response: unknown };
  return (
    errorWithResponse.response !== null &&
    typeof errorWithResponse.response === "object"
  );
};

/**
 * Extracts message from API error responses
 */
export const getApiErrorMessage = (error: unknown): string => {
  if (isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  return getErrorMessage(error);
};
