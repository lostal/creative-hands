/**
 * Checkout Page - Shipping form and order confirmation
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, totalPrice, clearCart } = useCart();

    const [formData, setFormData] = useState({
        address: '',
        city: '',
        postalCode: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const orderData = {
                orderItems: cartItems.map(({ product, quantity }) => ({
                    name: product.name,
                    quantity,
                    price: product.price,
                    product: product._id,
                })),
                shippingAddress: {
                    address: formData.address,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    phone: formData.phone,
                },
                paymentMethod: 'Contrarreembolso',
                totalPrice,
            };

            const data = await createOrder(orderData);
            clearCart();
            navigate(`/orders/${data.order._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al crear el pedido');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="py-8 md:py-12">
            <div className="container max-w-4xl">
                <h1 className="font-brand text-3xl md:text-4xl text-foreground mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Shipping form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3"
                    >
                        <div className="card p-6">
                            <h2 className="text-lg font-medium text-foreground mb-6">Dirección de envío</h2>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <div className="p-3 bg-error-muted border border-error/20 rounded-md">
                                        <p className="text-sm text-error">{error}</p>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
                                        Dirección
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="Calle, número, piso..."
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
                                            Ciudad
                                        </label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="Madrid"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="postalCode" className="block text-sm font-medium text-foreground mb-2">
                                            Código Postal
                                        </label>
                                        <input
                                            type="text"
                                            id="postalCode"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="28001"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="+34 600 000 000"
                                        required
                                    />
                                </div>

                                {/* Payment method */}
                                <div className="pt-4 border-t border-border">
                                    <h3 className="text-sm font-medium text-foreground mb-3">Método de pago</h3>
                                    <div className="flex items-center gap-3 p-3 bg-surface-hover border border-border rounded-md">
                                        <span className="led led-on" />
                                        <span className="text-sm text-foreground">Contrarreembolso</span>
                                        <span className="text-xs text-foreground-tertiary ml-auto">Único método disponible</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary w-full mt-6"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Procesando...
                                        </span>
                                    ) : (
                                        `Confirmar pedido · ${formatPrice(totalPrice)}`
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>

                    {/* Order summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2"
                    >
                        <div className="card p-6 sticky top-24">
                            <h2 className="text-lg font-medium text-foreground mb-4">Tu pedido</h2>

                            <ul className="space-y-3 mb-6">
                                {cartItems.map(({ product, quantity }) => (
                                    <li key={product._id} className="flex gap-3">
                                        <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-background">
                                            {product.images?.[0] ? (
                                                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-surface-hover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-foreground truncate">{product.name}</p>
                                            <p className="text-xs text-foreground-tertiary">Cant: {quantity}</p>
                                        </div>
                                        <p className="text-sm font-mono text-foreground">
                                            {formatPrice(product.price * quantity)}
                                        </p>
                                    </li>
                                ))}
                            </ul>

                            <div className="border-t border-border pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-foreground-secondary">Subtotal</span>
                                    <span className="font-mono">{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-foreground-secondary">Envío</span>
                                    <span className="text-foreground-tertiary">Gratis</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-border-subtle">
                                    <span className="font-medium">Total</span>
                                    <span className="font-mono font-medium">{formatPrice(totalPrice)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
