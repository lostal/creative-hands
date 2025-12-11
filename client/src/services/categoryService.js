/**
 * Servicio de categorías - Capa de abstracción para llamadas API
 */
import api from "../utils/axios";

/**
 * Obtener todas las categorías
 * @returns {Promise<{success: boolean, categories: Array, count: number}>}
 */
export const getCategories = async () => {
    const { data } = await api.get("/categories");
    return data;
};

/**
 * Crear categoría (requiere admin)
 * @param {Object} category - {name, slug?, description?}
 * @returns {Promise<{success: boolean, category: Object}>}
 */
export const createCategory = async (category) => {
    const { data } = await api.post("/categories", category);
    return data;
};

/**
 * Actualizar categoría (requiere admin)
 * @param {string} id - ID de la categoría
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<{success: boolean, category: Object}>}
 */
export const updateCategory = async (id, updates) => {
    const { data } = await api.put(`/categories/${id}`, updates);
    return data;
};

/**
 * Eliminar categoría (requiere admin)
 * @param {string} id - ID de la categoría
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteCategory = async (id) => {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
};
