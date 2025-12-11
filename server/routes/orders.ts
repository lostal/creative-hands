/**
 * Rutas de pedidos
 * Mapeo de rutas a controladores - lógica de negocio en controllers/
 */
import express from "express";
import { protect, adminOnly } from "../middleware/auth";
import { validate, orderSchema } from "../validators/schemas";

// Controlador
import * as orderController from "../controllers/orderController";

const router = express.Router();

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

export default router;
