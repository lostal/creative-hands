/**
 * Custom hook para gestión de categorías
 */
import { useState, useEffect, useCallback } from "react";
import * as categoryService from "../services/categoryService";

/**
 * Hook para obtener y gestionar categorías
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.autoFetch - Si debe cargar automáticamente (default: true)
 */
export const useCategories = ({ autoFetch = true } = {}) => {
    const [categories, setCategories] = useState([]);
    // Start loading as true when autoFetch to prevent flash of "no categories" 
    const [loading, setLoading] = useState(autoFetch);
    const [error, setError] = useState(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await categoryService.getCategories();
            setCategories(data.categories || []);
        } catch (err) {
            setError(err.response?.data?.message || "Error al cargar categorías");
            console.error("Error fetching categories:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (autoFetch) {
            fetchCategories();
        }
    }, [fetchCategories, autoFetch]);

    return {
        categories,
        loading,
        error,
        refetch: fetchCategories,
        setCategories,
    };
};

export default useCategories;
