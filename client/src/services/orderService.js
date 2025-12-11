/**
 * Servicio de pedidos - Capa de abstracción para llamadas API
 */
import api from "../utils/axios";

/**
 * Crear nuevo pedido
 * @param {Object} orderData - {orderItems, shippingAddress}
 * @returns {Promise<{success: boolean, order: Object}>}
 */
export const createOrder = async (orderData) => {
    const { data } = await api.post("/orders", orderData);
    return data;
};

/**
 * Obtener mis pedidos (usuario actual)
 * @returns {Promise<{success: boolean, orders: Array}>}
 */
export const getMyOrders = async () => {
    const { data } = await api.get("/orders/myorders");
    return data;
};

/**
 * Obtener todos los pedidos (requiere admin)
 * @returns {Promise<{success: boolean, orders: Array}>}
 */
export const getAllOrders = async () => {
    const { data } = await api.get("/orders");
    return data;
};

/**
 * Obtener pedido por ID
 * @param {string} id - ID del pedido
 * @returns {Promise<{success: boolean, order: Object}>}
 */
export const getOrderById = async (id) => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
};

/**
 * Marcar pedido como entregado (requiere admin)
 * @param {string} id - ID del pedido
 * @returns {Promise<{success: boolean, order: Object}>}
 */
export const markAsDelivered = async (id) => {
    const { data } = await api.put(`/orders/${id}/deliver`);
    return data;
};
