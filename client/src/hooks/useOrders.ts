/**
 * Custom hook para gestión de pedidos del usuario
 */
import { useState, useEffect, useCallback } from "react";
import * as orderService from "../services/orderService";
import { Order } from "../types";
import { getApiErrorMessage } from "../utils/errors";
import logger from "../utils/logger";

interface UseMyOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener los pedidos del usuario actual
 */
export const useMyOrders = (): UseMyOrdersReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getMyOrders();
      setOrders(data.orders || []);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
      logger.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  };
};

interface UseOrderReturn {
  order: Order | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener un pedido específico
 * @param {string} orderId - ID del pedido
 */
export const useOrder = (orderId: string): UseOrderReturn => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrderById(orderId);
      setOrder(data.order);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
      logger.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
  };
};

export default useMyOrders;
