/**
 * AdminOrders - Order management
 */

import { useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { updateOrderStatus } from '../../services/orderService';

const AdminOrders = () => {
    const { orders, loading, refetch } = useOrders();
    const [updatingId, setUpdatingId] = useState(null);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleStatusChange = async (orderId, field, value) => {
        setUpdatingId(orderId);
        try {
            await updateOrderStatus(orderId, { [field]: value });
            refetch();
        } catch (err) {
            console.error('Error updating order:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div>
            <h1 className="font-brand text-2xl md:text-3xl text-foreground mb-6">Pedidos</h1>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surface-hover border-b border-border">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-foreground-tertiary">Pedido</th>
                                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-foreground-tertiary">Cliente</th>
                                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-foreground-tertiary">Total</th>
                                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-foreground-tertiary">Estado</th>
                                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-foreground-tertiary">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3"><div className="h-8 bg-surface-hover rounded animate-pulse" /></td>
                                        <td className="px-4 py-3"><div className="h-4 w-24 bg-surface-hover rounded animate-pulse" /></td>
                                        <td className="px-4 py-3"><div className="h-4 w-16 bg-surface-hover rounded animate-pulse" /></td>
                                        <td className="px-4 py-3"><div className="h-6 w-20 bg-surface-hover rounded animate-pulse" /></td>
                                        <td className="px-4 py-3"><div className="h-8 w-24 bg-surface-hover rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : orders?.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-surface-hover transition-colors">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm font-mono text-foreground">
                                                    #{order._id.slice(-6).toUpperCase()}
                                                </p>
                                                <p className="text-xs text-foreground-tertiary">
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm text-foreground">{order.user?.name || 'Usuario'}</p>
                                                <p className="text-xs text-foreground-tertiary">{order.user?.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-mono text-foreground">
                                                {formatPrice(order.totalPrice)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`led ${order.isDelivered ? 'led-on' : order.isPaid ? 'led-active' : 'led-off'}`} />
                                                <span className="text-sm text-foreground">
                                                    {order.isDelivered ? 'Entregado' : order.isPaid ? 'Pagado' : 'Pendiente'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {!order.isPaid && (
                                                    <button
                                                        onClick={() => handleStatusChange(order._id, 'isPaid', true)}
                                                        disabled={updatingId === order._id}
                                                        className="px-2 py-1 text-xs font-medium bg-warning-muted text-warning rounded hover:bg-warning/20 transition-colors disabled:opacity-50"
                                                    >
                                                        Marcar pagado
                                                    </button>
                                                )}
                                                {!order.isDelivered && (
                                                    <button
                                                        onClick={() => handleStatusChange(order._id, 'isDelivered', true)}
                                                        disabled={updatingId === order._id}
                                                        className="px-2 py-1 text-xs font-medium bg-success-muted text-success rounded hover:bg-success/20 transition-colors disabled:opacity-50"
                                                    >
                                                        Marcar entregado
                                                    </button>
                                                )}
                                                {order.isDelivered && (
                                                    <span className="text-xs text-foreground-tertiary">Completado</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-foreground-secondary">
                                        No hay pedidos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order details expandable - could add later */}
        </div>
    );
};

export default AdminOrders;
