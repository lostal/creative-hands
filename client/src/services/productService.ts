/**
 * Servicio de productos - Capa de abstracción para llamadas API
 * Facilita testing, reutilización y mantenimiento
 */
import api from "../utils/axios";
import { Product } from "../types";

interface GetProductsParams {
  keyword?: string;
  pageNumber?: string | number;
  category?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface ProductResponse {
  products: Product[];
  page: number;
  pages: number;
  count: number;
  total: number;
}

/**
 * Obtener todos los productos
 * @param {Object} params - Parámetros de búsqueda y ordenación
 */
export const getProducts = async (
  params: GetProductsParams = {},
): Promise<{ success: boolean } & ProductResponse> => {
  const { data } = await api.get("/products", { params });
  return data;
};

/**
 * Obtener producto por ID
 * @param {string} id - ID del producto
 */
export const getProductById = async (
  id: string,
): Promise<{ success: boolean; product: Product }> => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

/**
 * Obtener productos por categoría (slug)
 * @param {string} slug - Slug de la categoría
 */
export const getProductsByCategory = async (
  slug: string,
): Promise<{ success: boolean } & ProductResponse> => {
  const { data } = await api.get(`/products/category/${slug}`);
  return data;
};

/**
 * Crear producto (requiere admin)
 * @param {FormData} formData - Datos del producto incluyendo imágenes
 */
export const createProduct = async (
  formData: FormData,
): Promise<{ success: boolean; product: Product }> => {
  const { data } = await api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

/**
 * Actualizar producto (requiere admin)
 * @param {string} id - ID del producto
 * @param {FormData} formData - Datos a actualizar
 */
export const updateProduct = async (
  id: string,
  formData: FormData,
): Promise<{ success: boolean; product: Product }> => {
  const { data } = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

/**
 * Eliminar producto (requiere admin)
 * @param {string} id - ID del producto
 */
export const deleteProduct = async (
  id: string,
): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

/**
 * Añadir review a un producto
 * @param {string} productId - ID del producto
 * @param {Object} review - {title, comment, rating}
 */
export const addReview = async (
  productId: string,
  review: { rating: number; comment: string; title?: string },
): Promise<{ success: boolean; product: Product }> => {
  const { data } = await api.post(`/products/${productId}/reviews`, review);
  return data;
};

/**
 * Editar review propia
 * @param {string} productId - ID del producto
 * @param {string} reviewId - ID de la review
 * @param {Object} updates - Campos a actualizar
 */
export const updateReview = async (
  productId: string,
  reviewId: string,
  updates: Partial<{ rating: number; comment: string; title: string }>,
): Promise<{ success: boolean; product: Product }> => {
  const { data } = await api.put(
    `/products/${productId}/reviews/${reviewId}`,
    updates,
  );
  return data;
};

/**
 * Eliminar review propia
 * @param {string} productId - ID del producto
 * @param {string} reviewId - ID de la review
 */
export const deleteReview = async (
  productId: string,
  reviewId: string,
): Promise<{ success: boolean; product: Product }> => {
  const { data } = await api.delete(
    `/products/${productId}/reviews/${reviewId}`,
  );
  return data;
};
