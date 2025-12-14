/**
 * Servicio de categorías - Capa de abstracción para llamadas API
 */
import api from "../utils/axios";
import { Category } from "../types";

/**
 * Obtener todas las categorías
 */
export const getCategories = async (): Promise<{
  success: boolean;
  categories: Category[];
}> => {
  const { data } = await api.get("/categories");
  return data;
};

/**
 * Crear categoría (requiere admin)
 */
export const createCategory = async (
  categoryData: Partial<Category>,
): Promise<{ success: boolean; category: Category }> => {
  const { data } = await api.post("/categories", categoryData);
  return data;
};

/**
 * Actualizar categoría (requiere admin)
 */
export const updateCategory = async (
  id: string,
  categoryData: Partial<Category>,
): Promise<{ success: boolean; category: Category }> => {
  const { data } = await api.put(`/categories/${id}`, categoryData);
  return data;
};

/**
 * Eliminar categoría (requiere admin)
 */
export const deleteCategory = async (
  id: string,
): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};
