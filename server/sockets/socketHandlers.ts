/**
 * Socket.IO handlers - Lógica de WebSockets desacoplada del servidor principal
 * Maneja autenticación, mensajes en tiempo real y estado de usuarios
 */
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import Joi from "joi";
import User from "../models/User";
import Message from "../models/Message";
import logger from "../utils/logger";

/**
 * Sanitiza contenido HTML para prevenir XSS
 * Escapa caracteres peligrosos que podrían ejecutar scripts
 */
const sanitizeHtml = (content: string): string => {
  return content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/**
 * Esquema de validación para contenido de mensajes
 * Previene mensajes vacíos, extremadamente largos o con contenido peligroso
 */
const messageContentSchema = Joi.string().trim().min(1).max(2000).required();

// ==================== TIPOS DE EVENTOS ====================

/** Datos de un mensaje populado */
interface PopulatedMessage {
  _id: string;
  conversationId: string;
  sender: { _id: string; name: string; avatar?: string };
  receiver: { _id: string; name: string; avatar?: string };
  content: string;
  read: boolean;
  createdAt: Date;
}

/** Eventos emitidos del servidor al cliente */
export interface ServerToClientEvents {
  "message:new": (message: PopulatedMessage) => void;
  "message:notification": (data: {
    from: string;
    conversationId: string;
  }) => void;
  "message:error": (data: { message: string }) => void;
  "messages:read": (data: { conversationId: string }) => void;
  "user:status": (data: { userId: string; isOnline: boolean }) => void;
  "typing:status": (data: {
    userId: string;
    userName: string;
    isTyping: boolean;
  }) => void;
}

/** Eventos enviados del cliente al servidor */
export interface ClientToServerEvents {
  "message:send": (data: { receiverId: string; content: string }) => void;
  "typing:start": (data: { receiverId: string }) => void;
  "typing:stop": (data: { receiverId: string }) => void;
  "messages:read": (data: { conversationId: string }) => void;
}

/** Socket autenticado con información del usuario */
export interface AuthenticatedSocket extends Socket<
  ClientToServerEvents,
  ServerToClientEvents
> {
  userId?: string;
  userRole?: string;
  userName?: string;
}

/** Servidor tipado de Socket.IO */
export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

/**
 * Mapa de usuarios conectados - userId -> Set<socketId>
 * Soporta múltiples pestañas por usuario
 */
const connectedUsers = new Map<string, Set<string>>();

// ==================== RATE LIMITING ====================

/**
 * Configuración de rate limiting para mensajes
 */
const MESSAGE_RATE_LIMIT = {
  MAX_MESSAGES_PER_MINUTE: 30,
  WINDOW_MS: 60 * 1000, // 1 minuto
  CLEANUP_INTERVAL_MS: 5 * 60 * 1000, // Limpiar cada 5 minutos
};

/**
 * Historial de timestamps de mensajes por usuario para rate limiting
 */
const messageTimestamps = new Map<string, number[]>();

/**
 * Verifica si un usuario ha excedido el límite de mensajes por minuto
 * @returns true si el usuario puede enviar mensajes, false si está limitado
 */
const checkMessageRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const windowStart = now - MESSAGE_RATE_LIMIT.WINDOW_MS;

  // Obtener timestamps del usuario, filtrar los antiguos
  const timestamps = messageTimestamps.get(userId) || [];
  const recentTimestamps = timestamps.filter((ts) => ts > windowStart);

  // Actualizar con el nuevo mensaje si está permitido
  if (recentTimestamps.length >= MESSAGE_RATE_LIMIT.MAX_MESSAGES_PER_MINUTE) {
    return false; // Límite excedido
  }

  recentTimestamps.push(now);
  messageTimestamps.set(userId, recentTimestamps);
  return true;
};

/**
 * Limpieza periódica del historial de rate limiting
 * Elimina entradas para usuarios que no han enviado mensajes recientemente
 */
