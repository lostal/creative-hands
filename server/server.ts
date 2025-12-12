import dotenv from "dotenv";
dotenv.config();

import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db";
import { RATE_LIMITS } from "./config/constants";
import User from "./models/User";
import logger from "./utils/logger";
import { setupSocketHandlers } from "./sockets/socketHandlers";

// Routes
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import categoryRoutes from "./routes/categories";
import chatRoutes from "./routes/chat";
import orderRoutes from "./routes/orders";

/**
 * Validar variables de entorno críticas
 * Fail-fast: la aplicación no debe iniciar sin configuración correcta
 */
const validateEnvironment = (): void => {
  const requiredEnvVars = [
    "JWT_SECRET",
    "MONGODB_URI",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(
      `Variables de entorno requeridas no configuradas: ${missing.join(", ")}`,
    );
  }

  // Validar credenciales de admin si se quiere crear uno por defecto
  if (process.env.CREATE_DEFAULT_ADMIN === "true") {
    const adminVars = ["ADMIN_EMAIL", "ADMIN_PASSWORD", "ADMIN_NAME"];
    const missingAdmin = adminVars.filter((envVar) => !process.env[envVar]);

    if (missingAdmin.length > 0) {
      throw new Error(
        `CREATE_DEFAULT_ADMIN está activo pero faltan variables: ${missingAdmin.join(", ")}`,
      );
    }

    // Validar que la contraseña cumpla requisitos mínimos
    const password = process.env.ADMIN_PASSWORD!;
    if (password.length < 8) {
      throw new Error("ADMIN_PASSWORD debe tener al menos 8 caracteres");
    }
  }
};

/**
 * Crear administrador por defecto si está habilitado y no existe
 * SOLO se crea si CREATE_DEFAULT_ADMIN=true y las credenciales están configuradas
 */
const createDefaultAdmin = async (): Promise<void> => {
  if (process.env.CREATE_DEFAULT_ADMIN !== "true") {
    logger.info("Creación de admin por defecto deshabilitada");
    return;
  }

  try {
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      logger.info("Administrador ya existe, omitiendo creación");
      return;
    }

    // Las variables ya están validadas en validateEnvironment()
    await User.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
    });

    logger.startup("✅ Administrador creado exitosamente");
    logger.startup(`   Email: ${process.env.ADMIN_EMAIL}`);
    logger.startup("   Password: ********** (ver variables de entorno)");
  } catch (error) {
    logger.error("Error al crear administrador:", error);
    throw error; // Fail-fast si no se puede crear el admin cuando se requiere
  }
};

/**
 * Configurar rate limiters
 */
const createRateLimiters = () => {
  const authLimiter = rateLimit({
    windowMs: RATE_LIMITS.AUTH_WINDOW_MS,
    max: RATE_LIMITS.AUTH_MAX_ATTEMPTS,
    message: {
      success: false,
      message:
        "Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  return { authLimiter };
};

/**
 * Obtener origen permitido para CORS según entorno
 */
const getCorsOrigin = (): string => {
  return process.env.NODE_ENV === "production"
    ? process.env.CLIENT_URL || ""
    : "http://localhost:5173";
};

/**
 * Configurar middleware de Express
 */
const configureMiddleware = (app: Express): void => {
  // Configurar trust proxy para producción (necesario para express-rate-limit detrás de proxy)
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(
    cors({
      origin: getCorsOrigin(),
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Servir imágenes subidas
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
};

/**
 * Configurar rutas de la API
 */
const configureRoutes = (app: Express): void => {
  const { authLimiter } = createRateLimiters();

  // Aplicar rate limiting a rutas de autenticación sensibles
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);

  // Rutas de la API
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/orders", orderRoutes);

  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "OK", timestamp: new Date() });
  });
};

/**
 * Configurar servicio de archivos estáticos para producción
 */
const configureStaticFiles = (app: Express): void => {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../../client/dist")));

    // Todas las rutas no-API sirven index.html (para React Router)
    // Express 5: wildcard debe tener nombre, usamos {*splat} para incluir /
    app.get("/{*splat}", (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
    });
  }
};

/**
 * Configurar manejador global de errores
 * - En desarrollo: expone mensaje de error para debugging
 * - En producción: solo mensaje genérico, logs completos en servidor
 */
const configureErrorHandler = (app: Express): void => {
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const isDev = process.env.NODE_ENV === "development";

    // En producción, log completo para debugging del servidor
    if (!isDev) {
      logger.error("Error no manejado:", {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      });
    } else {
      // En desarrollo, log más legible
      logger.error("Error no manejado:", err.stack);
    }

    res.status(500).json({
      success: false,
      message: isDev ? err.message : "Error del servidor",
      // Nunca exponer stack trace, solo mensaje en dev
    });
  });
};

/**
 * Crear y configurar instancia de Socket.IO
 */
const createSocketServer = (server: http.Server): Server => {
  return new Server(server, {
    cors: {
      origin: getCorsOrigin(),
      credentials: true,
    },
  });
};

/**
 * Iniciar el servidor
 */
const startServer = async (): Promise<void> => {
  try {
    // 1. Validar configuración (fail-fast)
    validateEnvironment();

    // 2. Conectar a la base de datos ANTES de aceptar conexiones
    await connectDB();

    // 3. Crear admin por defecto si está configurado
    await createDefaultAdmin();

    // 4. Configurar Express
    const app: Express = express();
    const server = http.createServer(app);

    configureMiddleware(app);
    configureRoutes(app);
    configureStaticFiles(app);
    configureErrorHandler(app);

    // 5. Configurar Socket.IO
    const io = createSocketServer(server);
    setupSocketHandlers(io);

    // 6. Iniciar servidor
    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      logger.startup(`\n🚀 Servidor corriendo en puerto ${PORT}`);
      logger.startup(`📡 Entorno: ${process.env.NODE_ENV || "development"}`);

      if (process.env.NODE_ENV === "production") {
        logger.startup(`🌐 App: ${process.env.CLIENT_URL}`);
      } else {
        logger.startup(`🌐 Frontend: http://localhost:5173`);
        logger.startup(`🔗 API: http://localhost:${PORT}`);
      }

      logger.startup(`🔌 Socket.IO listo para conexiones\n`);
    });
  } catch (error) {
    logger.error("❌ Error fatal al iniciar el servidor:", error);
    process.exit(1);
  }
};

// Iniciar aplicación
startServer();
