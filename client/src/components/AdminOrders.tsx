import { useState, useEffect } from "react";
import api from "../utils/axios";
import { getApiErrorMessage } from "../utils/errors";
import logger from "../utils/logger";
import {
  Loader,
  CheckCircle2,
  Clock,
  MapPin,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { MotionDiv } from "../lib/motion";
import { Order } from "../types";

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [delivering, setDelivering] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/orders");
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err: unknown) {
      logger.error("Error al cargar pedidos:", err);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDelivered = async (orderId: string) => {
    try {
      setDelivering(orderId);
      const { data } = await api.put(`/orders/${orderId}/deliver`);
      if (data.success) {
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, isDelivered: true } : order,
          ),
        );
      }
    } catch (err: unknown) {
      logger.error("Error al marcar como entregado:", err);
      setError(getApiErrorMessage(err));
    } finally {
      setDelivering(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No hay pedidos aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <MotionDiv
          key={order._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
        >
          {/* Header del pedido */}
          <button
            onClick={() =>
              setExpandedOrder(expandedOrder === order._id ? null : order._id)
            }
            className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pedido
                  </p>
                  <p className="font-mono text-gray-900 dark:text-white font-semibold">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Cliente
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {typeof order.user === 'object' ? order.user.name : 'Usuario'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {typeof order.user === 'object' ? order.user.email : ''}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total
                  </p>
                  <p className="text-lg font-bold text-primary-500">
                    {new Intl.NumberFormat("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    }).format(order.totalPrice)}
                  </p>
                </div>

                <div className="flex gap-2 ml-auto">
                  {order.isDelivered ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Entregado
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      En preparación
                    </span>
                  )}
                </div>
              </div>
            </div>

            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedOrder === order._id ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* Detalles del pedido (expandible) */}
          <AnimatePresence>
            {expandedOrder === order._id && (
              <MotionDiv
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700/50"
              >
                {/* Items del pedido */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Productos
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {order.orderItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 p-3 rounded"
                      >
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {item.name}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">
                            Cantidad: {item.quantity} × €{item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-gray-900 dark:text-white font-semibold">
                          {new Intl.NumberFormat("es-ES", {
                            style: "currency",
                            currency: "EUR",
                          }).format(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dirección de envío */}
                <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Dirección de envío
                  </h3>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 bg-white dark:bg-gray-800 p-3 rounded">
                    <p className="font-medium">
                      {order.shippingAddress.address}
                    </p>
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p>Teléfono: {order.shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Resumen financiero */}
                <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Total:
                    </span>
                    <span className="text-lg font-bold text-primary-500">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      }).format(order.totalPrice)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Método de pago: {order.paymentMethod}</span>
                  </div>
                </div>

                {/* Acciones */}
                {!order.isDelivered && (
                  <button
                    onClick={() => handleMarkAsDelivered(order._id)}
                    disabled={delivering === order._id}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {delivering === order._id ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Marcar como Entregado</span>
                      </>
                    )}
                  </button>
                )}

                {order.isDelivered && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Este pedido fue entregado el{" "}
                      {new Date(order.updatedAt || "").toLocaleDateString("es-ES")}
                    </p>
                  </div>
                )}
              </MotionDiv>
            )}
          </AnimatePresence>
        </MotionDiv>
      ))}
    </div>
  );
};

export default AdminOrders;
