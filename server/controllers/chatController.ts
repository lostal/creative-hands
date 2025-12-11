/**
 * Controlador de chat
 * Contiene la lógica de negocio para gestión de mensajes y conversaciones
 */
import { Request, Response } from "express";
import Message from "../models/Message";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";
import logger from "../utils/logger";

/**
 * Verificar que el router está activo
 * @route GET /api/chat
 */
export const healthCheck = (req: Request, res: Response) => {
  res.json({ success: true, message: "Chat route active" });
};

/**
 * Obtener admin
 * @route GET /api/chat/admin
 */
export const getAdmin = async (req: Request, res: Response) => {
  try {
    const admin = await User.findOne({ role: "admin" }).select("-password");
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Administrador no encontrado" });
    }
    res.json({ success: true, admin });
  } catch (error) {
    logger.error("Error al obtener admin:", error);
    res.status(500).json({ success: false, message: "Error al obtener admin" });
  }
};

/**
 * Obtener mensajes de una conversación
 * @route GET /api/chat/messages/:conversationId
 */
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    let { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "ID de conversación requerido",
      });
    }

    // Si no contiene '_', asumimos que es el userId del otro participante
    if (!conversationId.includes("_")) {
      const otherUserId = conversationId;
      const currentUserId = req.user?.id;
      conversationId = [currentUserId, otherUserId].sort().join("_");
    }

    const messages = await Message.find({ conversationId })
      .sort("createdAt")
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar");

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    logger.error("Error al obtener mensajes:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al obtener mensajes" });
  }
};

/**
 * Obtener conversaciones del usuario
 * @route GET /api/chat/conversations
 */
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort("-createdAt")
      .limit(500)
      .populate("sender", "name email isOnline")
      .populate("receiver", "name email isOnline");

    // Agrupar por conversationId
    const convMap = new Map();

    for (const msg of messages) {
      if (!convMap.has(msg.conversationId)) {
        const otherUser =
          msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
        convMap.set(msg.conversationId, {
          conversationId: msg.conversationId,
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      // Contar no leídos
      const conv = convMap.get(msg.conversationId);
      if (msg.receiver._id.toString() === userId && !msg.read) {
        conv.unreadCount += 1;
      }
    }

    const conversations = Array.from(convMap.values());

    res.json({ success: true, count: conversations.length, conversations });
  } catch (error) {
    logger.error("Error al obtener conversaciones:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al obtener conversaciones" });
  }
};
