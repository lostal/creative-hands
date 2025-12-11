/**
 * Controlador de pedidos
 * Contiene la lógica de negocio para gestión de pedidos
 */
import { Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import { AuthRequest } from "../middleware/auth";
import logger from "../utils/logger";

/**
 * Crear nuevo pedido
 * @route POST /api/orders
 */
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderItems, shippingAddress } = req.body;

    // Obtener todos los productos en una sola consulta (evita N+1)
    const productIds = orderItems.map((item: any) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    // Crear mapa para acceso rápido
    const productMap = new Map(products.map((p) => [(p._id as any).toString(), p]));

    // Validar stock y calcular precio total
    let totalPrice = 0;
    const stockUpdates = [];

    for (const item of orderItems) {
      const product = productMap.get(item.product.toString());

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Producto ${item.product} no encontrado`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${product.name}`,
        });
      }

      // Usar precio de la BD (seguridad)
      totalPrice += product.price * item.quantity;

      // Preparar actualización de stock para bulkWrite
      stockUpdates.push({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: -item.quantity } },
        },
      });
    }

    // Actualizar stock en una sola operación
    if (stockUpdates.length > 0) {
      // @ts-ignore - BulkWrite types can be complex with Mongoose versions
      await Product.bulkWrite(stockUpdates);
    }

    // Crear el pedido
    const order = new Order({
      user: req.user?.id,
      orderItems,
      shippingAddress,
      totalPrice,
      paymentMethod: "Contrarreembolso",
    });

    await order.save();

    await order.populate("user", "name email");
    await order.populate("orderItems.product");

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error: any) {
    logger.error("Error al crear pedido:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear el pedido",
      error: error.message,
    });
  }
};

/**
 * Obtener mis pedidos
 * @route GET /api/orders/myorders
 */
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user?.id })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    logger.error("Error al obtener pedidos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los pedidos",
      error: error.message,
    });
  }
};

/**
 * Obtener todos los pedidos (Admin)
 * @route GET /api/orders
 */
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    logger.error("Error al obtener todos los pedidos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los pedidos",
      error: error.message,
    });
  }
};

/**
 * Obtener pedido por ID
 * @route GET /api/orders/:id
 */
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado",
      });
    }

    // Verificar autorización
    // @ts-ignore - user is populated so it might be an object
    const orderUserId = order.user._id ? order.user._id.toString() : order.user.toString();

    if (
      orderUserId !== req.user?.id &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "No autorizado para ver este pedido",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error: any) {
    logger.error("Error al obtener pedido:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el pedido",
      error: error.message,
    });
  }
};

/**
 * Marcar pedido como entregado
 * @route PUT /api/orders/:id/deliver
 */
export const deliverOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { isDelivered: true },
      { new: true },
    )
      .populate("user", "name email")
      .populate("orderItems.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error: any) {
    logger.error("Error al entregar pedido:", error);
    res.status(500).json({
      success: false,
      message: "Error al entregar el pedido",
      error: error.message,
    });
  }
};
