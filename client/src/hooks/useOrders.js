/**
 * Custom hook para gestión de pedidos del usuario
 */
import { useState, useEffect, useCallback } from "react";
import * as orderService from "../services/orderService";

/**
 * Hook para obtener los pedidos del usuario actual
 */
export const useMyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await orderService.getMyOrders();
            setOrders(data.orders || []);
        } catch (err) {
            setError(err.response?.data?.message || "Error al cargar pedidos");
            console.error("Error fetching orders:", err);
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

/**
 * Hook para obtener un pedido específico
 * @param {string} orderId - ID del pedido
 */
export const useOrder = (orderId) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrder = useCallback(async () => {
        if (!orderId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await orderService.getOrderById(orderId);
            setOrder(data.order);
        } catch (err) {
            setError(err.response?.data?.message || "Error al cargar pedido");
            console.error("Error fetching order:", err);
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
