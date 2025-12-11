/**
 * Rutas de pedidos
 * Mapeo de rutas a controladores - lógica de negocio en controllers/
 */
import express from "express";
import { protect, adminOnly, validateObjectId } from "../middleware/auth";
import { validate, orderSchema } from "../validators/schemas";

// Controlador
import * as orderController from "../controllers/orderController";

const router = express.Router();

// ==================== RUTAS DE ADMIN ====================
// NOTA: Las rutas sin parámetros dinámicos deben ir ANTES de las rutas con :id

// GET /api/orders - Obtener todos los pedidos (Admin)
router.get("/", protect, adminOnly, orderController.getAllOrders);

// ==================== RUTAS PROTEGIDAS ====================

// POST /api/orders - Crear nuevo pedido
router.post("/", protect, validate(orderSchema), orderController.createOrder);

// GET /api/orders/myorders - Obtener mis pedidos
router.get("/myorders", protect, orderController.getMyOrders);

// GET /api/orders/:id - Obtener pedido por ID
router.get("/:id", validateObjectId(), protect, orderController.getOrderById);

// PUT /api/orders/:id/deliver - Marcar como entregado
router.put(
  "/:id/deliver",
  validateObjectId(),
  protect,
  adminOnly,
  orderController.deliverOrder,
);

export default router;
