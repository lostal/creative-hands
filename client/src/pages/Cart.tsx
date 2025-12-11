import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "../utils/formatters";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Cast motion.div to any
  const MotionDiv = motion.div as any;

  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 bg-light-500 dark:bg-dark-500">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Tu carrito está vacío
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Añade algunos productos para comenzar
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-light-500 dark:bg-dark-500">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/products"
            className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a productos</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mi Carrito
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {cartItems.length} producto{cartItems.length !== 1 ? "s" : ""} en el
            carrito
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Carrito Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <MotionDiv
                key={item.product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex gap-4"
              >
                {/* Imagen */}
                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={item.product.images?.[0] || "/placeholder.png"}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Detalles */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {item.product.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Precio unitario:{" "}
                    <span className="font-medium">
                      {formatCurrency(item.product.price)}
                    </span>
                  </p>

                  {/* Cantidad */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product._id,
                          Math.max(1, item.quantity - 1),
                        )
                      }
                      disabled={item.quantity <= 1}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="px-4 font-semibold text-gray-900 dark:text-white min-w-[3rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product._id,
                          Math.min(item.product.stock ?? 999, item.quantity + 1),
                        )
                      }
                      disabled={item.quantity >= (item.product.stock ?? 999)}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Precio y botón eliminar */}
                <div className="text-right flex flex-col items-end justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Subtotal
                    </p>
                    <p className="text-xl font-bold text-primary-500">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product._id)}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    aria-label="Eliminar del carrito"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </MotionDiv>
            ))}
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Resumen del pedido
              </h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Envío:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Gratis
                  </span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Impuestos:</span>
                  <span>Calculados al checkout</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-700 dark:text-gray-300">
                    Total:
                  </span>
                  <span className="text-2xl font-bold text-primary-500">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full font-semibold hover:shadow-lg transition-all mb-3"
              >
                {user ? "Proceder al pago" : "Iniciar sesión para continuar"}
              </button>

              <button
                onClick={() => navigate("/products")}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-3"
              >
                Continuar comprando
              </button>

              <button
                onClick={clearCart}
                className="w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full font-medium transition-colors text-sm"
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
