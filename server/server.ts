import dotenv from "dotenv";
dotenv.config();
import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import User from "./models/User";
import Message from "./models/Message";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import logger from "./utils/logger";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import categoryRoutes from "./routes/categories";
import chatRoutes from "./routes/chat";
import orderRoutes from "./routes/orders";

// Extend Socket interface to include user info
interface AuthenticatedSocket extends Socket {
    userId?: string;
    userRole?: string;
    userName?: string;
}

// Rate limiter para rutas de autenticación (previene ataques de fuerza bruta)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos por ventana
    message: {
        success: false,
        message:
            "Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.",
    } as any, // Type cast for message object if needed
    standardHeaders: true,
    legacyHeaders: false,
});

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin:
            process.env.NODE_ENV === "production"
                ? (process.env.CLIENT_URL as string)
                : "http://localhost:5173",
        credentials: true,
    },
});

// Conectar a MongoDB
connectDB();

// Crear admin por defecto si no existe
const createDefaultAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: "admin" });
        if (!adminExists) {
            await User.create({
                name: process.env.ADMIN_NAME || "Administrador",
                email: process.env.ADMIN_EMAIL || "admin@creativehands.com",
                password: process.env.ADMIN_PASSWORD || "Admin123!",
                role: "admin",
            });
            logger.startup("✅ Administrador creado exitosamente");
            logger.startup(
                `   Email: ${process.env.ADMIN_EMAIL || "admin@creativehands.com"}`,
            );
            logger.startup("   Password: ********** (ver variables de entorno)");
        }
    } catch (error) {
        logger.error("Error al crear administrador:", error);
    }
};

createDefaultAdmin();

// Middleware
app.use(
    cors({
        origin:
            process.env.NODE_ENV === "production"
                ? (process.env.CLIENT_URL as string)
                : "http://localhost:5173",
        credentials: true,
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir imágenes subidas desde /uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); // Fixed path to be relative to root if compiled or use root relative

// Routes
// Aplicar rate limiting a rutas de autenticación sensibles
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/orders", orderRoutes);

// Health check
app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "OK", timestamp: new Date() });
});

// Servir frontend en producción
if (process.env.NODE_ENV === "production") {
    // Servir archivos estáticos del cliente
    app.use(express.static(path.join(__dirname, "../../client/dist")));

    // Todas las rutas no-API deben servir index.html (para React Router)
    app.get("*", (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
    });
}

// Socket.IO - Manejo de conexiones en tiempo real
// Usamos Set de socketIds por usuario para soportar múltiples pestañas
const connectedUsers = new Map<string, Set<string>>(); // userId -> Set<socketId>

// Middleware para autenticar socket
io.use(async (socket: Socket, next: (err?: any) => void) => {
    try {
        const authSocket = socket as AuthenticatedSocket;
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication error"));
        }

        // Intentamos verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new Error("User not found"));
        }

        authSocket.userId = user._id.toString();
        authSocket.userRole = user.role;
        authSocket.userName = user.name;

        next();
    } catch (error) {
        next(new Error("Authentication error"));
    }
});

