import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { X, Trash2 } from "lucide-react";

const CartDrawer = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    totalPrice,
    isCartOpen,
    closeCart,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate("/checkout");
  };

  return (
    <Fragment>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity ${isCartOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
        aria-hidden={!isCartOpen}
        onClick={closeCart}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-96 transform bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 flex flex-col ${isCartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        aria-hidden={!isCartOpen}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Tu carrito
          </h3>
          <button
            onClick={closeCart}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400 py-8">
              Tu carrito está vacío
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.product._id} className="flex gap-3 items-center">
                <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  <img
                    src={item.product.images?.[0] || "/placeholder.png"}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {new Intl.NumberFormat("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    }).format(item.product.price)}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product._id,
                          Math.max(1, item.quantity - 1),
                        )
                      }
                      className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                    >
                      -
                    </button>
                    <span className="px-3 text-sm font-medium">
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
                      className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Total
            </span>
            <span className="text-lg font-bold text-primary-500">
              {new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
              }).format(totalPrice)}
            </span>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              Proceder al pago
            </button>

            <button
              onClick={() => {
                closeCart();
                navigate("/products");
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
      </aside>
    </Fragment>
  );
};

export default CartDrawer;
