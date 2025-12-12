/**
 * MobileMenu - Mobile navigation menu component
 * Extracted from Navbar for better separation of concerns
 */
import { Link } from "react-router";
import { AnimatePresence } from "framer-motion";
import { MotionDiv } from "../../lib/motion";
import {
    Sun,
    Moon,
    User as UserIcon,
    LogOut,
    ShoppingBag,
    Package,
} from "lucide-react";
import type { User } from "../../types";

interface MobileMenuProps {
    isOpen: boolean;
    user: User | null;
    isAdmin: boolean;
    theme: "light" | "dark";
    totalItems: number;
    onClose: () => void;
    onLogout: () => void;
    onToggleTheme: () => void;
    onOpenCart: () => void;
}

const MobileMenu = ({
    isOpen,
    user,
    isAdmin,
    theme,
    totalItems,
    onClose,
    onLogout,
    onToggleTheme,
    onOpenCart,
}: MobileMenuProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <MotionDiv
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden glass border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <div className="px-3 py-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
                        <Link
                            to="/products"
                            onClick={onClose}
                            className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-base font-medium min-h-11"
                        >
                            Productos
                        </Link>

                        {isAdmin && (
                            <Link
                                to="/admin"
                                onClick={onClose}
                                className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-base font-medium min-h-11"
                            >
                                Panel Admin
                            </Link>
                        )}

                        <button
                            onClick={() => {
                                onToggleTheme();
                                onClose();
                            }}
                            className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-2 text-base font-medium min-h-11"
                        >
                            {theme === "light" ? (
                                <Moon className="w-4 h-4" />
                            ) : (
                                <Sun className="w-4 h-4" />
                            )}
                            <span>Cambiar tema</span>
                        </button>

                        {user ? (
                            <>
                                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 mt-2 pt-4">
                                    <p className="text-base font-medium text-gray-900 dark:text-white truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                        {user.email}
                                    </p>
                                </div>
                                <Link
                                    to="/perfil"
                                    onClick={onClose}
                                    className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-2 text-base font-medium min-h-11"
                                >
                                    <UserIcon className="w-5 h-5" />
                                    <span>Perfil</span>
                                </Link>

                                {!isAdmin && (
                                    <Link
                                        to="/my-orders"
                                        onClick={onClose}
                                        className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-2 text-base font-medium min-h-11"
                                    >
                                        <Package className="w-5 h-5" />
                                        <span>Mis Pedidos</span>
                                    </Link>
                                )}

                                {!isAdmin && (
                                    <button
                                        onClick={() => {
                                            onOpenCart();
                                            onClose();
                                        }}
                                        className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-2 text-base font-medium min-h-11 relative"
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                        <span>Carrito</span>
                                        {totalItems > 0 && (
                                            <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                {totalItems}
                                            </span>
                                        )}
                                    </button>
                                )}

                                <button
                                    onClick={onLogout}
                                    className="w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-2 text-base font-medium min-h-11"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Cerrar sesión</span>
                                </button>
                            </>
                        ) : (
                            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                                <Link
                                    to="/login"
                                    onClick={onClose}
                                    className="flex items-center justify-center px-4 py-3 text-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-base font-medium min-h-11"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={onClose}
                                    className="flex items-center justify-center px-4 py-3 text-center bg-linear-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:shadow-lg transition-all text-base font-medium min-h-11"
                                >
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>
                </MotionDiv>
            )}
        </AnimatePresence>
    );
};

export default MobileMenu;
