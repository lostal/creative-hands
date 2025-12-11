/**
 * Socket.IO handlers - Lógica de WebSockets desacoplada del servidor principal
 * Maneja autenticación, mensajes en tiempo real y estado de usuarios
 */
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import User from "../models/User";
import Message from "../models/Message";
import logger from "../utils/logger";

/**
 * Socket autenticado con información del usuario
 */
export interface AuthenticatedSocket extends Socket {
    userId?: string;
    userRole?: string;
    userName?: string;
}

/**
 * Mapa de usuarios conectados - userId -> Set<socketId>
 * Soporta múltiples pestañas por usuario
 */
const connectedUsers = new Map<string, Set<string>>();

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
 * Registrar usuario como conectado
 */
const registerUserConnection = async (socket: AuthenticatedSocket, io: Server) => {
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

    // Notificar a todos que el usuario está online
    io.emit("user:status", {
        userId,
        isOnline: true,
    });

    // Unirse a sala personal para recibir mensajes directos
    socket.join(userId);
};

/**
 * Manejar envío de mensajes
 */
const handleMessageSend = async (
    socket: AuthenticatedSocket,
    io: Server,
    data: { receiverId: string; content: string }
) => {
    try {
        const { receiverId, content } = data;
        const senderId = socket.userId;

        if (!senderId) {
            socket.emit("message:error", { message: "Usuario no autenticado" });
            return;
        }

        // Generar ID de conversación (ordenado para consistencia)
        const conversationId = [senderId, receiverId].sort().join("_");

        // Guardar mensaje en DB
        const message = await Message.create({
            conversationId,
            sender: senderId,
            receiver: receiverId,
            content,
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
    isTyping: boolean
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
    data: { conversationId: string }
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
            }
        );

        // Notificar al remitente que los mensajes fueron leídos
        const messages = await Message.find({ conversationId }).limit(1);
        if (messages.length > 0) {
            const otherUserId =
                messages[0].sender.toString() === userId
                    ? messages[0].receiver.toString()
                    : messages[0].sender.toString();

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

            // Notificar a todos
            io.emit("user:status", {
                userId,
                isOnline: false,
            });
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
