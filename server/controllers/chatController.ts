/**
 * Controlador de chat
 * Contiene la lógica de negocio para gestión de mensajes y conversaciones
 */
import { Request, Response } from "express";
import { Types } from "mongoose";
import Message from "../models/Message";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";
import logger from "../utils/logger";

/**
 * Valida que un string sea un ObjectId válido de MongoDB
 */
const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id;
};

/**
 * Valida el formato del conversationId
 * Puede ser: un ObjectId simple o dos ObjectIds separados por "_"
 */
const validateConversationId = (id: string): boolean => {
  if (!id || typeof id !== "string") return false;

  // Si contiene _, debe ser formato "userId1_userId2"
  if (id.includes("_")) {
    const parts = id.split("_");
    if (parts.length !== 2) return false;
    return parts.every((part) => isValidObjectId(part));
  }

  // Si no, debe ser un ObjectId simple
  return isValidObjectId(id);
};

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
 * Obtener mensajes de una conversación con paginación
 * @route GET /api/chat/messages/:conversationId
 * @query page - Número de página (default: 1)
 * @query limit - Mensajes por página (default: 50, max: 100)
 */
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    let { conversationId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit as string) || 50),
    );

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "ID de conversación requerido",
      });
    }

    // Validar formato del ID para prevenir inyecciones
    if (!validateConversationId(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Formato de ID de conversación inválido",
      });
    }

    // Si no contiene '_', asumimos que es el userId del otro participante
    if (!conversationId.includes("_")) {
      const otherUserId = conversationId;
      const currentUserId = req.user?.id;
      conversationId = [currentUserId, otherUserId].sort().join("_");
    }

    // Obtener total y mensajes con paginación
    const [total, messages] = await Promise.all([
      Message.countDocuments({ conversationId }),
      Message.find({ conversationId })
        .sort("-createdAt") // Más recientes primero
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("sender", "name avatar")
        .populate("receiver", "name avatar"),
    ]);

    // Invertir para mostrar cronológicamente en el cliente
    const sortedMessages = messages.reverse();

    res.json({
      success: true,
      count: messages.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      messages: sortedMessages,
    });
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
