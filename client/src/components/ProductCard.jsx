import { motion } from 'framer-motion';
import { Edit, Trash2, Package, Star, ArrowRight } from 'lucide-react';
import { Badge } from './ui';

/**
 * ProductCard Component - v2 Design System
 * Precision Craft: Vercel/Apple + Teenage Engineering
 */

const ProductCard = ({
  product,
  onEdit,
  onDelete,
  isAdmin,
  onViewDetails,
  hideDetails,
  viewMode = 'grid',
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const hasRating = (product.reviewsCount ?? product.reviews?.length ?? 0) > 0;
  const avgRating = product.avgRating ??
    (product.reviews?.length
      ? Math.round((product.reviews.reduce((s, r) => s + (r.rating || 0), 0) / product.reviews.length) * 10) / 10
      : 0);

  // List view variant
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="group bg-surface border border-border-subtle rounded-xl overflow-hidden
                 hover:border-border hover:shadow-lg transition-all duration-fast"
      >
        <div className="flex items-stretch">
          {/* Image */}
          <div className="relative w-32 sm:w-48 flex-shrink-0 overflow-hidden">
            {product.images?.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-surface-hover flex items-center justify-center">
                <Package className="w-8 h-8 text-foreground-tertiary" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <Badge variant="default" className="mb-2">
                    {product.categoryId?.name || 'Sin categoría'}
                  </Badge>
                  <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                    {product.name}
                  </h3>
                </div>

                {hasRating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="font-mono font-medium text-foreground">
                      {avgRating}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-sm text-foreground-secondary line-clamp-2 mb-4">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xl font-bold text-primary-500">
                  {formatPrice(product.price)}
                </p>
                <p className={`text-xs font-mono ${product.stock > 0 ? 'text-success' : 'text-error'
                  }`}>
                  {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                </p>
              </div>

              {!hideDetails && (
                <motion.button
                  onClick={() => onViewDetails?.(product)}
                  className="btn btn-primary btn-sm group/btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={product.stock === 0}
                >
                  <span>Ver detalles</span>
                  <ArrowRight className="w-4 h-4 transition-transform 
                                       group-hover/btn:translate-x-0.5" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group bg-surface border border-border-subtle rounded-xl overflow-hidden
               hover:border-border hover:shadow-lg transition-all duration-fast"
    >
      {/* Image */}
      <div className="relative aspect-square bg-surface-hover overflow-hidden">
        {product.images?.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-slow
                     group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-foreground-tertiary" />
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="default" className="bg-surface/90 backdrop-blur-sm">
            {product.categoryId?.name || 'Sin categoría'}
          </Badge>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="absolute top-3 right-3 flex gap-2 
                        opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              onClick={() => onEdit?.(product)}
              className="p-2 bg-surface rounded-lg shadow-md
                       text-foreground hover:bg-primary-500 hover:text-white
                       transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Editar producto"
            >
              <Edit className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => onDelete?.(product._id)}
              className="p-2 bg-surface rounded-lg shadow-md
                       text-foreground hover:bg-error hover:text-white
                       transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Eliminar producto"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm 
                        flex items-center justify-center">
            <Badge variant="error">Agotado</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Title & Rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="flex-1 min-w-0 text-base sm:text-lg font-semibold text-foreground line-clamp-1">
            {product.name}
          </h3>

          {hasRating && (
            <div className="flex items-center gap-1 flex-shrink-0 text-sm">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span className="font-mono font-medium text-foreground">
                {avgRating}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-foreground-secondary line-clamp-2 mb-4">
          {product.description}
        </p>

        {/* Price & CTA */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-lg sm:text-xl font-bold text-primary-500">
              {formatPrice(product.price)}
            </p>
            {product.stock > 0 && (
              <p className="text-xs font-mono text-success">
                {product.stock} en stock
              </p>
            )}
          </div>

          {!hideDetails && (
            <motion.button
              onClick={() => onViewDetails?.(product)}
              className="btn btn-primary btn-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={product.stock === 0}
            >
              Ver más
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
