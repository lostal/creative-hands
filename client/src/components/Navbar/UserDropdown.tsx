/**
 * UserDropdown - Desktop user menu component
 * Extracted from Navbar for better separation of concerns
 */
import { Link } from "react-router";
import { AnimatePresence } from "framer-motion";
import { MotionButton, MotionDiv } from "../../lib/motion";
import { User as UserIcon, LogOut, Package } from "lucide-react";
import type { User } from "../../types";

interface UserDropdownProps {
    user: User;
    isAdmin: boolean;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    onLogout: () => void;
}

const UserDropdown = ({
    user,
    isAdmin,
    isOpen,
    onToggle,
    onClose,
    onLogout,
}: UserDropdownProps) => {
    return (
        <div className="relative">
            <MotionButton
                whileTap={{ scale: 0.95 }}
                onClick={onToggle}
                className="flex items-start space-x-2 px-2 py-2 rounded-full glass hover:shadow-lg transition-all"
            >
                <div className="w-7 h-7 shrink-0 rounded-full bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center overflow-hidden">
                    <span className="text-white text-sm font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="flex items-center h-7">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                    </span>
                </div>
            </MotionButton>

            <AnimatePresence>
                {isOpen && (
                    <MotionDiv
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 glass rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="py-1">
                            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {user.email}
                                </p>
                                <p className="text-xs text-primary-500 font-medium mt-1">
                                    {user.role === "admin" ? "Administrador" : "Usuario"}
                                </p>
                            </div>
                            <Link
                                to="/perfil"
                                onClick={onClose}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2"
                            >
                                <UserIcon className="w-4 h-4" />
                                <span>Perfil</span>
                            </Link>

                            {!isAdmin && (
                                <Link
                                    to="/my-orders"
                                    onClick={onClose}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2"
                                >
                                    <Package className="w-4 h-4" />
                                    <span>Mis Pedidos</span>
                                </Link>
                            )}

                            <button
                                onClick={onLogout}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Cerrar sesión</span>
                            </button>
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserDropdown;
