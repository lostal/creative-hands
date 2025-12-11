import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Middleware para proteger rutas (verifica JWT en header Authorization o cookies)
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token;

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

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as jwt.JwtPayload;
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (error: any) {
    console.error("Middleware protect error:", error.message);
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
