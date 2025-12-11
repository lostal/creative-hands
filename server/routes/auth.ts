/**
 * Rutas de autenticación
 * Mapeo de rutas a controladores - lógica de negocio en controllers/
 */
import express from "express";
import { protect } from "../middleware/auth";
import {
  validate,
  registerSchema,
  loginSchema,
} from "../validators/schemas";

// Controlador
import * as authController from "../controllers/authController";

const router = express.Router();

// ==================== RUTAS PÚBLICAS ====================

// POST /api/auth/register - Registrar nuevo usuario
router.post("/register", validate(registerSchema), authController.register);

// POST /api/auth/login - Iniciar sesión
router.post("/login", validate(loginSchema), authController.login);

// ==================== RUTAS PRIVADAS ====================

// GET /api/auth/me - Obtener usuario actual
router.get("/me", protect, authController.getMe);

// POST /api/auth/logout - Cerrar sesión
router.post("/logout", protect, authController.logout);

// PATCH /api/auth/me - Actualizar perfil
router.patch("/me", protect, authController.updateProfile);

export default router;
