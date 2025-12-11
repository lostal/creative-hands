/**
 * Utilidades para cálculo de métricas de reviews en productos
 */

/**
 * Calcula el número de reviews y el promedio de rating
 * @param {Array} reviews - Array de reviews del producto
 * @returns {{ reviewsCount: number, avgRating: number }}
 */
const calculateReviewMetrics = (reviews = []) => {
    const count = reviews.length;
    const avg = count
        ? Math.round(
            (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / count) * 10
        ) / 10
        : 0;
    return { reviewsCount: count, avgRating: avg };
};

/**
 * Enriquece un producto con métricas de reviews
 * @param {Object} product - Producto de Mongoose (puede ser documento o objeto plano)
 * @returns {Object} - Producto con reviewsCount y avgRating añadidos
 */
const enrichProductWithMetrics = (product) => {
    const obj = typeof product.toObject === "function" ? product.toObject() : product;
    const metrics = calculateReviewMetrics(obj.reviews);
    return { ...obj, ...metrics };
};

module.exports = {
    calculateReviewMetrics,
    enrichProductWithMetrics,
};
