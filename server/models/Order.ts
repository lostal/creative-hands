import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOrderItem {
  name: string;
  quantity: number;
  price: number;
  product: Types.ObjectId;
}

export interface IShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  orderItems: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  totalPrice: number;
  status: "pending" | "completed";
}

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
    shippingAddress: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: "Contrarreembolso",
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Índices para consultas frecuentes
orderSchema.index({ user: 1, createdAt: -1 }); // "Mis pedidos" ordenados por fecha
orderSchema.index({ status: 1 }); // Filtrar pedidos por estado

export default mongoose.model<IOrder>("Order", orderSchema);
