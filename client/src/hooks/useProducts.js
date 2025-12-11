/**
 * Custom hook para gestión de productos
 * Abstrae la lógica de fetching y estado de productos
 */
import { useState, useEffect, useCallback } from "react";
import * as productService from "../services/productService";

/**
 * Hook para obtener y gestionar la lista de productos
 * @param {Object} options - Opciones de configuración
 * @param {string} options.categorySlug - Filtrar por categoría
 * @param {boolean} options.autoFetch - Si debe cargar automáticamente (default: true)
 */
export const useProducts = ({ categorySlug = null, autoFetch = true } = {}) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = categorySlug
                ? await productService.getProductsByCategory(categorySlug)
                : await productService.getProducts();
            setProducts(data.products || []);
        } catch (err) {
            setError(err.response?.data?.message || "Error al cargar productos");
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    }, [categorySlug]);

    useEffect(() => {
        if (autoFetch) {
            fetchProducts();
        }
    }, [fetchProducts, autoFetch]);

    return {
        products,
        loading,
        error,
        refetch: fetchProducts,
        setProducts,
    };
};

/**
 * Hook para obtener un producto específico
 * @param {string} productId - ID del producto
 */
export const useProduct = (productId) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProduct = useCallback(async () => {
        if (!productId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await productService.getProductById(productId);
            setProduct(data.product);
        } catch (err) {
            setError(err.response?.data?.message || "Error al cargar producto");
            console.error("Error fetching product:", err);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    return {
        product,
        loading,
        error,
        refetch: fetchProduct,
        setProduct,
    };
};

export default useProducts;
