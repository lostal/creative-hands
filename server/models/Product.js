const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del producto es obligatorio"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: 0,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    materials: [String],
    dimensions: {
      height: Number,
      width: Number,
      depth: Number,
      unit: {
        type: String,
        default: "cm",
      },
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        default: "g",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Valoraciones / opiniones de los usuarios
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        title: { type: String, required: true },
        comment: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Índice para búsquedas
productSchema.index({ name: "text", description: "text" });
// Índices para consultas frecuentes
productSchema.index({ categoryId: 1 });
productSchema.index({ createdBy: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
