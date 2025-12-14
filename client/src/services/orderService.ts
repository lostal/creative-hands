/**
 * Servicio de pedidos - Capa de abstracción para llamadas API
 */
import api from "../utils/axios";
import { Order } from "../types";

/**
 * Obtener mis pedidos (usuario actual)
 */
export const getMyOrders = async (): Promise<{
  success: boolean;
  orders: Order[];
}> => {
  const { data } = await api.get("/orders/myorders");
  return data;
};

/**
 * Obtener todos los pedidos (requiere admin)
 */
export const getAllOrders = async (): Promise<{
  success: boolean;
  orders: Order[];
}> => {
  const { data } = await api.get("/orders");
  return data;
};

/**
 * Obtener pedido por ID
 */
export const getOrderById = async (
  id: string,
): Promise<{ success: boolean; order: Order }> => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

/**
 * Marcar pedido como entregado (requiere admin)
 */
export const markAsDelivered = async (
  id: string,
): Promise<{ success: boolean; order: Order }> => {
  const { data } = await api.put(`/orders/${id}/deliver`);
  return data;
};
