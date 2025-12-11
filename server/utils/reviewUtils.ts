/**
 * Utilidades para cálculo de métricas de reviews en productos
 */
import { IProduct, IReview } from "../models/Product";
import { Document } from "mongoose";

/**
 * Producto que puede ser un documento de Mongoose o un objeto plano
 */
type ProductDocument = IProduct | (Document & IProduct);

interface ProductPlain {
  reviews?: IReview[];
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
}

type ProductInput = ProductDocument | ProductPlain;

interface EnrichedProduct extends ProductPlain {
  reviewsCount: number;
  avgRating: number;
}

/**
 * Calcula el número de reviews y el promedio de rating
 * @param reviews - Array de reviews del producto
 * @returns {{ reviewsCount: number, avgRating: number }}
 */
export const calculateReviewMetrics = (
  reviews: IReview[] = [],
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
 * @returns Producto con reviewsCount y avgRating añadidos
 */
export const enrichProductWithMetrics = (product: ProductInput): EnrichedProduct => {
  const obj = "toObject" in product && typeof product.toObject === "function"
    ? product.toObject()
    : product;
  const metrics = calculateReviewMetrics(obj.reviews);
  return { ...obj, ...metrics };
};
