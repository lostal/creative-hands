import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle2,
  Package,
  MapPin,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { MotionDiv } from "../lib/motion";
import { Order } from "../types";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);

  // Si es admin, redirigir al admin panel
  useEffect(() => {
    if (isAdmin) {
      navigate("/admin", { replace: true });
      return;
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order);
    } else {
      // Si no hay orden en state, redirigir a mis-pedidos
      navigate("/my-orders");
    }
  }, [location, navigate]);

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-light-500 dark:bg-dark-500">
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <MotionDiv
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center mb-8"
        >
          <MotionDiv
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-4"
          >
            <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
          </MotionDiv>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Pedido Confirmado!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Tu pedido ha sido procesado exitosamente
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">
              Pedido #{order._id.slice(-8).toUpperCase()}
            </p>
          </div>
        </MotionDiv>

        {/* Order Details */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Productos
          </h2>

          <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
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

          <div className="flex justify-between items-baseline">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Total del pedido:
            </span>
            <span className="text-2xl font-bold text-primary-500">
              {new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
              }).format(order.totalPrice)}
            </span>
          </div>
        </MotionDiv>

        {/* Shipping Address */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Dirección de envío
          </h2>

          <div className="text-gray-700 dark:text-gray-300 space-y-2">
            <p>{order.shippingAddress.address}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            </p>
            <p>Teléfono: {order.shippingAddress.phone}</p>
          </div>
        </MotionDiv>

        {/* Payment Method */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-yellow-900 dark:text-yellow-200 mb-2 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Método de Pago
          </h2>
          <p className="text-yellow-800 dark:text-yellow-300">
            <span className="font-semibold">{order.paymentMethod}</span>
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-2">
            El pago será realizado contra reembolso a la entrega. Asegúrate de
            tener el dinero disponible.
          </p>
        </MotionDiv>

        {/* What's Next */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-3">
            Próximos Pasos
          </h2>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>Recibirás un correo de confirmación en breve</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>Tu pedido será preparado en nuestras instalaciones</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>
                El transportista se pondrá en contacto para coordinar la entrega
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>Realiza el pago contra reembolso a la entrega</span>
            </li>
          </ul>
        </MotionDiv>

        {/* CTA Buttons */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => navigate("/my-orders")}
            className="flex-1 px-6 py-3 bg-linear-to-r from-primary-500 to-primary-600 text-white rounded-full font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Ver Mis Pedidos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/products")}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Continuar Comprando
          </button>
        </MotionDiv>
      </div>
    </div>
  );
};

export default OrderConfirmation;

