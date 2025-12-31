/**
 * GraphQL Resolvers
 * Implementan la lógica para queries y mutations de GraphQL
 */
import { Types } from "mongoose";
import Product from "../models/Product";
import Order from "../models/Order";
import User from "../models/User";

// Tipos para el contexto de GraphQL
interface GraphQLContext {
  user?: {
    id: string;
    role: "user" | "admin";
  };
}

// Input types
interface OrderItemInput {
  product: string;
  name: string;
  quantity: number;
  price: number;
}

interface CreateOrderInput {
  orderItems: OrderItemInput[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
}

export const resolvers = {
  // ==================== QUERIES ====================

  Query: {
    /**
     * Obtener todos los productos
     */
    products: async () => {
      const products = await Product.find()
        .populate("categoryId")
        .populate("createdBy", "name email")
        .populate("reviews.user", "name avatar")
        .sort({ createdAt: -1 });
      return products;
    },

    /**
     * Obtener producto por ID
     */
    product: async (_: unknown, { id }: { id: string }) => {
      const product = await Product.findById(id)
        .populate("categoryId")
        .populate("createdBy", "name email")
        .populate("reviews.user", "name avatar");
      return product;
    },

    /**
     * Obtener todos los pedidos (Admin only)
     */
    orders: async (_: unknown, __: unknown, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("No autenticado");
      }
      if (context.user.role !== "admin") {
        throw new Error("No autorizado - Solo administradores");
      }

      const orders = await Order.find()
        .populate("user", "name email")
        .populate("orderItems.product")
        .sort({ createdAt: -1 });
      return orders;
    },

    /**
     * Obtener pedido por ID
     */
    order: async (
      _: unknown,
      { id }: { id: string },
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new Error("No autenticado");
      }

      const order = await Order.findById(id)
        .populate("user", "name email")
        .populate("orderItems.product");

      if (!order) {
        throw new Error("Pedido no encontrado");
      }

      // Si no es admin, verificar que sea su pedido
      if (context.user.role !== "admin") {
        const orderUserId = order.user._id?.toString() || order.user.toString();
        if (orderUserId !== context.user.id) {
          throw new Error("No autorizado para ver este pedido");
        }
      }

      return order;
    },

    /**
     * Obtener mis pedidos (Usuario autenticado)
     */
    myOrders: async (_: unknown, __: unknown, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("No autenticado");
      }

      const orders = await Order.find({ user: context.user.id })
        .populate("orderItems.product")
        .sort({ createdAt: -1 });
      return orders;
    },
  },

  // ==================== MUTATIONS ====================

  Mutation: {
    /**
     * Crear nuevo pedido
     */
    createOrder: async (
      _: unknown,
      { input }: { input: CreateOrderInput },
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new Error("No autenticado");
      }

      // Los administradores no pueden crear pedidos
      if (context.user.role === "admin") {
        throw new Error("Los administradores no pueden realizar pedidos");
      }

      const { orderItems, shippingAddress } = input;

      // Obtener productos para validar existencia y obtener precios
      const productIds = orderItems.map((item) => item.product);
      const products = await Product.find({ _id: { $in: productIds } });
      const productMap = new Map(products.map((p) => [p._id.toString(), p]));

      // Validar stock y decrementar ATÓMICAMENTE para evitar race conditions
      let totalPrice = 0;
      const updatedProducts: {
        id: string;
        name: string;
        price: number;
        quantity: number;
      }[] = [];

      for (const item of orderItems) {
        const product = productMap.get(item.product);

        if (!product) {
          // Revertir stock de productos ya decrementados
          for (const updated of updatedProducts) {
            await Product.findByIdAndUpdate(updated.id, {
              $inc: { stock: updated.quantity },
            });
          }
          throw new Error(`Producto ${item.product} no encontrado`);
        }

        // Operación ATÓMICA: solo decrementa si hay stock suficiente
        const result = await Product.findOneAndUpdate(
          {
            _id: item.product,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          { new: true },
        );

        if (!result) {
          // Stock insuficiente - revertir productos ya decrementados
          for (const updated of updatedProducts) {
            await Product.findByIdAndUpdate(updated.id, {
              $inc: { stock: updated.quantity },
            });
          }
          throw new Error(
            `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
          );
        }

        updatedProducts.push({
          id: item.product,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        });

        totalPrice += product.price * item.quantity;
      }

      // Crear orden con status 'pending'
      const order = new Order({
        user: context.user.id,
        orderItems,
        shippingAddress,
        totalPrice,
        paymentMethod: "Contrarreembolso",
        status: "pending",
      });

      try {
        await order.save();
      } catch (saveError) {
        // Si falla la creación del pedido, revertir el stock
        for (const updated of updatedProducts) {
          await Product.findByIdAndUpdate(updated.id, {
            $inc: { stock: updated.quantity },
          });
        }
        throw saveError;
      }

      await order.populate("user", "name email");
      await order.populate("orderItems.product");

      return order;
    },

    /**
     * Actualizar estado del pedido (Admin only)
     */
    updateOrderStatus: async (
      _: unknown,
      { id, status }: { id: string; status: string },
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new Error("No autenticado");
      }
      if (context.user.role !== "admin") {
        throw new Error("No autorizado - Solo administradores");
      }

      if (!["pending", "completed"].includes(status)) {
        throw new Error("Estado no válido. Usar: pending o completed");
      }

      const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
        .populate("user", "name email")
        .populate("orderItems.product");

      if (!order) {
        throw new Error("Pedido no encontrado");
      }

      return order;
    },
  },

  // ==================== FIELD RESOLVERS ====================

  Order: {
    user: async (parent: {
      user: Types.ObjectId | { _id: Types.ObjectId };
    }) => {
      if (typeof parent.user === "object" && "_id" in parent.user) {
        return parent.user;
      }
      return await User.findById(parent.user).select("name email");
    },
  },
};
