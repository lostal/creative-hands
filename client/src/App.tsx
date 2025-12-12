import { Suspense, lazy, ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SocketProvider } from "./context/SocketContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import useLenis from "./hooks/useLenis";
import ErrorBoundary from "./components/ErrorBoundary";
import { PublicLayout } from "./layouts";
import { Loader } from "lucide-react";

// Lazy loading de páginas para reducir bundle inicial
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Products = lazy(() => import("./pages/Products"));
const About = lazy(() => import("./pages/About"));
const Perfil = lazy(() => import("./pages/Perfil"));
const ShippingReturns = lazy(() => import("./pages/ShippingReturns"));
const PrivacyTerms = lazy(() => import("./pages/PrivacyTerms"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Admin = lazy(() => import("./pages/Admin"));
const ChatWidget = lazy(() => import("./components/ChatWidget"));

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  excludeAdmin?: boolean;
}

// Protected Route Component
const ProtectedRoute = ({
  children,
  adminOnly = false,
  excludeAdmin = false,
}: ProtectedRouteProps) => {
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

  // Inicializar Lenis smooth scroll
  useLenis();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-light-500 via-primary-50 to-light-500 dark:from-dark-500 dark:via-dark-400 dark:to-dark-600">
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
      <Navbar />
      <CartDrawer />
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <Loader className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
          }
        >
          <Routes>
            {/* Public pages with Footer */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <Home />
                </PublicLayout>
              }
            />
            <Route
              path="/about"
              element={
                <PublicLayout>
                  <About />
                </PublicLayout>
              }
            />
            <Route
              path="/envios"
              element={
                <PublicLayout>
                  <ShippingReturns />
                </PublicLayout>
              }
            />
            <Route
              path="/privacidad"
              element={
                <PublicLayout>
                  <PrivacyTerms />
                </PublicLayout>
              }
            />
            <Route
              path="/cart"
              element={
                <PublicLayout>
                  <Cart />
                </PublicLayout>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute excludeAdmin>{<Checkout />}</ProtectedRoute>
              }
            />
            <Route
              path="/order-confirmation"
              element={
                <ProtectedRoute excludeAdmin>
                  {<OrderConfirmation />}
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute excludeAdmin>{<MyOrders />}</ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={<ProtectedRoute>{<Perfil />}</ProtectedRoute>}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/products/category/:slug"
              element={
                <PublicLayout>
                  <Products />
                </PublicLayout>
              }
            />
            <Route
              path="/products"
              element={
                <PublicLayout>
                  <Products />
                </PublicLayout>
              }
            />
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
        </Suspense>
      </ErrorBoundary>
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
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
              <ToastProvider>
                <AppContent />
              </ToastProvider>
            </SocketProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
