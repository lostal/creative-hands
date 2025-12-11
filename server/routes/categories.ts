/**
 * Rutas de categorías
 * Mapeo de rutas a controladores - lógica de negocio en controllers/
 */
import express from "express";
import { protect, adminOnly } from "../middleware/auth";

// Controlador
import * as categoryController from "../controllers/categoryController";

const router = express.Router();

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

export default router;
