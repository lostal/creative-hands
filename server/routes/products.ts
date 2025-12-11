/**
 * Rutas de productos
 * Mapeo de rutas a controladores - lógica de negocio en controllers/
 */
import express from "express";
import multer from "multer";
import { protect, adminOnly, validateObjectId } from "../middleware/auth";
import { validate, validateQuery, reviewSchema, productSchema, productUpdateSchema, productQuerySchema } from "../validators/schemas";
import { storage } from "../config/cloudinary";
import { UPLOAD_LIMITS } from "../config/constants";

// Controladores
import * as productController from "../controllers/productController";
import * as reviewController from "../controllers/reviewController";

const router = express.Router();

// Configuración de Multer para subida de imágenes
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Tipo de archivo no permitido. Solo JPEG/PNG/WebP/GIF."));
};

const upload = multer({
  storage,
  limits: { fileSize: UPLOAD_LIMITS.MAX_FILE_SIZE_BYTES },
  fileFilter,
});

// ==================== RUTAS PÚBLICAS ====================

// GET /api/products - Obtener todos los productos
router.get("/", validateQuery(productQuerySchema), productController.getProducts);

// GET /api/products/categories/list - Lista de categorías (legacy)
router.get("/categories/list", productController.getCategoriesList);

// GET /api/products/category/:slug - Productos por categoría
router.get("/category/:slug", productController.getProductsByCategory);

// GET /api/products/:id - Obtener producto por ID
router.get("/:id", validateObjectId(), productController.getProductById);

// ==================== RUTAS DE REVIEWS (Autenticación requerida) ====================

// POST /api/products/:id/reviews - Añadir review
router.post(
  "/:id/reviews",
  validateObjectId(),
  protect,
  validate(reviewSchema),
  reviewController.addReview,
);

// PUT /api/products/:id/reviews/:reviewId - Editar review
router.put("/:id/reviews/:reviewId", validateObjectId(), validateObjectId("reviewId"), protect, reviewController.updateReview);

// DELETE /api/products/:id/reviews/:reviewId - Eliminar review
router.delete("/:id/reviews/:reviewId", validateObjectId(), validateObjectId("reviewId"), protect, reviewController.deleteReview);

// ==================== RUTAS DE ADMIN (Solo administradores) ====================

// POST /api/products - Crear producto
router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", UPLOAD_LIMITS.MAX_IMAGES_PER_PRODUCT),
  validate(productSchema),
  productController.createProduct,
);

// PUT /api/products/:id - Actualizar producto
router.put(
  "/:id",
  validateObjectId(),
  protect,
  adminOnly,
  upload.array("images", UPLOAD_LIMITS.MAX_IMAGES_PER_PRODUCT),
  validate(productUpdateSchema),
  productController.updateProduct,
);

// DELETE /api/products/:id - Eliminar producto
router.delete("/:id", validateObjectId(), protect, adminOnly, productController.deleteProduct);

// DELETE /api/products/:id/images - Eliminar imagen de producto
router.delete(
  "/:id/images",
  validateObjectId(),
  protect,
  adminOnly,
  productController.deleteProductImage,
);

export default router;
