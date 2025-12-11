const express = require("express");
const { protect, adminOnly } = require("../middleware/auth");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { validate, orderSchema } = require("../validators/schemas");

const router = express.Router();

// POST /api/orders - Crear un nuevo pedido (protegido)
router.post("/", protect, validate(orderSchema), async (req, res) => {
  try {
    const { orderItems, shippingAddress } = req.body;
    // La validación de campos ya está hecha por Joi

    // Obtener todos los productos en una sola consulta (evita N+1)
    const productIds = orderItems.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    // Crear mapa para acceso rápido
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // Validar stock y calcular precio total
    let totalPrice = 0;
    const stockUpdates = [];

    for (const item of orderItems) {
      const product = productMap.get(item.product.toString());

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: `Producto ${item.product} no encontrado` });
      }

      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ success: false, message: `Stock insuficiente para ${product.name}` });
      }

      // Usar precio de la BD, no del cliente (seguridad)
      totalPrice += product.price * item.quantity;

      // Preparar actualización de stock para bulkWrite
      stockUpdates.push({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: -item.quantity } },
        },
      });
    }

    // Actualizar stock de todos los productos en una sola operación
    if (stockUpdates.length > 0) {
      await Product.bulkWrite(stockUpdates);
    }

    // Crear el pedido
    const order = new Order({
      user: req.user.id,
      orderItems,
      shippingAddress,
      totalPrice,
      paymentMethod: "Contrarreembolso",
    });

    await order.save();

    // Popular datos del usuario
    await order.populate("user", "name email");
    await order.populate("orderItems.product");

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear el pedido",
      error: error.message,
    });
  }
});

// GET /api/orders/myorders - Obtener mis pedidos (protegido)
router.get("/myorders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los pedidos",
      error: error.message,
    });
  }
});

// GET /api/orders - Obtener todos los pedidos (protegido + admin)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error al obtener todos los pedidos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los pedidos",
      error: error.message,
    });
  }
});

// GET /api/orders/:id - Obtener un pedido por ID (protegido)
router.get("/:id", protect, async (req, res) => {
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

    // Verificar que el usuario es el dueño del pedido o es admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No autorizado para ver este pedido",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el pedido",
      error: error.message,
    });
  }
});

// PUT /api/orders/:id/deliver - Marcar pedido como entregado (protegido + admin)
router.put("/:id/deliver", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { isDelivered: true },
      { new: true }
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
  } catch (error) {
    console.error("Error al entregar pedido:", error);
    res.status(500).json({
      success: false,
      message: "Error al entregar el pedido",
      error: error.message,
    });
  }
});

module.exports = router;
