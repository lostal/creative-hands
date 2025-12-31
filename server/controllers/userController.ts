/**
 * Controlador de usuarios (Admin)
 * Gestión de usuarios desde el panel de administración
 */
import { Response } from "express";
import User from "../models/User";
import Order from "../models/Order";
import Message from "../models/Message";
import Product from "../models/Product";
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
 * Eliminar usuario con cascada de datos relacionados
 * Elimina: pedidos, mensajes y reviews del usuario
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

    // Cascada: eliminar datos relacionados en paralelo
    const [ordersResult, messagesResult, reviewsResult] = await Promise.all([
      // Eliminar todos los pedidos del usuario
      Order.deleteMany({ user: userId }),

      // Eliminar todos los mensajes donde el usuario es sender o receiver
      Message.deleteMany({
        $or: [{ sender: userId }, { receiver: userId }],
      }),

      // Eliminar reviews del usuario de todos los productos
      Product.updateMany({}, { $pull: { reviews: { user: userId } } }),
    ]);

    // Logging para auditoría
    logger.info(
      `Cascada de eliminación para usuario ${userId}: ` +
        `${ordersResult.deletedCount} pedidos, ` +
        `${messagesResult.deletedCount} mensajes, ` +
        `${reviewsResult.modifiedCount} productos con reviews eliminadas`
    );

    // Finalmente eliminar el usuario
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "Usuario y datos relacionados eliminados correctamente",
      deletedData: {
        orders: ordersResult.deletedCount,
        messages: messagesResult.deletedCount,
        productsWithReviewsRemoved: reviewsResult.modifiedCount,
      },
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
 * Incluye verificación de historial y advertencias
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

    // Verificar que el usuario existe
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Si el rol no cambia, no hacer nada
    if (existingUser.role === role) {
      return res.json({
        success: true,
        user: existingUser,
        message: "El usuario ya tiene este rol",
      });
    }

    // Prevenir degradar al último administrador del sistema
    if (existingUser.role === "admin" && role === "user") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "No se puede degradar al último administrador del sistema",
        });
      }
    }

    // Verificar historial del usuario (pedidos y mensajes)
    const [orderCount, messageCount] = await Promise.all([
      Order.countDocuments({ user: userId }),
      Message.countDocuments({
        $or: [{ sender: userId }, { receiver: userId }],
      }),
    ]);

    const hasHistory = orderCount > 0 || messageCount > 0;

    // Preparar datos de actualización
    const updateData: { role: string; roleChangedAt?: Date } = { role };

    // Si tiene historial, registrar la fecha del cambio
    if (hasHistory) {
      updateData.roleChangedAt = new Date();
      logger.info(
        `Cambio de rol con historial: Usuario ${userId} de ${existingUser.role} a ${role}. ` +
          `Historial: ${orderCount} pedidos, ${messageCount} mensajes.`
      );
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password -loginAttempts -lockUntil");

    // Construir mensaje de advertencia si hay historial
    let warning: string | undefined;
    if (hasHistory) {
      const historyParts: string[] = [];
      if (orderCount > 0) {
        historyParts.push(`${orderCount} pedido${orderCount > 1 ? "s" : ""}`);
      }
      if (messageCount > 0) {
        historyParts.push(
          `${messageCount} mensaje${messageCount > 1 ? "s" : ""}`
        );
      }
      warning = `El usuario tenía ${historyParts.join(" y ")} que permanecerán como historial.`;
    }

    res.json({
      success: true,
      user,
      warning,
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
