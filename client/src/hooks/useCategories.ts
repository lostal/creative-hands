/**
 * Custom hook para gestión de categorías
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import * as categoryService from "../services/categoryService";
import { Category } from "../types";
import { getApiErrorMessage } from "../utils/errors";
import logger from "../utils/logger";

// Fallback de categorías por defecto (usado si la API falla)
const DEFAULT_CATEGORIES: Partial<Category>[] = [
  { name: "Joyería artesanal", slug: "joyeria-artesanal" },
  { name: "Velas y aromáticos", slug: "velas-y-aromaticos" },
  { name: "Textiles y ropa", slug: "textiles-y-ropa" },
  { name: "Cerámica y arcilla", slug: "ceramica-y-arcilla" },
  { name: "Arte hecho a mano", slug: "arte-hecho-a-mano" },
];

interface UseCategoriesOptions {
  autoFetch?: boolean;
}

interface UseCategoriesReturn {
  categories: Category[];
  categoriesWithAll: { name: string; slug: string }[];
  nameToSlug: Record<string, string>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

/**
 * Hook para obtener y gestionar categorías
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.autoFetch - Si debe cargar automáticamente (default: true)
 */
export const useCategories = ({
  autoFetch = true,
}: UseCategoriesOptions = {}): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getCategories();
      setCategories(data.categories || []);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
      logger.error("Error fetching categories:", err);
      // Usar categorías por defecto como fallback
      setCategories(DEFAULT_CATEGORIES as Category[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
    }
  }, [fetchCategories, autoFetch]);

  // Mapa nombre -> slug para convertir query params legacy
  const nameToSlug = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[c.name] = c.slug;
    });
    return map;
  }, [categories]);

  // Lista con "Todas" prepended para filtros UI
  const categoriesWithAll = useMemo(
    () => [
      { name: "Todas", slug: "" },
      ...categories.map((c) => ({ name: c.name, slug: c.slug })),
    ],
    [categories],
  );

  return {
    categories,
    categoriesWithAll,
    nameToSlug,
    loading,
    error,
    refetch: fetchCategories,
    setCategories,
  };
};

export default useCategories;
