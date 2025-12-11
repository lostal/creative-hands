/**
 * Servicio de categorías - Capa de abstracción para llamadas API
 */
import api from "../utils/axios";
import { Category } from "../types";

/**
 * Obtener todas las categorías
 */
export const getCategories = async (): Promise<{ success: boolean; categories: Category[]; count: number }> => {
  const { data } = await api.get("/categories");
  return data;
};

/**
 * Crear categoría (requiere admin)
 * @param {Object} category - {name, slug?, description?}
 */
export const createCategory = async (category: Partial<Category>): Promise<{ success: boolean; category: Category }> => {
  const { data } = await api.post("/categories", category);
  return data;
};

/**
 * Actualizar categoría (requiere admin)
 * @param {string} id - ID de la categoría
 * @param {Object} updates - Campos a actualizar
 */
export const updateCategory = async (id: string, updates: Partial<Category>): Promise<{ success: boolean; category: Category }> => {
  const { data } = await api.put(`/categories/${id}`, updates);
  return data;
};

/**
 * Eliminar categoría (requiere admin)
 * @param {string} id - ID de la categoría
 */
export const deleteCategory = async (id: string): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};
