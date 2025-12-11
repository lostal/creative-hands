/**
 * Servicio de productos - Capa de abstracción para llamadas API
 * Facilita testing, reutilización y mantenimiento
 */
import api from "../utils/axios";

/**
 * Obtener todos los productos
 * @param {Object} params - Parámetros de búsqueda y ordenación
 * @returns {Promise<{success: boolean, products: Array, count: number}>}
 */
export const getProducts = async (params = {}) => {
    const { data } = await api.get("/products", { params });
    return data;
};

/**
 * Obtener producto por ID
 * @param {string} id - ID del producto
 * @returns {Promise<{success: boolean, product: Object}>}
 */
export const getProductById = async (id) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
};

/**
 * Obtener productos por categoría (slug)
 * @param {string} slug - Slug de la categoría
 * @returns {Promise<{success: boolean, products: Array, count: number}>}
 */
export const getProductsByCategory = async (slug) => {
    const { data } = await api.get(`/products/category/${slug}`);
    return data;
};

/**
 * Crear producto (requiere admin)
 * @param {FormData} formData - Datos del producto incluyendo imágenes
 * @returns {Promise<{success: boolean, product: Object}>}
 */
export const createProduct = async (formData) => {
    const { data } = await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};

/**
 * Actualizar producto (requiere admin)
 * @param {string} id - ID del producto
 * @param {FormData} formData - Datos a actualizar
 * @returns {Promise<{success: boolean, product: Object}>}
 */
export const updateProduct = async (id, formData) => {
    const { data } = await api.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};

/**
 * Eliminar producto (requiere admin)
 * @param {string} id - ID del producto
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteProduct = async (id) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
};

/**
 * Añadir review a un producto
 * @param {string} productId - ID del producto
 * @param {Object} review - {title, comment, rating}
 * @returns {Promise<{success: boolean, product: Object}>}
 */
export const addReview = async (productId, review) => {
    const { data } = await api.post(`/products/${productId}/reviews`, review);
    return data;
};

/**
 * Editar review propia
 * @param {string} productId - ID del producto
 * @param {string} reviewId - ID de la review
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<{success: boolean, product: Object}>}
 */
export const updateReview = async (productId, reviewId, updates) => {
    const { data } = await api.put(`/products/${productId}/reviews/${reviewId}`, updates);
    return data;
};

/**
 * Eliminar review propia
 * @param {string} productId - ID del producto
 * @param {string} reviewId - ID de la review
 * @returns {Promise<{success: boolean, product: Object}>}
 */
export const deleteReview = async (productId, reviewId) => {
    const { data } = await api.delete(`/products/${productId}/reviews/${reviewId}`);
    return data;
};
