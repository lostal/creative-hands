require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const User = require("./models/User");
const Message = require("./models/Message");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");

// Rate limiter para rutas de autenticación (previene ataques de fuerza bruta)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por ventana
  message: {
    success: false,
    message:
      "Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL
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
        ? process.env.CLIENT_URL
        : "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir imágenes subidas desde /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
// Aplicar rate limiting a rutas de autenticación sensibles
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/orders", require("./routes/orders"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Servir frontend en producción
if (process.env.NODE_ENV === "production") {
  // Servir archivos estáticos del cliente
  app.use(express.static(path.join(__dirname, "../client/dist")));

  // Todas las rutas no-API deben servir index.html (para React Router)
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

// Socket.IO - Manejo de conexiones en tiempo real
// Usamos Set de socketIds por usuario para soportar múltiples pestañas
const connectedUsers = new Map(); // userId -> Set<socketId>

// Middleware para autenticar socket
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    // Intentamos verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    socket.userName = user.name;

    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  logger.socket(`Usuario conectado: ${socket.userName} (${socket.userId})`);

  // Guardar conexión del usuario (soporta múltiples pestañas)
  if (!connectedUsers.has(socket.userId)) {
    connectedUsers.set(socket.userId, new Set());
  }
  connectedUsers.get(socket.userId).add(socket.id);

  // Actualizar estado online
  User.findByIdAndUpdate(socket.userId, { isOnline: true }).exec();

  // Notificar a todos que el usuario está online
  io.emit("user:status", {
    userId: socket.userId,
    isOnline: true,
  });

  // Unirse a sala personal
  socket.join(socket.userId);

  // Escuchar mensajes nuevos
  socket.on("message:send", async (data) => {
    try {
      const { receiverId, content } = data;

      // Generar ID de conversación
      const conversationId = [socket.userId, receiverId].sort().join("_");

      // Guardar mensaje en DB
      const message = await Message.create({
        conversationId,
        sender: socket.userId,
        receiver: receiverId,
        content,
      });

      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "name avatar")
        .populate("receiver", "name avatar");

      // Enviar a ambos usuarios
      io.to(socket.userId).emit("message:new", populatedMessage);
      io.to(receiverId).emit("message:new", populatedMessage);

      // Notificar nuevo mensaje al receptor si está conectado
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message:notification", {
          from: socket.userName,
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
      userId: socket.userId,
      userName: socket.userName,
      isTyping: true,
    });
  });

  socket.on("typing:stop", (data) => {
    const { receiverId } = data;
    io.to(receiverId).emit("typing:status", {
      userId: socket.userId,
      userName: socket.userName,
      isTyping: false,
    });
  });

  // Marcar mensajes como leídos
  socket.on("messages:read", async (data) => {
    try {
      const { conversationId } = data;

      await Message.updateMany(
        {
          conversationId,
          receiver: socket.userId,
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
          messages[0].sender.toString() === socket.userId
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
    logger.socket(`Usuario desconectado: ${socket.userName}`);

    // Remover solo este socket del Set del usuario
    const userSockets = connectedUsers.get(socket.userId);
    if (userSockets) {
      userSockets.delete(socket.id);

      // Solo marcar offline si no quedan más sockets de este usuario
      if (userSockets.size === 0) {
        connectedUsers.delete(socket.userId);

        // Actualizar estado offline
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        // Notificar a todos
        io.emit("user:status", {
          userId: socket.userId,
          isOnline: false,
        });
      }
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
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
