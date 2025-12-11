import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessage extends Document {
  conversationId: string;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  content: string;
  read: boolean;
  readAt?: Date;
}

const messageSchema = new Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
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

export default mongoose.model<IMessage>("Message", messageSchema);
