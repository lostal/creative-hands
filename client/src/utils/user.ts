/**
 * Utilidades para manejo de usuarios e IDs
 * Centraliza la lógica de comparación de IDs que se repite en varios componentes
 */
import { User } from "../types";

/**
 * Obtiene el ID de un usuario de forma segura
 * Maneja la diferencia entre `id` (del backend) y `_id` (de Mongoose)
 */
export const getUserId = (user: User | null): string | undefined => {
    if (!user) return undefined;
    // user.id viene del backend (authController), user._id es el tipo del frontend
    return user.id || user._id;
};

/**
 * Normaliza un ID a string
 * Maneja ObjectId de Mongoose que pueden tener método toString()
 */
export const normalizeId = (id: unknown): string => {
    if (id === null || id === undefined) return "";
    if (typeof id === "string") return id;
    if (typeof id === "object" && "toString" in id) {
        return (id as { toString: () => string }).toString();
    }
    return String(id);
};

/**
 * Compara dos IDs de forma segura, normalizándolos primero
 */
export const isSameUser = (
    id1: unknown,
    id2: unknown
): boolean => {
    const normalized1 = normalizeId(id1);
    const normalized2 = normalizeId(id2);
    return normalized1 !== "" && normalized2 !== "" && normalized1 === normalized2;
};
