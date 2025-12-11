/**
 * Utilidades para cálculo de métricas de reviews en productos
 */

interface Review {
  rating?: number;
  [key: string]: any;
}

interface ProductWithReviews {
  reviews?: Review[];
  toObject?: () => any;
  [key: string]: any;
}

/**
 * Calcula el número de reviews y el promedio de rating
 * @param reviews - Array de reviews del producto
 * @returns {{ reviewsCount: number, avgRating: number }}
 */
export const calculateReviewMetrics = (
  reviews: Review[] = [],
): { reviewsCount: number; avgRating: number } => {
  const count = reviews.length;
  const avg = count
    ? Math.round(
      (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / count) * 10,
    ) / 10
    : 0;
  return { reviewsCount: count, avgRating: avg };
};

/**
 * Enriquece un producto con métricas de reviews
 * @param product - Producto de Mongoose (puede ser documento o objeto plano)
 * @returns {Object} - Producto con reviewsCount y avgRating añadidos
 */
export const enrichProductWithMetrics = (product: ProductWithReviews): any => {
  const obj =
    typeof product.toObject === "function" ? product.toObject() : product;
  const metrics = calculateReviewMetrics(obj.reviews);
  return { ...obj, ...metrics };
};
