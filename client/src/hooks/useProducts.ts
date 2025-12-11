/**
 * Custom hook para gestión de productos
 * Abstrae la lógica de fetching y estado de productos
 */
import { useState, useEffect, useCallback } from "react";
import * as productService from "../services/productService";
import { Product } from "../types";
import { getApiErrorMessage } from "../utils/errors";

interface UseProductsOptions {
  categorySlug?: string | null;
  autoFetch?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

/**
 * Hook para obtener y gestionar la lista de productos
 * @param {Object} options - Opciones de configuración
 * @param {string} options.categorySlug - Filtrar por categoría
 * @param {boolean} options.autoFetch - Si debe cargar automáticamente (default: true)
 */
export const useProducts = ({ categorySlug = null, autoFetch = true }: UseProductsOptions = {}): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = categorySlug
        ? await productService.getProductsByCategory(categorySlug)
        : await productService.getProducts();
      setProducts(data.products || []);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
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

interface UseProductReturn {
  product: Product | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setProduct: React.Dispatch<React.SetStateAction<Product | null>>;
}

/**
 * Hook para obtener un producto específico
 * @param {string} productId - ID del producto
 */
export const useProduct = (productId: string): UseProductReturn => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getProductById(productId);
      setProduct(data.product);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
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
