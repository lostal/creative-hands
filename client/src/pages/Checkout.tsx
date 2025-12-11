import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";
import { getApiErrorMessage } from "../utils/errors";
import logger from "../utils/logger";
import { ArrowLeft, Loader } from "lucide-react";
import { MotionDiv } from "../lib/motion";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart, openCart } = useCart();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Si es admin, redirigir al admin panel
  useEffect(() => {
    if (isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [isAdmin, navigate]);

  const [formData, setFormData] = useState({
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validar formulario
      if (
        !formData.address ||
        !formData.city ||
        !formData.postalCode ||
        !formData.phone
      ) {
        setError("Por favor, completa todos los campos");
        setLoading(false);
        return;
      }

      // Preparar orderItems
      const orderItems = cartItems.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      }));

      // Hacer petición POST
      const { data } = await api.post("/orders", {
        orderItems,
        shippingAddress: formData,
      });

      if (data.success) {
        // Limpiar carrito
        clearCart();

        // Redirigir a página de confirmación
        navigate("/order-confirmation", {
          state: { order: data.order },
        });
      }
    } catch (err: unknown) {
      logger.error("Error al crear pedido:", err);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 bg-light-500 dark:bg-dark-500">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Tu carrito está vacío
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Añade productos antes de proceder al checkout
          </p>
          <button
            onClick={() => openCart()}
            className="inline-block px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
          >
            Volver al carrito
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-light-500 dark:bg-dark-500">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => openCart()}
            className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al carrito</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Dirección de envío
              </h2>

              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.name || ""}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Ej: Calle Principal 123, Apartamento 4"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Ej: Madrid"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="Ej: 28001"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ej: +34 612 345 678"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Método de pago */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Método de pago
                  </h3>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="payment-method"
                        name="paymentMethod"
                        value="Contrarreembolso"
                        checked
                        readOnly
                        className="w-4 h-4 text-primary-500"
                      />
                      <label
                        htmlFor="payment-method"
                        className="ml-3 text-gray-900 dark:text-white font-medium"
                      >
                        Contrarreembolso
                      </label>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-7">
                      Paga cuando recibas tu pedido. Sin comisión adicional.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <span>Confirmar Pedido</span>
                  )}
                </button>
              </form>
            </MotionDiv>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-24"
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Resumen
              </h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                {cartItems.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex justify-between text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span>
                      {item.product.name}
                      <span className="text-gray-500 dark:text-gray-400 ml-1">
                        x{item.quantity}
                      </span>
                    </span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      }).format(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Subtotal:</span>
                  <span>
                    {new Intl.NumberFormat("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    }).format(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Envío:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Gratis
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-700 dark:text-gray-300">
                    Total:
                  </span>
                  <span className="text-2xl font-bold text-primary-500">
                    {new Intl.NumberFormat("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    }).format(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <span className="font-semibold">Nota:</span> El pago se
                  realizará contra reembolso a la entrega.
                </p>
              </div>
            </MotionDiv>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
