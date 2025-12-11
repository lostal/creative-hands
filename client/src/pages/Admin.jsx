import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquare, Package, Loader, ShoppingCart } from "lucide-react";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import AdminChat from "../components/AdminChat";
import AdminOrders from "../components/AdminOrders";
import {
  ProductFormModal,
  CategoryModal,
  CategoryEditModal,
} from "../components/admin";

/**
 * Panel de administración
 * Refactorizado para usar componentes modularizados
 */
const Admin = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Estado de navegación
  const [activeTab, setActiveTab] = useState("products");

  // Estado de productos
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Estado de categorías
  const [categoriesList, setCategoriesList] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingFromList, setEditingFromList] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/products");
      return;
    }
    fetchProducts();
    fetchCategories();
  }, [isAdmin, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/products");
      setProducts(data.products);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/api/categories");
      setCategoriesList(data.categories || []);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      // Categorías por defecto como fallback
      setCategoriesList([
        { _id: "", name: "Joyería artesanal", slug: "joyeria-artesanal" },
        { _id: "", name: "Velas y aromáticos", slug: "velas-y-aromaticos" },
        { _id: "", name: "Textiles y ropa", slug: "textiles-y-ropa" },
        { _id: "", name: "Cerámica y arcilla", slug: "ceramica-y-arcilla" },
        { _id: "", name: "Arte hecho a mano", slug: "arte-hecho-a-mano" },
      ]);
    }
  };

  // Handlers de productos
  const handleOpenProductModal = (product = null) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleProductSaved = (product, action) => {
    if (action === "create") {
      setProducts([product, ...products]);
    } else {
      setProducts(products.map((p) => (p._id === product._id ? product : p)));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      await api.delete(`/api/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error al eliminar el producto");
    }
  };

  // Handlers de categorías
  const handleOpenCategoryModal = () => {
    setShowCategoryModal(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    // Si el modal de lista está abierto, cerrarlo primero
    if (showCategoryModal) {
      setEditingFromList(true);
      setShowCategoryModal(false);
      setTimeout(() => setShowEditCategoryModal(true), 120);
    } else {
      setShowEditCategoryModal(true);
    }
  };

  const handleCloseEditCategory = () => {
    setShowEditCategoryModal(false);
    setEditingCategory(null);
    if (editingFromList) {
      setShowCategoryModal(true);
      setEditingFromList(false);
    }
  };

  const handleCategorySaved = () => {
    fetchCategories();
    handleCloseEditCategory();
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-20 pb-8 sm:pb-12 px-3 sm:px-4 md:px-6 lg:px-8 bg-gradient-to-br from-light-500 via-primary-50 to-light-500 dark:from-dark-500 dark:via-dark-400 dark:to-dark-600">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Panel de <span className="gradient-text">Administración</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Gestiona productos y conversaciones con clientes
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8"
        >
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-colors duration-200 min-h-[48px] text-base ${activeTab === "products"
                ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                : "glass text-gray-700 dark:text-gray-300 hover:shadow-md"
              }`}
          >
            <Package className="w-5 h-5" />
            <span>Productos</span>
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-colors duration-200 min-h-[48px] text-base ${activeTab === "chat"
                ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                : "glass text-gray-700 dark:text-gray-300 hover:shadow-md"
              }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Conversaciones</span>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-colors duration-200 min-h-[48px] text-base ${activeTab === "orders"
                ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                : "glass text-gray-700 dark:text-gray-300 hover:shadow-md"
              }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Pedidos</span>
          </button>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Action Buttons */}
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOpenProductModal()}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow duration-200 min-h-[48px] text-base"
                  style={{ willChange: "transform" }}
                >
                  <Plus className="w-5 h-5" />
                  <span>Nuevo Producto</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleOpenCategoryModal}
                  className="flex items-center justify-center space-x-2 px-4 py-3 glass rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:shadow-md transition-shadow duration-200 min-h-[48px] text-base"
                >
                  <Plus className="w-4 h-4" />
                  <span>Gestionar categorías</span>
                </motion.button>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader className="w-12 h-12 text-primary-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      isAdmin={true}
                      hideDetails={true}
                      onEdit={handleOpenProductModal}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AdminChat />
            </motion.div>
          )}

          {activeTab === "orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AdminOrders />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        {showProductModal && (
          <ProductFormModal
            show={showProductModal}
            onClose={handleCloseProductModal}
            editingProduct={editingProduct}
            categoriesList={categoriesList}
            onProductSaved={handleProductSaved}
          />
        )}

        <CategoryModal
          show={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          categoriesList={categoriesList}
          onCategoriesChange={fetchCategories}
          onEditCategory={handleEditCategory}
        />

        <CategoryEditModal
          show={showEditCategoryModal}
          onClose={handleCloseEditCategory}
          category={editingCategory}
          onCategorySaved={handleCategorySaved}
        />
      </div>
    </div>
  );
};

export default Admin;
