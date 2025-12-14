/**
 * Servicio de productos - Capa de abstracción para llamadas API
 */
import api from "../utils/axios";
import { Product } from "../types";

interface ProductResponse {
  products: Product[];
  page: number;
  pages: number;
  count: number;
  total: number;
}

/**
 * Obtener todos los productos
 */
export const getProducts = async (): Promise<
  { success: boolean } & ProductResponse
> => {
  const { data } = await api.get("/products");
  return data;
};

/**
 * Obtener producto por ID
 */
export const getProductById = async (
  id: string,
): Promise<{ success: boolean; product: Product }> => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

/**
 * Obtener productos por categoría (slug)
 */
export const getProductsByCategory = async (
  slug: string,
): Promise<{ success: boolean } & ProductResponse> => {
  const { data } = await api.get(`/products/category/${slug}`);
  return data;
};
