import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SocketProvider } from "./context/SocketContext";
import ErrorBoundary from "./components/ErrorBoundary";
import GrainOverlay from "./components/effects/GrainOverlay";
import SmoothScroll from "./components/effects/SmoothScroll";
import ScrollToTop from "./components/effects/ScrollToTop";
import MainLayout from "./components/layout/MainLayout";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import OrderConfirmation from "./pages/OrderConfirmation";
import About from "./pages/About";
import PrivacyTerms from "./pages/PrivacyTerms";
import ShippingReturns from "./pages/ShippingReturns";

// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminChat from "./pages/admin/AdminChat";

// Route Protection
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <ThemeProvider>
                    <AuthProvider>
                        <SocketProvider>
                            <SmoothScroll>
                                {/* Scroll to top on route change */}
                                <ScrollToTop />

                                {/* Film grain overlay */}
                                <GrainOverlay />

                                <Routes>
                                    {/* Public routes with main layout */}
                                    <Route element={<MainLayout />}>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/products" element={<Products />} />
                                        <Route path="/products/:id" element={<ProductDetail />} />
                                        <Route path="/cart" element={<Cart />} />
                                        <Route path="/about" element={<About />} />
                                        <Route path="/privacy" element={<PrivacyTerms />} />
                                        <Route path="/shipping" element={<ShippingReturns />} />

                                        {/* Auth routes */}
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/register" element={<Register />} />

                                        {/* Protected user routes */}
                                        <Route element={<ProtectedRoute />}>
                                            <Route path="/checkout" element={<Checkout />} />
                                            <Route path="/profile" element={<Profile />} />
                                            <Route path="/orders" element={<MyOrders />} />
                                            <Route path="/orders/:id" element={<OrderConfirmation />} />
                                        </Route>
                                    </Route>

                                    {/* Admin routes with admin layout */}
                                    <Route element={<AdminRoute />}>
                                        <Route path="/admin" element={<AdminLayout />}>
                                            <Route index element={<AdminDashboard />} />
                                            <Route path="products" element={<AdminProducts />} />
                                            <Route path="orders" element={<AdminOrders />} />
                                            <Route path="chat" element={<AdminChat />} />
                                        </Route>
                                    </Route>
                                </Routes>
                            </SmoothScroll>
                        </SocketProvider>
                    </AuthProvider>
                </ThemeProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
