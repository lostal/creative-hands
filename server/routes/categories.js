/**
 * Rutas de categorías
 * Mapeo de rutas a controladores - lógica de negocio en controllers/
 */
const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");

// Controlador
const categoryController = require("../controllers/categoryController");

// ==================== RUTAS PÚBLICAS ====================

// GET /api/categories - Obtener todas las categorías
router.get("/", categoryController.getCategories);

// ==================== RUTAS DE ADMIN ====================

// POST /api/categories - Crear categoría
router.post("/", protect, adminOnly, categoryController.createCategory);

// PUT /api/categories/:id - Actualizar categoría
router.put("/:id", protect, adminOnly, categoryController.updateCategory);

// DELETE /api/categories/:id - Eliminar categoría
router.delete("/:id", protect, adminOnly, categoryController.deleteCategory);

module.exports = router;
