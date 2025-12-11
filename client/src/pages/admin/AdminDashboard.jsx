/**
 * AdminDashboard - Overview stats and quick actions
 */

import { Link } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../hooks/useOrders';

const AdminDashboard = () => {
    const { products, loading: productsLoading } = useProducts();
    const { orders, loading: ordersLoading } = useOrders();

    const pendingOrders = orders?.filter(o => !o.isDelivered).length || 0;
    const totalRevenue = orders?.reduce((sum, o) => sum + o.totalPrice, 0) || 0;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    };

    const stats = [
        {
            label: 'Productos',
            value: productsLoading ? '...' : products?.length || 0,
            link: '/admin/products',
            icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
        },
        {
            label: 'Pedidos Pendientes',
            value: ordersLoading ? '...' : pendingOrders,
            link: '/admin/orders',
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            highlight: pendingOrders > 0
        },
        {
            label: 'Total Pedidos',
            value: ordersLoading ? '...' : orders?.length || 0,
            link: '/admin/orders',
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
        },
        {
            label: 'Ingresos Totales',
            value: ordersLoading ? '...' : formatPrice(totalRevenue),
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        },
    ];

    return (
        <div>
            <h1 className="font-brand text-2xl md:text-3xl text-foreground mb-6">Dashboard</h1>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        to={stat.link || '#'}
                        className={`card p-4 card-hover ${stat.highlight ? 'border-primary' : ''}`}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-mono uppercase tracking-widest text-foreground-tertiary mb-1">
                                    {stat.label}
                                </p>
                                <p className={`text-2xl font-medium ${stat.highlight ? 'text-primary' : 'text-foreground'}`}>
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`p-2 rounded-md ${stat.highlight ? 'bg-primary-muted' : 'bg-surface-hover'}`}>
                                <svg
                                    className={`w-5 h-5 ${stat.highlight ? 'text-primary' : 'text-foreground-tertiary'}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                                </svg>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                    <h2 className="font-medium text-foreground mb-4">Acciones Rápidas</h2>
                    <div className="space-y-2">
                        <Link
                            to="/admin/products"
                            className="flex items-center gap-3 p-3 rounded-md bg-surface-hover hover:bg-surface-active transition-colors"
                        >
                            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span className="text-sm text-foreground">Añadir nuevo producto</span>
                        </Link>
                        <Link
                            to="/admin/orders"
                            className="flex items-center gap-3 p-3 rounded-md bg-surface-hover hover:bg-surface-active transition-colors"
                        >
                            <svg className="w-5 h-5 text-foreground-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="text-sm text-foreground">Ver pedidos pendientes</span>
                        </Link>
                        <Link
                            to="/admin/chat"
                            className="flex items-center gap-3 p-3 rounded-md bg-surface-hover hover:bg-surface-active transition-colors"
                        >
                            <svg className="w-5 h-5 text-foreground-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-sm text-foreground">Abrir chat</span>
                        </Link>
                    </div>
                </div>

                {/* Recent orders */}
                <div className="card p-6">
                    <h2 className="font-medium text-foreground mb-4">Pedidos Recientes</h2>
                    {ordersLoading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 bg-surface-hover rounded animate-pulse" />
                            ))}
                        </div>
                    ) : orders?.length > 0 ? (
                        <div className="space-y-2">
                            {orders.slice(0, 5).map((order) => (
                                <Link
                                    key={order._id}
                                    to="/admin/orders"
                                    className="flex items-center justify-between p-3 rounded-md bg-surface-hover hover:bg-surface-active transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-mono text-foreground">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </p>
                                        <p className="text-xs text-foreground-tertiary">
                                            {new Date(order.createdAt).toLocaleDateString('es-ES')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-mono text-foreground">
                                            {formatPrice(order.totalPrice)}
                                        </p>
                                        <span className={`text-xs ${order.isDelivered ? 'text-success' : 'text-warning'}`}>
                                            {order.isDelivered ? 'Entregado' : 'Pendiente'}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-foreground-secondary">No hay pedidos aún</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
