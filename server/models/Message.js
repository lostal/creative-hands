const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "El mensaje no puede estar vacío"],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Índice compuesto para búsquedas eficientes
messageSchema.index({ conversationId: 1, createdAt: -1 });
// Índice para consultas de mensajes no leídos por receptor
messageSchema.index({ receiver: 1, read: 1 });

module.exports = mongoose.model("Message", messageSchema);
