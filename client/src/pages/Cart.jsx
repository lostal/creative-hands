/**
 * Cart Page - Full page cart view
 */

import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    const handleCheckout = () => {
        if (user) {
            navigate('/checkout');
        } else {
            navigate('/login?redirect=/checkout');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container py-12">
                <div className="text-center py-20">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-hover flex items-center justify-center">
                        <svg className="w-10 h-10 text-foreground-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </div>
                    <h1 className="font-brand text-2xl text-foreground mb-4">Tu carrito está vacío</h1>
                    <p className="text-foreground-secondary mb-6">Explora nuestra colección y encuentra algo especial</p>
                    <Link to="/products" className="btn btn-primary">
                        Ver productos
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 md:py-12">
            <div className="container">
                <h1 className="font-brand text-3xl md:text-4xl text-foreground mb-8">Carrito</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Cart items */}
                    <div className="lg:col-span-2">
                        <div className="space-y-4">
                            {cartItems.map(({ product, quantity }, index) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex gap-4 p-4 bg-surface border border-border rounded-lg"
                                >
                                    {/* Product image */}
                                    <Link to={`/products/${product._id}`} className="flex-shrink-0">
                                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-md overflow-hidden bg-background">
                                            {product.images?.[0] ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-surface-hover">
                                                    <span className="text-foreground-tertiary text-xs">Sin imagen</span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Product info */}
                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <Link
                                            to={`/products/${product._id}`}
                                            className="text-foreground font-medium hover:text-primary transition-colors line-clamp-1"
                                        >
                                            {product.name}
                                        </Link>

                                        <p className="text-lg font-mono text-foreground mt-1">
                                            {formatPrice(product.price)}
                                        </p>

                                        <div className="flex items-center justify-between mt-auto pt-3">
                                            {/* Quantity controls */}
                                            <div className="flex items-center border border-border rounded-md">
                                                <button
                                                    onClick={() => updateQuantity(product._id, quantity - 1)}
                                                    className="px-3 py-1.5 text-foreground-secondary hover:text-foreground transition-colors"
                                                >
                                                    −
                                                </button>
                                                <span className="px-3 py-1.5 font-mono text-sm">{quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(product._id, quantity + 1)}
                                                    className="px-3 py-1.5 text-foreground-secondary hover:text-foreground transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Remove button */}
                                            <button
                                                onClick={() => removeFromCart(product._id)}
                                                className="text-foreground-tertiary hover:text-error transition-colors p-2"
                                                aria-label="Eliminar"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Clear cart */}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={clearCart}
                                className="text-sm text-foreground-tertiary hover:text-error transition-colors"
                            >
                                Vaciar carrito
                            </button>
                        </div>
                    </div>

                    {/* Order summary */}
                    <div className="lg:col-span-1">
                        <div className="card p-6 sticky top-24">
                            <h2 className="text-lg font-medium text-foreground mb-4">Resumen</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-foreground-secondary">Subtotal</span>
                                    <span className="font-mono text-foreground">{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-foreground-secondary">Envío</span>
                                    <span className="text-foreground-tertiary">Calculado en checkout</span>
                                </div>
                            </div>

                            <div className="border-t border-border pt-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="font-medium text-foreground">Total</span>
                                    <span className="text-xl font-mono font-medium text-foreground">
                                        {formatPrice(totalPrice)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="btn btn-primary w-full"
                            >
                                Finalizar compra
                            </button>

                            <Link
                                to="/products"
                                className="btn btn-ghost w-full mt-2"
                            >
                                Seguir comprando
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
