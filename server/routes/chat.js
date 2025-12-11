/**
 * Rutas de chat
 * Mapeo de rutas a controladores - lógica de negocio en controllers/
 */
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

// Controlador
const chatController = require("../controllers/chatController");

// ==================== RUTAS ====================

// GET /api/chat - Health check
router.get("/", chatController.healthCheck);

// GET /api/chat/admin - Obtener admin
router.get("/admin", protect, chatController.getAdmin);

// GET /api/chat/messages/:conversationId - Obtener mensajes
router.get("/messages/:conversationId", protect, chatController.getMessages);

// GET /api/chat/conversations - Obtener conversaciones
router.get("/conversations", protect, chatController.getConversations);

module.exports = router;
