import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Package, Grid3X3, List } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

/**
 * Products Page - v2 Design System
 * Clean layout with properly aligned controls
 */

const Products = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);
  const [nameToSlug, setNameToSlug] = useState({});
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');
  const [viewMode, setViewMode] = useState('grid');
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

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Nuestros Productos
          </h1>
          <p className="text-foreground-secondary">
            Descubre piezas únicas hechas con amor y dedicación
          </p>
        </motion.div>

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search & View Toggle */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-tertiary" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-surface 
                         border border-border-subtle rounded-lg
                         focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20
                         transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 
                           text-foreground-tertiary hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="hidden sm:flex items-center gap-1 p-1 bg-surface border border-border-subtle rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid'
                    ? 'bg-primary-500 text-white'
                    : 'text-foreground-secondary hover:text-foreground'
                  }`}
                aria-label="Vista cuadrícula"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${viewMode === 'list'
                    ? 'bg-primary-500 text-white'
                    : 'text-foreground-secondary hover:text-foreground'
                  }`}
                aria-label="Vista lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Product Count */}
            <span className="hidden md:block text-sm text-foreground-tertiary whitespace-nowrap">
              {filteredProducts.length} productos
            </span>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categoriesList.map((category) => {
              const isActive = selectedCategorySlug === category.slug ||
                (selectedCategorySlug === '' && category.name === 'Todas');

              return (
                <button
                  key={category.slug || category.name}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-full transition-all
                    ${isActive
                      ? 'bg-foreground text-background'
                      : 'bg-surface border border-border-subtle text-foreground-secondary hover:border-border hover:text-foreground'
                    }
                  `}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-sm text-foreground-tertiary">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover 
                          flex items-center justify-center">
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
                className="px-4 py-2 text-sm font-medium border border-border-subtle
                         rounded-lg hover:border-border transition-colors"
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
                : 'grid-cols-1 max-w-3xl'
              }
            `}
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(index * 0.03, 0.2) }}
                  layout
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
            </AnimatePresence>
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
