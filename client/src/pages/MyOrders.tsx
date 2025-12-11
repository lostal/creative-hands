import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/errors";
import {
  Loader,
  ShoppingBag,
  Calendar,
  MapPin,
} from "lucide-react";
import { MotionDiv } from "../lib/motion";
import { Order } from "../types";

const MyOrders = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Si es admin, redirigir al admin panel
  useEffect(() => {
    if (isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<{ success: boolean; orders: Order[] }>("/orders/myorders");
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err: unknown) {
        console.error("Error al cargar pedidos:", err);
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 bg-light-500 dark:bg-dark-500">
        <div className="max-w-4xl mx-auto flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 bg-light-500 dark:bg-dark-500">
        <div className="max-w-4xl mx-auto">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 bg-light-500 dark:bg-dark-500">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mis Pedidos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Aquí verás tus pedidos
          </p>

          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Aún no has realizado pedidos
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Comienza a comprar y tus pedidos aparecerán aquí
            </p>
            <button
              onClick={() => navigate("/products")}
              className="inline-block px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Ver productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-light-500 dark:bg-dark-500">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mis Pedidos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {orders.length} pedido{orders.length !== 1 ? "s" : ""}
        </p>

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
                  setExpandedOrder(
                    expandedOrder === order._id ? null : order._id,
                  )
                }
                className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
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

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                      <div className="text-right">
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

                      <div className="flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${order.isDelivered
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                            }`}
                        >
                          {order.isDelivered ? "Entregado" : "En preparación"}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                          {order.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Detalles del pedido (expandible) */}
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
                    <div className="space-y-2">
                      {order.orderItems.map((item) => (
                        <div
                          key={item._id}
                          className="flex justify-between items-center text-sm"
                        >
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {item.name}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs">
                              Cantidad: {item.quantity}
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
                    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <p>{order.shippingAddress.address}</p>
                      <p>
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p>Teléfono: {order.shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Resumen financiero */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-700 dark:text-gray-300">
                      Total:
                    </span>
                    <span className="text-lg font-bold text-primary-500">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      }).format(order.totalPrice)}
                    </span>
                  </div>
                </MotionDiv>
              )}
            </MotionDiv>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
