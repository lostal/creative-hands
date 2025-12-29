/**
 * Controlador de usuarios (Admin)
 * Gestión de usuarios desde el panel de administración
 */
import { Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";
import logger from "../utils/logger";
import { getErrorForResponse } from "../utils/errors";

/**
 * Obtener todos los usuarios
 * @route GET /api/users
 */
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find()
      .select("-password -loginAttempts -lockUntil")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error: unknown) {
    logger.error("Error al obtener usuarios:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los usuarios",
      error: getErrorForResponse(error),
    });
  }
};

/**
 * Eliminar usuario
 * @route DELETE /api/users/:id
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;

    // No permitir que el admin se elimine a sí mismo
    if (userId === req.user?.id) {
      return res.status(400).json({
        success: false,
        message: "No puedes eliminar tu propia cuenta",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "Usuario eliminado correctamente",
    });
  } catch (error: unknown) {
    logger.error("Error al eliminar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el usuario",
      error: getErrorForResponse(error),
    });
  }
};

/**
 * Actualizar rol de usuario
 * @route PUT /api/users/:id/role
 */
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const { role } = req.body as { role: string };

    // Validar rol
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Rol no válido. Usar: user o admin",
      });
    }

    // No permitir que el admin cambie su propio rol
    if (userId === req.user?.id) {
      return res.status(400).json({
        success: false,
        message: "No puedes cambiar tu propio rol",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true },
    ).select("-password -loginAttempts -lockUntil");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error: unknown) {
    logger.error("Error al actualizar rol:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el rol",
      error: getErrorForResponse(error),
    });
  }
};
