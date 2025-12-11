/**
 * AdminLayout - Admin panel layout with sidebar
 */

import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const { user } = useAuth();

    const navItems = [
        { to: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', end: true },
        { to: '/admin/products', label: 'Productos', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { to: '/admin/orders', label: 'Pedidos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
        { to: '/admin/chat', label: 'Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Top bar */}
            <header className="sticky top-0 z-sticky bg-surface border-b border-border">
                <div className="flex items-center justify-between px-4 md:px-6 h-14">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="font-brand text-lg tracking-wide text-foreground hover:text-primary transition-colors">
                            CREATIVE HANDS
                        </Link>
                        <span className="px-2 py-0.5 text-xs font-mono bg-primary-muted text-primary rounded">
                            Admin
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-foreground-secondary hidden md:block">{user?.name}</span>
                        <Link to="/" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">
                            Volver a la tienda →
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-16 md:w-56 flex-shrink-0 border-r border-border bg-surface min-h-[calc(100vh-56px)] sticky top-14">
                    <nav className="p-2 md:p-4 space-y-1">
                        {navItems.map(({ to, label, icon, end }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={end}
                                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors
                  ${isActive
                                        ? 'bg-primary-muted text-primary'
                                        : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover'
                                    }
                `}
                            >
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                                </svg>
                                <span className="hidden md:block text-sm font-medium">{label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                {/* Main content */}
                <main className="flex-1 p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
