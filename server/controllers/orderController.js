/**
 * Controlador de pedidos
 * Contiene la lógica de negocio para gestión de pedidos
 */
const Order = require("../models/Order");
const Product = require("../models/Product");

/**
 * Crear nuevo pedido
 * @route POST /api/orders
 */
exports.createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress } = req.body;

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
};

/**
 * Obtener mis pedidos
 * @route GET /api/orders/myorders
 */
exports.getMyOrders = async (req, res) => {
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
};

/**
 * Obtener todos los pedidos (Admin)
 * @route GET /api/orders
 */
exports.getAllOrders = async (req, res) => {
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
};

/**
 * Obtener pedido por ID
 * @route GET /api/orders/:id
 */
exports.getOrderById = async (req, res) => {
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
    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
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
  } catch (error) {
    console.error("Error al obtener pedido:", error);
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
exports.deliverOrder = async (req, res) => {
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
  } catch (error) {
    console.error("Error al entregar pedido:", error);
    res.status(500).json({
      success: false,
      message: "Error al entregar el pedido",
      error: error.message,
    });
  }
};
