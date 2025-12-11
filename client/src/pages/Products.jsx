import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Loader2, Package, Grid3X3, LayoutList } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../components/ui';

/**
 * Products Page - v2 Design System
 * Precision Craft: Vercel/Apple + Teenage Engineering
 */

const Products = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);
  const [nameToSlug, setNameToSlug] = useState({});
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedProduct, setSelectedProduct] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategorySlug]);

  // Initialize selectedCategorySlug from URL
  useEffect(() => {
    const { slug } = params || {};
    if (slug) {
      setSelectedCategorySlug(slug);
      return;
    }

    const query = new URLSearchParams(location.search);
    const cat = query.get('category');
    if (cat) {
      if (cat === 'Todas') {
        setSelectedCategorySlug('');
      } else if (nameToSlug[cat]) {
        setSelectedCategorySlug(nameToSlug[cat]);
      } else {
        setSelectedCategorySlug(cat);
      }
    }
  }, [location.search, params?.slug, nameToSlug]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let data;

      if (selectedCategorySlug) {
        const res = await axios.get(`/api/products/category/${selectedCategorySlug}`);
        data = res.data;
      } else {
        const res = await axios.get('/api/products');
        data = res.data;
      }

      setProducts(data.products);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/api/categories');
      const map = {};
      data.categories.forEach((c) => {
        map[c.name] = c.slug;
      });
      setNameToSlug(map);
      setCategoriesList([
        { name: 'Todas', slug: '' },
        ...data.categories.map((c) => ({ name: c.name, slug: c.slug })),
      ]);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      // Fallback
      setCategoriesList([
        { name: 'Todas', slug: '' },
        { name: 'Joyería artesanal', slug: 'joyeria-artesanal' },
        { name: 'Cerámica y arcilla', slug: 'ceramica-y-arcilla' },
        { name: 'Arte hecho a mano', slug: 'arte-hecho-a-mano' },
      ]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  const handleCategoryChange = (slug) => {
    setSelectedCategorySlug(slug);
    if (slug) {
      navigate(`/products/category/${slug}`);
    } else {
      navigate('/products');
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCategory = categoriesList.find(c => c.slug === selectedCategorySlug);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-page">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <Badge variant="primary" className="mb-3">
                Catálogo
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                Nuestros <span className="text-gradient">Productos</span>
              </h1>
              <p className="mt-2 text-foreground-secondary">
                Descubre piezas únicas hechas con amor y dedicación
              </p>
            </div>

            {/* Products count */}
            <div className="flex items-center gap-2 text-sm font-mono text-foreground-tertiary">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span>{filteredProducts.length} productos</span>
            </div>
          </div>
        </motion.div>

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8 space-y-4"
        >
          {/* Search & View Toggle */}
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-tertiary" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-12 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md
                           text-foreground-tertiary hover:text-foreground hover:bg-surface-hover
                           transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="hidden md:flex items-center border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400'
                    : 'text-foreground-tertiary hover:text-foreground'
                  }`}
                aria-label="Vista en grid"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400'
                    : 'text-foreground-tertiary hover:text-foreground'
                  }`}
                aria-label="Vista en lista"
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categoriesList.map((category) => {
              const isActive = selectedCategorySlug === category.slug ||
                (selectedCategorySlug === '' && category.name === 'Todas');

              return (
                <motion.button
                  key={category.slug || category.name}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium
                    transition-all duration-fast
                    ${isActive
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-surface border border-border-subtle text-foreground-secondary hover:border-border hover:text-foreground'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {category.name}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-sm font-mono text-foreground-tertiary">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 
                          bg-surface-hover rounded-2xl mb-4">
              <Package className="w-8 h-8 text-foreground-tertiary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No se encontraron productos
            </h3>
            <p className="text-foreground-secondary mb-6">
              {searchTerm
                ? 'Intenta con otro término de búsqueda'
                : 'Aún no hay productos en esta categoría'}
            </p>
            {(searchTerm || selectedCategorySlug) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  handleCategoryChange('');
                }}
                className="btn btn-secondary"
              >
                Ver todos los productos
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`
              grid gap-6
              ${viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 max-w-3xl mx-auto'
              }
            `}
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.3) }}
              >
                <ProductCard
                  product={product}
                  onDelete={handleDelete}
                  isAdmin={false}
                  onEdit={(p) => navigate(`/products/${p._id}/edit`)}
                  onViewDetails={(p) => setSelectedProduct(p)}
                  viewMode={viewMode}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            key={selectedProduct._id}
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
