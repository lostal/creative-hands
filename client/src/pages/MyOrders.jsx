/**
 * MyOrders Page - List of user orders
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOrders } from '../hooks/useOrders';

const MyOrders = () => {
    const { orders, loading } = useOrders();

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
        });
    };

    const getStatusBadge = (order) => {
        if (order.isDelivered) {
            return <span className="badge badge-success"><span className="led led-on" />Entregado</span>;
        }
        if (order.isPaid) {
            return <span className="badge badge-primary"><span className="led led-active" />En camino</span>;
        }
        return <span className="badge badge-default"><span className="led led-off" />Pendiente</span>;
    };

    if (loading) {
        return (
            <div className="container py-12">
                <h1 className="font-brand text-3xl md:text-4xl text-foreground mb-8">Mis Pedidos</h1>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-surface-hover rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 md:py-12">
            <div className="container max-w-4xl">
                <h1 className="font-brand text-3xl md:text-4xl text-foreground mb-8">Mis Pedidos</h1>

                {orders?.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-foreground-secondary mb-4">Aún no has realizado ningún pedido</p>
                        <Link to="/products" className="btn btn-primary">
                            Explorar productos
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders?.map((order, index) => (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    to={`/orders/${order._id}`}
                                    className="block card p-4 md:p-6 card-hover"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-mono text-foreground-tertiary">
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </span>
                                                {getStatusBadge(order)}
                                            </div>
                                            <p className="text-sm text-foreground-secondary">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex -space-x-2">
                                                {order.orderItems.slice(0, 3).map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-10 h-10 rounded-md border-2 border-background overflow-hidden bg-surface-hover"
                                                    >
                                                        {item.image ? (
                                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                        ) : null}
                                                    </div>
                                                ))}
                                                {order.orderItems.length > 3 && (
                                                    <div className="w-10 h-10 rounded-md border-2 border-background bg-surface-hover flex items-center justify-center">
                                                        <span className="text-xs text-foreground-tertiary">
                                                            +{order.orderItems.length - 3}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-right">
                                                <p className="font-mono font-medium text-foreground">
                                                    {formatPrice(order.totalPrice)}
                                                </p>
                                                <p className="text-xs text-foreground-tertiary">
                                                    {order.orderItems.length} {order.orderItems.length === 1 ? 'artículo' : 'artículos'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
