/**
 * OrderConfirmation Page - Order details and confirmation
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getOrderById } from '../services/orderService';

const OrderConfirmation = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await getOrderById(id);
                setOrder(data.order);
            } catch (err) {
                setError(err.response?.data?.message || 'Error al cargar el pedido');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="container py-12">
                <div className="max-w-2xl mx-auto">
                    <div className="h-8 bg-surface-hover rounded animate-pulse w-1/2 mb-8" />
                    <div className="card p-6 space-y-4">
                        <div className="h-6 bg-surface-hover rounded animate-pulse" />
                        <div className="h-6 bg-surface-hover rounded animate-pulse w-3/4" />
                        <div className="h-6 bg-surface-hover rounded animate-pulse w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container py-12 text-center">
                <p className="text-foreground-secondary mb-4">{error || 'Pedido no encontrado'}</p>
                <Link to="/orders" className="text-primary hover:text-primary-hover transition-colors">
                    ← Volver a mis pedidos
                </Link>
            </div>
        );
    }

    return (
        <div className="py-8 md:py-12">
            <div className="container max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-8"
                >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success-muted flex items-center justify-center">
                        <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="font-brand text-3xl text-foreground mb-2">¡Pedido confirmado!</h1>
                    <p className="text-foreground-secondary">
                        Tu pedido ha sido registrado correctamente
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card p-6 md:p-8"
                >
                    {/* Order ID and date */}
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                        <div>
                            <p className="text-xs font-mono text-foreground-tertiary mb-1">Número de pedido</p>
                            <p className="font-mono font-medium text-foreground">#{order._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-foreground-tertiary mb-1">Fecha</p>
                            <p className="text-sm text-foreground">{formatDate(order.createdAt)}</p>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="mb-6 pb-6 border-b border-border">
                        <p className="text-xs font-mono uppercase tracking-widest text-foreground-tertiary mb-3">Estado</p>
                        <div className="flex items-center gap-3">
                            <span className={`led ${order.isDelivered ? 'led-on' : order.isPaid ? 'led-active' : 'led-off'}`} />
                            <span className="text-foreground">
                                {order.isDelivered ? 'Entregado' : order.isPaid ? 'En camino' : 'Pendiente de envío'}
                            </span>
                        </div>
                    </div>

                    {/* Order items */}
                    <div className="mb-6 pb-6 border-b border-border">
                        <p className="text-xs font-mono uppercase tracking-widest text-foreground-tertiary mb-4">Artículos</p>
                        <ul className="space-y-3">
                            {order.orderItems.map((item, index) => (
                                <li key={index} className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-mono text-foreground-tertiary">{item.quantity}×</span>
                                        <span className="text-sm text-foreground">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-mono text-foreground">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Shipping address */}
                    <div className="mb-6 pb-6 border-b border-border">
                        <p className="text-xs font-mono uppercase tracking-widest text-foreground-tertiary mb-3">Dirección de envío</p>
                        <address className="not-italic text-sm text-foreground-secondary">
                            {order.shippingAddress.address}<br />
                            {order.shippingAddress.postalCode} {order.shippingAddress.city}<br />
                            Tel: {order.shippingAddress.phone}
                        </address>
                    </div>

                    {/* Payment */}
                    <div className="mb-6 pb-6 border-b border-border">
                        <p className="text-xs font-mono uppercase tracking-widest text-foreground-tertiary mb-3">Método de pago</p>
                        <p className="text-sm text-foreground">{order.paymentMethod}</p>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">Total</span>
                        <span className="text-xl font-mono font-medium text-foreground">
                            {formatPrice(order.totalPrice)}
                        </span>
                    </div>
                </motion.div>

                <div className="mt-8 text-center space-y-4">
                    <Link to="/orders" className="btn btn-secondary">
                        Ver todos mis pedidos
                    </Link>
                    <Link to="/products" className="block text-sm text-primary hover:text-primary-hover transition-colors">
                        Seguir comprando →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
