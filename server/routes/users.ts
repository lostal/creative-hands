/**
 * Rutas de usuarios (Admin)
 * Gestión de usuarios desde el panel de administración
 */
import express from "express";
import { protect, adminOnly, validateObjectId } from "../middleware/auth";
import * as userController from "../controllers/userController";

const router = express.Router();

// ==================== RUTAS DE ADMIN ====================
// Todas las rutas requieren autenticación y rol admin

// GET /api/users - Obtener todos los usuarios
router.get("/", protect, adminOnly, userController.getAllUsers);

// DELETE /api/users/:id - Eliminar usuario
router.delete(
  "/:id",
  validateObjectId(),
  protect,
  adminOnly,
  userController.deleteUser,
);

// PUT /api/users/:id/role - Actualizar rol de usuario
router.put(
  "/:id/role",
  validateObjectId(),
  protect,
  adminOnly,
  userController.updateUserRole,
);

export default router;
