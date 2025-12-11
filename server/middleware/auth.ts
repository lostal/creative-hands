import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import User from "../models/User";
import logger from "../utils/logger";
import { getErrorMessage } from "../utils/errors";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Payload esperado del JWT decodificado
 */
interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

/**
 * Middleware para validar que un parámetro de URL sea un ObjectId válido de MongoDB
 * Previene errores de CastError y posibles inyecciones
 * @param paramName - Nombre del parámetro a validar (default: 'id')
 */
export const validateObjectId = (paramName: string = "id") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];

    if (!id) {
      return next(); // Si no hay parámetro, continuar (puede ser opcional)
    }

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `ID inválido: ${paramName}`,
      });
    }

    next();
  };
};

/**
 * Middleware para proteger rutas
 * Verifica JWT en header Authorization o cookies
 */
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No autorizado, token faltante" });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logger.error("JWT_SECRET no está configurado");
    return res
      .status(500)
      .json({ success: false, message: "Error de configuración del servidor" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (error: unknown) {
    logger.error("Middleware protect error:", getErrorMessage(error));
    return res.status(401).json({ success: false, message: "Token inválido" });
  }
};

// Middleware para rutas sólo administradores
export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res
    .status(403)
    .json({ success: false, message: "Permisos de administrador requeridos" });
};
