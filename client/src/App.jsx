import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SocketProvider } from "./context/SocketContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import NoiseOverlay from "./components/NoiseOverlay";
import useLenis from "./hooks/useLenis";
const ChatWidget = lazy(() => import("./components/ChatWidget"));
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import About from "./pages/About";
import Perfil from "./pages/Perfil";
import ShippingReturns from "./pages/ShippingReturns";
import PrivacyTerms from "./pages/PrivacyTerms";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderConfirmation from "./pages/OrderConfirmation";
import Footer from "./components/Footer";
const Admin = lazy(() => import("./pages/Admin"));
import { Loader } from "lucide-react";

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false, excludeAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/products" replace />;
  }

  if (excludeAdmin && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

function AppContent() {
  const { loading } = useAuth();
  const location = useLocation();

  // Inicializar Lenis smooth scroll
  useLenis();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-light-500 via-primary-50 to-light-500 dark:from-dark-500 dark:via-dark-400 dark:to-dark-600">
        <div className="text-center">
          <Loader className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Cargando Creative Hands...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-500 dark:bg-dark-500 transition-colors duration-300">
      <NoiseOverlay />
      <Navbar />
      <CartDrawer />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/envios" element={<ShippingReturns />} />
          <Route path="/privacidad" element={<PrivacyTerms />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<ProtectedRoute excludeAdmin>{<Checkout />}</ProtectedRoute>} />
          <Route path="/order-confirmation" element={<ProtectedRoute excludeAdmin>{<OrderConfirmation />}</ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute excludeAdmin>{<MyOrders />}</ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute>{<Perfil />}</ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products/category/:slug" element={<Products />} />
          <Route path="/products" element={<Products />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Suspense fallback={<div />}>
                  <Admin />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
      {/* Mostrar footer sólo en las páginas de contenido/publicas especificadas */}
      {(location.pathname === '/' || location.pathname.startsWith('/products') || ['/about', '/envios', '/privacidad', '/cart'].includes(location.pathname)) && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <SocketProvider>
              <AppContent />
            </SocketProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
