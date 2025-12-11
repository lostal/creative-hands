/**
 * Controlador de chat
 * Contiene la lógica de negocio para gestión de mensajes y conversaciones
 */
const Message = require("../models/Message");
const User = require("../models/User");

/**
 * Verificar que el router está activo
 * @route GET /api/chat
 */
exports.healthCheck = (req, res) => {
  res.json({ success: true, message: "Chat route active" });
};

/**
 * Obtener admin
 * @route GET /api/chat/admin
 */
exports.getAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({ role: "admin" }).select("-password");
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Administrador no encontrado" });
    }
    res.json({ success: true, admin });
  } catch (error) {
    console.error("Error al obtener admin:", error);
    res.status(500).json({ success: false, message: "Error al obtener admin" });
  }
};

/**
 * Obtener mensajes de una conversación
 * @route GET /api/chat/messages/:conversationId
 */
exports.getMessages = async (req, res) => {
  try {
    let { conversationId } = req.params;

    // Si no contiene '_', asumimos que es el userId del otro participante
    if (!conversationId.includes("_")) {
      const otherUserId = conversationId;
      const currentUserId = req.user.id;
      conversationId = [currentUserId, otherUserId].sort().join("_");
    }

    const messages = await Message.find({ conversationId })
      .sort("createdAt")
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar");

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al obtener mensajes" });
  }
};

/**
 * Obtener conversaciones del usuario
 * @route GET /api/chat/conversations
 */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

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
      if (msg.receiver.toString() === userId && !msg.read) {
        conv.unreadCount += 1;
      }
    }

    const conversations = Array.from(convMap.values());

    res.json({ success: true, count: conversations.length, conversations });
  } catch (error) {
    console.error("Error al obtener conversaciones:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al obtener conversaciones" });
  }
};