io.on("connection", (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    logger.socket(`Usuario conectado: ${authSocket.userName} (${authSocket.userId})`);

    // Guardar conexión del usuario (soporta múltiples pestañas)
    if (authSocket.userId) {
        if (!connectedUsers.has(authSocket.userId)) {
            connectedUsers.set(authSocket.userId, new Set());
        }
        connectedUsers.get(authSocket.userId)?.add(socket.id);

        // Actualizar estado online
        User.findByIdAndUpdate(authSocket.userId, { isOnline: true }).exec();

        // Notificar a todos que el usuario está online
        io.emit("user:status", {
            userId: authSocket.userId,
            isOnline: true,
        });

        // Unirse a sala personal
        socket.join(authSocket.userId);
    }

    // Escuchar mensajes nuevos
    socket.on("message:send", async (data) => {
        try {
            const { receiverId, content } = data;
            const senderId = authSocket.userId!; // Assumed present due to auth middleware

            // Generar ID de conversación
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

            // Enviar a ambos usuarios
            io.to(senderId).emit("message:new", populatedMessage);
            io.to(receiverId).emit("message:new", populatedMessage);

            // Notificar nuevo mensaje al receptor si está conectado
            const receiverSocketIds = connectedUsers.get(receiverId);
            if (receiverSocketIds) {
                // Notify one or all sockets? emitting to room (userId) handles it, assuming they joined.
                // The original code emitted to specific socket id found in map?
                // Original: io.to(receiverSocketId).emit...
                // But map stores a Set. Original code: const receiverSocketId = connectedUsers.get(receiverId); if(receiverSocketId) io.to(receiverSocketId)...
                // Wait, original code had `connectedUsers.get(socket.userId)` returning a Set. But line 187 `connectedUsers.get(receiverId)` treated it as a single socket ID?
                // Line 112: `const connectedUsers = new Map(); // userId -> Set<socketId>`
                // Line 187: `const receiverSocketId = connectedUsers.get(receiverId);`
                // Any Set is truthy. But `io.to(Set)` might not work.
                // Ah, I see original code: `io.to(receiverSocketId).emit(...)`. If receiverSocketId is a Set, does socket.io accept a set?
                // Probably not. The original code might have had a bug or I misread 112.
                // Line 146: `connectedUsers.set(socket.userId, new Set());` -> definitely a Set.
                // Line 189: `io.to(receiverSocketId).emit...` -> This would fail if passing a Set object to `to()`.
                // `io.to()` expects room name or socket ID string.
                // I will fix this by emitting to the user room `receiverId` which they join on connection.

                io.to(receiverId).emit("message:notification", {
                    from: authSocket.userName,
                    conversationId,
                });
            }
        } catch (error) {
            logger.error("Error al enviar mensaje:", error);
            socket.emit("message:error", { message: "Error al enviar mensaje" });
        }
    });

    // Usuario escribiendo
    socket.on("typing:start", (data) => {
        const { receiverId } = data;
        io.to(receiverId).emit("typing:status", {
            userId: authSocket.userId,
            userName: authSocket.userName,
            isTyping: true,
        });
    });

    socket.on("typing:stop", (data) => {
        const { receiverId } = data;
        io.to(receiverId).emit("typing:status", {
            userId: authSocket.userId,
            userName: authSocket.userName,
            isTyping: false,
        });
    });

    // Marcar mensajes como leídos
    socket.on("messages:read", async (data) => {
        try {
            const { conversationId } = data;
            const userId = authSocket.userId!;

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

            // Notificar al remitente
            const messages = await Message.find({ conversationId });
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
    });

    // Desconexión
    socket.on("disconnect", async () => {
        const userId = authSocket.userId;
        if (userId) {
            logger.socket(`Usuario desconectado: ${authSocket.userName}`);

            // Remover solo este socket del Set del usuario
            const userSockets = connectedUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socket.id);

                // Solo marcar offline si no quedan más sockets de este usuario
                if (userSockets.size === 0) {
                    connectedUsers.delete(userId);

                    // Actualizar estado offline
                    await User.findByIdAndUpdate(userId, {
                        isOnline: false,
                        lastSeen: new Date(),
                    });

                    // Notificar a todos
                    io.emit("user:status", {
                        userId: userId,
                        isOnline: false,
                    });
                }
            }
        }
    });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Error del servidor",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    logger.startup(`\n🚀 Servidor corriendo en puerto ${PORT}`);
    logger.startup(`📡 Entorno: ${process.env.NODE_ENV || "development"}`);
    if (process.env.NODE_ENV === "production") {
        logger.startup(
            `🌐 App: ${process.env.CLIENT_URL || "https://tu-app.onrender.com"}`,
        );
    } else {
        logger.startup(`🌐 Frontend: http://localhost:5173`);
        logger.startup(`🔗 API: http://localhost:${PORT}`);
    }
    logger.startup(`🔌 Socket.IO listo para conexiones\n`);
});
