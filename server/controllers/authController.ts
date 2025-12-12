/**
 * Controlador de autenticación
 * Contiene la lógica de negocio para registro, login y gestión de usuarios
 */
import { Request, Response, CookieOptions } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { AuthRequest } from "../middleware/auth";
import { JWT_CONFIG } from "../config/constants";
import logger from "../utils/logger";

/**
 * Configuración de cookies para autenticación
 * httpOnly: Previene acceso desde JavaScript (XSS protection)
 * secure: Solo HTTPS en producción
 * sameSite: Protección contra CSRF
 */
const getCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === "production";

  // Parsear JWT_EXPIRE para obtener milisegundos
  const jwtExpire = process.env.JWT_EXPIRE || JWT_CONFIG.DEFAULT_EXPIRE;
  let maxAge = JWT_CONFIG.DEFAULT_MAX_AGE_MS;

  if (jwtExpire.endsWith("d")) {
    maxAge = parseInt(jwtExpire) * 24 * 60 * 60 * 1000;
  } else if (jwtExpire.endsWith("h")) {
    maxAge = parseInt(jwtExpire) * 60 * 60 * 1000;
  } else if (jwtExpire.endsWith("m")) {
    maxAge = parseInt(jwtExpire) * 60 * 1000;
  }

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge,
    path: "/",
  };
};

/**
 * Establece el token JWT en una cookie httpOnly
 */
const setTokenCookie = (res: Response, token: string): void => {
  res.cookie("token", token, getCookieOptions());
};

/**
 * Elimina la cookie de autenticación
 */
const clearTokenCookie = (res: Response): void => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
};

/**
 * Generar token JWT
 * @param id - ID del usuario
 * @returns Token JWT firmado
 */
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET no está configurado");
  }

  // JWT_EXPIRE debe ser un string válido como "7d", "24h", "3600" (segundos)
  // Usamos "7d" como valor por defecto tipado correctamente
  const expiresIn = (process.env.JWT_EXPIRE ||
    "7d") as jwt.SignOptions["expiresIn"];

  return jwt.sign({ id }, secret, { expiresIn });
};

/**
 * Registrar nuevo usuario
 * @route POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Este email ya está registrado",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "user",
    });

    const token = generateToken(user._id.toString());

    // Establecer token en cookie httpOnly (más seguro que localStorage)
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Error en registro:", error);
    res.status(500).json({
      success: false,
      message: "Error al registrar usuario",
    });
  }
};

/**
 * Iniciar sesión
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // Actualizar estado online
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id.toString());

    // Establecer token en cookie httpOnly (más seguro que localStorage)
    setTokenCookie(res, token);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    logger.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error al iniciar sesión",
    });
  }
};

/**
 * Obtener usuario actual
 * @route GET /api/auth/me
 */
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isOnline: user.isOnline,
      },
    });
  } catch (error) {
    logger.error("Error al obtener usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener información del usuario",
    });
  }
};

/**
 * Cerrar sesión
 * @route POST /api/auth/logout
 */
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.user?.id, {
      isOnline: false,
      lastSeen: new Date(),
    });

    // Limpiar cookie de autenticación
    clearTokenCookie(res);

    res.json({
      success: true,
      message: "Sesión cerrada correctamente",
    });
  } catch (error) {
    logger.error("Error en logout:", error);
    res.status(500).json({
      success: false,
      message: "Error al cerrar sesión",
    });
  }
};

/**
 * Actualizar perfil del usuario
 * @route PATCH /api/auth/me
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, password, currentPassword } = req.body;

    const user = await User.findById(req.user?.id).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    if (name) user.name = name;

    // Cambio de contraseña (Joi ya valida que currentPassword esté presente)
    if (password) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Contraseña actual incorrecta" });
      }

      user.password = password;
    }

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    logger.error("Error al actualizar perfil:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al actualizar perfil" });
  }
};