const cleanupRateLimitHistory = () => {
  const now = Date.now();
  const windowStart = now - MESSAGE_RATE_LIMIT.WINDOW_MS;

  for (const [userId, timestamps] of messageTimestamps.entries()) {
    const recent = timestamps.filter((ts) => ts > windowStart);
    if (recent.length === 0) {
      messageTimestamps.delete(userId);
    } else {
      messageTimestamps.set(userId, recent);
    }
  }
};

// Iniciar limpieza periódica
setInterval(cleanupRateLimitHistory, MESSAGE_RATE_LIMIT.CLEANUP_INTERVAL_MS);

/**
 * Middleware de autenticación para Socket.IO
 * Verifica el token JWT desde cookies httpOnly o auth header
 */
export const createAuthMiddleware = () => {
  return async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const authSocket = socket as AuthenticatedSocket;

      // Intentar obtener token de las cookies (httpOnly - preferido)
      let token: string | undefined;

      const cookieHeader = socket.handshake.headers.cookie;
      if (cookieHeader) {
        const cookies = cookie.parse(cookieHeader);
        token = cookies.token;
      }

      // Fallback: token en auth (para compatibilidad)
      if (!token) {
        token = socket.handshake.auth.token;
      }

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        logger.error("JWT_SECRET no está configurado");
        return next(new Error("Server configuration error"));
      }

      const decoded = jwt.verify(token, jwtSecret) as { id: string };
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      authSocket.userId = user._id.toString();
      authSocket.userRole = user.role;
      authSocket.userName = user.name;

      next();
    } catch (error) {
      logger.error("Error en autenticación de socket:", error);
      next(new Error("Authentication error"));
    }
  };
};

/**
 * Obtiene los IDs de usuarios con los que el usuario tiene conversaciones
 * Para enviar notificaciones de estado solo a usuarios relacionados
 */
const getRelatedUserIds = async (userId: string): Promise<string[]> => {
  try {
    const conversations = await Message.distinct("conversationId", {
      $or: [{ sender: userId }, { receiver: userId }],
    });

    const relatedIds = new Set<string>();
    for (const convId of conversations) {
      const parts = convId.split("_");
      for (const part of parts) {
        if (part !== userId) {
          relatedIds.add(part);
        }
      }
    }

    return Array.from(relatedIds);
  } catch (error) {
    logger.error("Error obteniendo usuarios relacionados:", error);
    return [];
  }
};

/**
 * Registrar usuario como conectado
 */
const registerUserConnection = async (
  socket: AuthenticatedSocket,
  io: Server,
) => {
  const { userId, userName } = socket;

  if (!userId) return;

  logger.socket(`Usuario conectado: ${userName} (${userId})`);

  // Agregar socket al Set del usuario (soporta múltiples pestañas)
  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, new Set());
  }
  connectedUsers.get(userId)?.add(socket.id);

  // Actualizar estado online en DB
  try {
    await User.findByIdAndUpdate(userId, { isOnline: true });
  } catch (error) {
    logger.error("Error actualizando estado online:", error);
  }

  // Notificar solo a usuarios con conversaciones previas (privacidad + eficiencia)
  const relatedUserIds = await getRelatedUserIds(userId);
  for (const relatedId of relatedUserIds) {
    io.to(relatedId).emit("user:status", { userId, isOnline: true });
  }

  // Unirse a sala personal para recibir mensajes directos
  socket.join(userId);
};

/**
 * Manejar envío de mensajes
 */
