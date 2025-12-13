import { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Search, Package } from "lucide-react";
import api from "../utils/axios";
import logger from "../utils/logger";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import ProductModal from "../components/ProductModal";
import { useCategories } from "../hooks/useCategories";
import { useLocation, useNavigate, useParams } from "react-router";
import { Product } from "../types";
import { MotionDiv, MotionButton } from "../lib/motion";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  // Usar hook de categorías mejorado
  const { categoriesWithAll, nameToSlug } = useCategories();

  // Debounce para búsqueda (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategorySlug]);

  // Initialize selectedCategorySlug: prefer path param /products/category/:slug, fallback to query param
  useEffect(() => {
    const { slug } = params || {};
    if (slug) {
      setSelectedCategorySlug(slug);
      return;
    }

    const query = new URLSearchParams(location.search);
    const cat = query.get("category");
    if (cat) {
      if (cat === "Todas") {
        setSelectedCategorySlug("");
      } else if (nameToSlug[cat]) {
        // map known category name -> slug provided by server
        setSelectedCategorySlug(nameToSlug[cat]);
      } else {
        // if it's already a slug-like value, use it as-is
        setSelectedCategorySlug(cat);
      }
    }
  }, [location.search, params?.slug, nameToSlug]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let data;

      if (selectedCategorySlug) {
        const res = await api.get(`/products/category/${selectedCategorySlug}`);
        data = res.data;
      } else {
        const res = await api.get("/products");
        data = res.data;
      }

      setProducts(data.products);
    } catch (error) {
      logger.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      logger.error("Error al eliminar producto:", error);
      alert("Error al eliminar el producto");
    }
  };

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => setSelectedProduct(null);

  // Usar debouncedSearch para filtrar
  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase()),
      ),
    [products, debouncedSearch],
  );

  // Skeletons para carga
  const skeletonCount = 6;

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-8 sm:pb-12 px-3 sm:px-4 md:px-6 lg:px-8 bg-linear-to-br from-light-500 via-primary-50 to-light-500 dark:from-dark-500 dark:via-dark-400 dark:to-dark-600">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10 md:mb-12 text-center px-4"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Nuestros <span className="gradient-text">Productos</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Descubre piezas únicas hechas con amor y dedicación
          </p>
        </MotionDiv>

        {/* Filters */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 sm:mb-8 space-y-4"
        >
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-5 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-dropdown" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 glass rounded-full text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all text-base mx-2 sm:mx-0"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
            {categoriesWithAll.map((category) => (
              <MotionButton
                key={category.slug || category.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const val = category.slug || "";
                  setSelectedCategorySlug(val);
                  // update URL using slug path (preferred)
                  if (val) {
                    navigate(`/products/category/${val}`);
                  } else {
                    navigate("/products");
                  }
                }}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-medium transition-shadow duration-200 text-sm sm:text-base min-h-10 sm:min-h-11 ${selectedCategorySlug === category.slug ||
                  (selectedCategorySlug === "" && category.name === "Todas")
                  ? "bg-linear-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                  : "glass text-gray-700 dark:text-gray-300 hover:shadow-md"
                  }`}
              >
                {category.name}
              </MotionButton>
            ))}
          </div>
        </MotionDiv>

        {/* Products Grid */}
        {loading ? (
          // Skeleton Loaders
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-16 md:py-20 px-4"
          >
            <Package className="w-16 sm:w-20 h-16 sm:h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No se encontraron productos
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {debouncedSearch
                ? "Intenta con otro término de búsqueda"
                : "Aún no hay productos en esta categoría"}
            </p>
          </MotionDiv>
        ) : (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
          >
            {filteredProducts.map((product, index) => (
              <MotionDiv
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard
                  product={product}
                  onDelete={handleDelete}
                  /* For coherence: the admin should not have edit/delete actions in the public Products view.
                     Admin modifications are restricted to the separate Admin panel. */
                  isAdmin={false}
                  onEdit={(p) => navigate(`/products/${p._id}/edit`)}
                  onViewDetails={handleViewDetails}
                />
              </MotionDiv>
            ))}
          </MotionDiv>
        )}
      </div>
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            key={selectedProduct._id}
            product={selectedProduct}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
