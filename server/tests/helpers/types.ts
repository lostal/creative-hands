/**
 * Helpers de tipos para tests
 * Evita el uso de 'as any' en los archivos de test
 */
import type jwt from "jsonwebtoken";

/**
 * Tipo para el parámetro expiresIn de JWT
 * Compatible con string como "1d", "7d", números, etc.
 */
export type JwtExpiresIn = jwt.SignOptions["expiresIn"];

/**
 * Obtiene el expiresIn de las variables de entorno con tipo correcto
 */
export const getJwtExpire = (): JwtExpiresIn => {
  return (process.env.JWT_EXPIRE || "1d") as JwtExpiresIn;
};
