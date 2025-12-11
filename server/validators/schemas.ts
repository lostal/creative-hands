/**
 * Esquemas de validación con Joi para requests del servidor
 * Centraliza validaciones para mantener controladores limpios
 */
import Joi from "joi";
import { Request, Response, NextFunction } from "express";

// Esquema para registro de usuario
export const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50).messages({
    "string.empty": "El nombre es obligatorio",
    "string.min": "El nombre debe tener al menos 2 caracteres",
    "string.max": "El nombre no puede exceder 50 caracteres",
  }),
  email: Joi.string().required().email().messages({
    "string.empty": "El email es obligatorio",
    "string.email": "Email no válido",
  }),
  password: Joi.string().required().min(6).messages({
    "string.empty": "La contraseña es obligatoria",
    "string.min": "La contraseña debe tener al menos 6 caracteres",
  }),
});

// Esquema para login
export const loginSchema = Joi.object({
  email: Joi.string().required().email().messages({
    "string.empty": "El email es obligatorio",
    "string.email": "Email no válido",
  }),
  password: Joi.string().required().messages({
    "string.empty": "La contraseña es obligatoria",
  }),
});

// Esquema para actualizar perfil
export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional().messages({
    "string.min": "El nombre debe tener al menos 2 caracteres",
    "string.max": "El nombre no puede exceder 50 caracteres",
  }),
  currentPassword: Joi.string().optional(),
  password: Joi.string().min(6).optional().messages({
    "string.min": "La nueva contraseña debe tener al menos 6 caracteres",
  }),
}).with("password", "currentPassword").messages({
  "object.with": "Se requiere la contraseña actual para cambiar la contraseña",
});

// Esquema para crear producto (todos los campos requeridos)
export const productSchema = Joi.object({
  name: Joi.string().required().min(3).max(100).messages({
    "string.empty": "El nombre del producto es obligatorio",
    "string.min": "El nombre debe tener al menos 3 caracteres",
  }),
  description: Joi.string().required().min(10).messages({
    "string.empty": "La descripción es obligatoria",
    "string.min": "La descripción debe tener al menos 10 caracteres",
  }),
  price: Joi.number().required().min(0).messages({
    "number.base": "El precio debe ser un número",
    "number.min": "El precio no puede ser negativo",
  }),
  stock: Joi.number().integer().min(0).default(0).messages({
    "number.base": "El stock debe ser un número",
    "number.min": "El stock no puede ser negativo",
  }),
  categoryId: Joi.string().optional().allow(""),
  materials: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .optional(),
  keepImages: Joi.string().optional(), // JSON string array
  order: Joi.string().optional(), // JSON string array
});

// Esquema para actualizar producto (campos opcionales para partial updates)
export const productUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(100).messages({
    "string.min": "El nombre debe tener al menos 3 caracteres",
  }),
  description: Joi.string().min(10).messages({
    "string.min": "La descripción debe tener al menos 10 caracteres",
  }),
  price: Joi.number().min(0).messages({
    "number.base": "El precio debe ser un número",
    "number.min": "El precio no puede ser negativo",
  }),
  stock: Joi.number().integer().min(0).messages({
    "number.base": "El stock debe ser un número",
    "number.min": "El stock no puede ser negativo",
  }),
  categoryId: Joi.string().allow(""),
  materials: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string()),
  keepImages: Joi.string(), // JSON string array
  order: Joi.string(), // JSON string array
}).min(1).messages({
  "object.min": "Debe proporcionar al menos un campo para actualizar",
});

// Esquema para review
export const reviewSchema = Joi.object({
  title: Joi.string().required().min(3).max(100).messages({
    "string.empty": "El título es obligatorio",
    "string.min": "El título debe tener al menos 3 caracteres",
  }),
  comment: Joi.string().required().min(10).messages({
    "string.empty": "El comentario es obligatorio",
    "string.min": "El comentario debe tener al menos 10 caracteres",
  }),
  rating: Joi.number().required().integer().min(1).max(5).messages({
    "number.base": "Rating debe ser un número",
    "number.min": "Rating mínimo es 1",
    "number.max": "Rating máximo es 5",
  }),
});

// Esquema para crear pedido
export const orderSchema = Joi.object({
  orderItems: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().required(),
        name: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().min(0).required(),
      }),
    )
    .min(1)
    .required()
    .messages({
      "array.min": "El pedido debe contener al menos un producto",
    }),
  shippingAddress: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    phone: Joi.string().required(),
  }).required(),
});

// Esquema para categoría
export const categorySchema = Joi.object({
  name: Joi.string().required().min(2).max(50).messages({
    "string.empty": "El nombre es obligatorio",
  }),
  slug: Joi.string().optional().allow(""),
  description: Joi.string().optional().allow(""),
});

/**
 * Middleware factory para validar request body con Joi
 * @param schema - Esquema de validación
 */
export const validate = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Recoger todos los errores
      stripUnknown: true, // Eliminar campos no definidos
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors,
      });
    }

    // Reemplazar body con valores validados y sanitizados
    req.body = value;
    next();
  };
};
