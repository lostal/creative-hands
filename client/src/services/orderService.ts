/**
 * Servicio de pedidos - Capa de abstracción para llamadas API
 */
import api from "../utils/axios";
import { Order } from "../types";

interface CreateOrderData {
  orderItems: {
    product: string;
    name: string;
    qty: number;
    image: string;
    price: number;
  }[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}

/**
 * Crear nuevo pedido
 * @param {Object} orderData - {orderItems, shippingAddress}
 */
export const createOrder = async (orderData: CreateOrderData): Promise<{ success: boolean; order: Order }> => {
  const { data } = await api.post("/orders", orderData);
  return data;
};

/**
 * Obtener mis pedidos (usuario actual)
 */
export const getMyOrders = async (): Promise<{ success: boolean; orders: Order[] }> => {
  const { data } = await api.get("/orders/myorders");
  return data;
};

/**
 * Obtener todos los pedidos (requiere admin)
 */
export const getAllOrders = async (): Promise<{ success: boolean; orders: Order[] }> => {
  const { data } = await api.get("/orders");
  return data;
};

/**
 * Obtener pedido por ID
 * @param {string} id - ID del pedido
 */
export const getOrderById = async (id: string): Promise<{ success: boolean; order: Order }> => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

/**
 * Marcar pedido como entregado (requiere admin)
 * @param {string} id - ID del pedido
 */
export const markAsDelivered = async (id: string): Promise<{ success: boolean; order: Order }> => {
  const { data } = await api.put(`/orders/${id}/deliver`);
  return data;
};
