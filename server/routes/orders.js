/**
 * Rutas de pedidos
 * Mapeo de rutas a controladores - lógica de negocio en controllers/
 */
const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const { validate, orderSchema } = require("../validators/schemas");

// Controlador
const orderController = require("../controllers/orderController");

// ==================== RUTAS PROTEGIDAS ====================

// POST /api/orders - Crear nuevo pedido
router.post("/", protect, validate(orderSchema), orderController.createOrder);

// GET /api/orders/myorders - Obtener mis pedidos
router.get("/myorders", protect, orderController.getMyOrders);

// GET /api/orders/:id - Obtener pedido por ID
router.get("/:id", protect, orderController.getOrderById);

// ==================== RUTAS DE ADMIN ====================

// GET /api/orders - Obtener todos los pedidos
router.get("/", protect, adminOnly, orderController.getAllOrders);

// PUT /api/orders/:id/deliver - Marcar como entregado
router.put("/:id/deliver", protect, adminOnly, orderController.deliverOrder);

module.exports = router;
