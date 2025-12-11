/**
 * Controlador de reviews
 * Contiene la lógica de negocio para operaciones CRUD de valoraciones
 */
import { Response } from "express";
import { Types } from "mongoose";
import Product, { IReview } from "../models/Product";
import { enrichProductWithMetrics } from "../utils/reviewUtils";
import { AuthRequest } from "../middleware/auth";
import logger from "../utils/logger";

/** Review con _id tipado para subdocumentos mongoose */
interface ReviewSubdoc extends IReview {
  _id: Types.ObjectId;
}

/**
 * Helper para poblar producto con reviews
 */
const populateProduct = async (productId: string) => {
  return await Product.findById(productId)
    .populate("createdBy", "name email")
    .populate("categoryId", "name slug")
    .populate("reviews.user", "name email");
};

/**
 * Añadir review a un producto
 * @route POST /api/products/:id/reviews
 */
export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    const { title, comment, rating } = req.body;

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating debe ser un entero entre 1 y 5",
      });
    }

    // No permitir que administradores añadan reviews
    if (req.user && req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Administradores no pueden dejar valoraciones",
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Producto no encontrado" });
    }

    // Evitar duplicados del mismo usuario
    const existing = (product.reviews || []).find(
      (r) => r.user && r.user.toString() === req.user?.id.toString(),
    );
    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          "Ya has dejado una valoración en este producto. Edita o elimina tu valoración para publicar otra.",
      });
    }

    // Crear review
    const review: Omit<IReview, 'createdAt'> = {
      user: new Types.ObjectId(req.user?.id),
      title: String(title).trim(),
      comment: String(comment).trim(),
      rating: numericRating,
    };

    product.reviews = product.reviews || [];
    product.reviews.push(review as IReview);
    await product.save();

    const updated = await populateProduct(product._id.toString());

    if (!updated) {
      return res.status(404).json({ success: false, message: "Producto no encontrado tras actualizar" });
    }

    res.status(201).json({
      success: true,
      product: enrichProductWithMetrics(updated),
    });
  } catch (error) {
    logger.error("Error al añadir review:", error);
    res.status(500).json({ success: false, message: "Error al añadir review" });
  }
};

/**
 * Editar review propia
 * @route PUT /api/products/:id/reviews/:reviewId
 */
export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { title, comment, rating } = req.body;
    const { reviewId } = req.params;
    const numericRating =
      rating !== undefined ? parseInt(rating, 10) : undefined;

    if (!reviewId) {
      return res
        .status(400)
        .json({ success: false, message: "ID de review requerido" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Producto no encontrado" });
    }

    // Buscar review por ID
    const reviews = product.reviews as Types.DocumentArray<ReviewSubdoc>;
    const review = reviews.id(reviewId) ||
      reviews.find((r) => r._id && r._id.toString() === reviewId);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review no encontrada" });
    }

    if (review.user.toString() !== req.user?.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para editar esta review",
      });
    }

    if (title !== undefined) review.title = String(title).trim();
    if (comment !== undefined) review.comment = String(comment).trim();
    if (numericRating !== undefined) {
      if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating debe ser un entero entre 1 y 5",
        });
      }
      review.rating = numericRating;
    }

    await product.save();

    const updated = await populateProduct(product._id.toString());

    if (!updated) {
      return res.status(404).json({ success: false, message: "Producto no encontrado tras actualizar" });
    }

    res.json({
      success: true,
      product: enrichProductWithMetrics(updated),
    });
  } catch (error) {
    logger.error("Error al editar review:", error);
    res.status(500).json({ success: false, message: "Error al editar review" });
  }
};

/**
 * Eliminar review propia
 * @route DELETE /api/products/:id/reviews/:reviewId
 */
export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;

    if (!reviewId) {
      return res
        .status(400)
        .json({ success: false, message: "ID de review requerido" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Producto no encontrado" });
    }

    const reviews = product.reviews as Types.DocumentArray<ReviewSubdoc>;
    const review = reviews.id(reviewId) ||
      reviews.find((r) => r._id && r._id.toString() === reviewId);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review no encontrada" });
    }

    if (review.user.toString() !== req.user?.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para eliminar esta review",
      });
    }

    // Use pull or filter
    // Mongoose array pull is safer for subdocs
    reviews.pull(review._id);

    await product.save();

    const updated = await populateProduct(product._id.toString());

    if (!updated) {
      return res.status(404).json({ success: false, message: "Producto no encontrado tras actualizar" });
    }

    res.json({
      success: true,
      product: enrichProductWithMetrics(updated),
    });
  } catch (error) {
    logger.error("Error al eliminar review:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar review" });
  }
};
