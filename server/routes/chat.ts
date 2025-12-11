/**
 * Rutas de chat
 * Mapeo de rutas a controladores - lógica de negocio en controllers/
 */
import express from "express";
import { protect } from "../middleware/auth";

// Controlador
import * as chatController from "../controllers/chatController";

const router = express.Router();

// ==================== RUTAS ====================

// GET /api/chat - Health check
router.get("/", chatController.healthCheck);

// GET /api/chat/admin - Obtener admin
router.get("/admin", protect, chatController.getAdmin);

// GET /api/chat/messages/:conversationId - Obtener mensajes
router.get("/messages/:conversationId", protect, chatController.getMessages);

// GET /api/chat/conversations - Obtener conversaciones
router.get("/conversations", protect, chatController.getConversations);

export default router;
