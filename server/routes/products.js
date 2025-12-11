/**
 * Rutas de productos
 * Mapeo de rutas a controladores - lógica de negocio en controllers/
 */
const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const { validate, reviewSchema } = require("../validators/schemas");
const multer = require("multer");
const { storage } = require("../config/cloudinary");

// Controladores
const productController = require("../controllers/productController");
const reviewController = require("../controllers/reviewController");

// Configuración de Multer para subida de imágenes
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Tipo de archivo no permitido. Solo JPEG/PNG/WebP/GIF."));
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter,
});

// ==================== RUTAS PÚBLICAS ====================

// GET /api/products - Obtener todos los productos
router.get("/", productController.getProducts);

// GET /api/products/categories/list - Lista de categorías (legacy)
router.get("/categories/list", productController.getCategoriesList);

// GET /api/products/category/:slug - Productos por categoría
router.get("/category/:slug", productController.getProductsByCategory);

// GET /api/products/:id - Obtener producto por ID
router.get("/:id", productController.getProductById);

// ==================== RUTAS DE REVIEWS (Autenticación requerida) ====================

// POST /api/products/:id/reviews - Añadir review
router.post(
  "/:id/reviews",
  protect,
  validate(reviewSchema),
  reviewController.addReview,
);

// PUT /api/products/:id/reviews/:reviewId - Editar review
router.put("/:id/reviews/:reviewId", protect, reviewController.updateReview);

// DELETE /api/products/:id/reviews/:reviewId - Eliminar review
router.delete("/:id/reviews/:reviewId", protect, reviewController.deleteReview);

// ==================== RUTAS DE ADMIN (Solo administradores) ====================

// POST /api/products - Crear producto
router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 5),
  productController.createProduct,
);

// PUT /api/products/:id - Actualizar producto
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.array("images", 5),
  productController.updateProduct,
);

// DELETE /api/products/:id - Eliminar producto
router.delete("/:id", protect, adminOnly, productController.deleteProduct);

// DELETE /api/products/:id/images - Eliminar imagen de producto
router.delete(
  "/:id/images",
  protect,
  adminOnly,
  productController.deleteProductImage,
);

module.exports = router;