const handleMessageSend = async (
  socket: AuthenticatedSocket,
  io: Server,
  data: { receiverId: string; content: string },
) => {
  try {
    const { receiverId, content } = data;
    const senderId = socket.userId;

    if (!senderId) {
      socket.emit("message:error", { message: "Usuario no autenticado" });
      return;
    }

    // Verificar rate limit para prevenir spam
    if (!checkMessageRateLimit(senderId)) {
      socket.emit("message:error", {
        message: "Demasiados mensajes. Espera un momento antes de enviar más.",
      });
      return;
    }

    // Validar y sanitizar contenido del mensaje
    const { error, value: validatedContent } =
      messageContentSchema.validate(content);
    if (error) {
      const errorMessage = error.details?.[0]?.message || "Contenido inválido";
      socket.emit("message:error", {
        message: "Mensaje inválido: " + errorMessage,
      });
      return;
    }

    // Sanitizar HTML para prevenir XSS
    const sanitizedContent = sanitizeHtml(validatedContent);

    // Generar ID de conversación (ordenado para consistencia)
    const conversationId = [senderId, receiverId].sort().join("_");

    // Guardar mensaje en DB (usando contenido sanitizado)
    const message = await Message.create({
      conversationId,
      sender: senderId,
      receiver: receiverId,
      content: sanitizedContent,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar");

    // Enviar a ambos usuarios (usando sus salas personales)
    io.to(senderId).emit("message:new", populatedMessage);
    io.to(receiverId).emit("message:new", populatedMessage);

    // Notificar al receptor
    io.to(receiverId).emit("message:notification", {
      from: socket.userName,
      conversationId,
    });
  } catch (error) {
    logger.error("Error al enviar mensaje:", error);
    socket.emit("message:error", { message: "Error al enviar mensaje" });
  }
};

/**
 * Manejar indicador de escritura
 */
const handleTyping = (
  socket: AuthenticatedSocket,
  io: Server,
  receiverId: string,
  isTyping: boolean,
) => {
  io.to(receiverId).emit("typing:status", {
    userId: socket.userId,
    userName: socket.userName,
    isTyping,
  });
};

/**
 * Manejar marcado de mensajes como leídos
 */
const handleMessagesRead = async (
  socket: AuthenticatedSocket,
  io: Server,
  data: { conversationId: string },
) => {
  try {
    const { conversationId } = data;
    const userId = socket.userId;

    if (!userId) return;

    await Message.updateMany(
      {
        conversationId,
        receiver: userId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      },
    );

    // Notificar al remitente que los mensajes fueron leídos
    const messages = await Message.find({ conversationId }).limit(1);
    const firstMessage = messages[0];
    if (firstMessage) {
      const otherUserId =
        firstMessage.sender.toString() === userId
          ? firstMessage.receiver.toString()
          : firstMessage.sender.toString();

      io.to(otherUserId).emit("messages:read", { conversationId });
    }
  } catch (error) {
    logger.error("Error al marcar mensajes como leídos:", error);
  }
};

/**
 * Manejar desconexión de usuario
 */
const handleDisconnect = async (socket: AuthenticatedSocket, io: Server) => {
  const { userId, userName } = socket;

  if (!userId) return;

  logger.socket(`Usuario desconectado: ${userName}`);

  // Remover este socket del Set del usuario
  const userSockets = connectedUsers.get(userId);
  if (userSockets) {
    userSockets.delete(socket.id);

    // Solo marcar offline si no quedan más sockets de este usuario
    if (userSockets.size === 0) {
      connectedUsers.delete(userId);

      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
      } catch (error) {
        logger.error("Error actualizando estado offline:", error);
      }

      // Notificar solo a usuarios con conversaciones previas
      const relatedUserIds = await getRelatedUserIds(userId);
      for (const relatedId of relatedUserIds) {
        io.to(relatedId).emit("user:status", { userId, isOnline: false });
      }
    }
  }
};

/**
 * Configurar todos los handlers de Socket.IO
 */
export const setupSocketHandlers = (io: Server): void => {
  // Aplicar middleware de autenticación
  io.use(createAuthMiddleware());

  io.on("connection", (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;

    // Registrar conexión
    registerUserConnection(authSocket, io);

    // Event listeners
    socket.on("message:send", (data) => {
      handleMessageSend(authSocket, io, data);
    });

    socket.on("typing:start", (data: { receiverId: string }) => {
      handleTyping(authSocket, io, data.receiverId, true);
    });

    socket.on("typing:stop", (data: { receiverId: string }) => {
      handleTyping(authSocket, io, data.receiverId, false);
    });

    socket.on("messages:read", (data) => {
      handleMessagesRead(authSocket, io, data);
    });

    socket.on("disconnect", () => {
      handleDisconnect(authSocket, io);
    });
  });
};

/**
 * Obtener usuarios conectados (para debugging/admin)
 */
export const getConnectedUsers = (): Map<string, Set<string>> => {
  return connectedUsers;
};
