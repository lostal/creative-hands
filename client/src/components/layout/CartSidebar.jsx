/**
 * CartSidebar - Slide-in cart panel
 * 
 * Features:
 * - Slides in from right
 * - Shows cart items with quantity controls
 * - Total price display
 * - Checkout button
 * - Click outside or X to close
 */

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const CartSidebar = () => {
    const {
        cartItems,
        isCartOpen,
        closeCart,
        removeFromCart,
        updateQuantity,
        totalPrice
    } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Lock body scroll when cart is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isCartOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') closeCart();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [closeCart]);

    const handleCheckout = () => {
        closeCart();
        if (user) {
            navigate('/checkout');
        } else {
            navigate('/login?redirect=/checkout');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-modal-backdrop bg-black/50"
                        onClick={closeCart}
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 z-modal h-full w-full max-w-md bg-surface border-l border-border shadow-xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h2 className="text-lg font-medium text-foreground flex items-center gap-3">
                                Carrito
                                <span className="text-xs font-mono bg-surface-hover px-2 py-0.5 rounded-full text-foreground-secondary">
                                    {cartItems.length} {cartItems.length === 1 ? 'artículo' : 'artículos'}
                                </span>
                            </h2>
                            <button
                                onClick={closeCart}
                                className="p-2 -mr-2 rounded-md text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
                                aria-label="Cerrar carrito"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Cart items */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-16 h-16 mb-4 rounded-full bg-surface-hover flex items-center justify-center">
                                        <svg className="w-8 h-8 text-foreground-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-foreground-secondary mb-4">Tu carrito está vacío</p>
                                    <Link
                                        to="/products"
                                        onClick={closeCart}
                                        className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                                    >
                                        Explorar productos →
                                    </Link>
                                </div>
                            ) : (
                                <ul className="space-y-4">
                                    {cartItems.map(({ product, quantity }) => (
                                        <li key={product._id} className="flex gap-4 pb-4 border-b border-border-subtle last:border-0">
                                            {/* Product image */}
                                            <div className="w-20 h-20 flex-shrink-0 bg-background rounded-md overflow-hidden">
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

                                            {/* Product info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-foreground truncate">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm font-mono text-foreground-secondary mt-1">
                                                    {formatPrice(product.price)}
                                                </p>

                                                {/* Quantity controls */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button
                                                        onClick={() => updateQuantity(product._id, quantity - 1)}
                                                        className="w-6 h-6 flex items-center justify-center rounded border border-border text-foreground-secondary hover:border-border-strong hover:text-foreground transition-colors"
                                                        aria-label="Reducir cantidad"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="text-sm font-mono w-6 text-center">{quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(product._id, quantity + 1)}
                                                        className="w-6 h-6 flex items-center justify-center rounded border border-border text-foreground-secondary hover:border-border-strong hover:text-foreground transition-colors"
                                                        aria-label="Aumentar cantidad"
                                                    >
                                                        +
                                                    </button>
                                                    <button
                                                        onClick={() => removeFromCart(product._id)}
                                                        className="ml-auto p-1 text-foreground-tertiary hover:text-error transition-colors"
                                                        aria-label="Eliminar del carrito"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Footer with total and checkout */}
                        {cartItems.length > 0 && (
                            <div className="px-6 py-4 border-t border-border bg-background">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-foreground-secondary">Total</span>
                                    <span className="text-lg font-medium font-mono text-foreground">
                                        {formatPrice(totalPrice)}
                                    </span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className="btn btn-primary w-full"
                                >
                                    Finalizar Compra
                                </button>
                                <button
                                    onClick={closeCart}
                                    className="btn btn-ghost w-full mt-2"
                                >
                                    Seguir Comprando
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartSidebar;
