/**
 * Skeleton loader que imita la estructura de ProductCard
 * Usado durante la carga de productos para evitar layout shift
 */
const ProductCardSkeleton = () => {
  return (
    <div className="glass rounded-2xl overflow-hidden shadow-lg">
      {/* Image placeholder */}
      <div className="relative h-48 sm:h-56 md:h-64 skeleton" />

      {/* Content */}
      <div className="p-4 sm:p-5 md:p-6 space-y-3">
        {/* Title */}
        <div className="h-6 skeleton rounded-lg w-3/4" />

        {/* Description lines */}
        <div className="space-y-2">
          <div className="h-4 skeleton rounded w-full" />
          <div className="h-4 skeleton rounded w-2/3" />
        </div>

        {/* Price and button */}
        <div className="flex items-center justify-between mt-4">
          <div className="space-y-1">
            <div className="h-7 skeleton rounded w-20" />
            <div className="h-3 skeleton rounded w-16" />
          </div>
          <div className="h-10 skeleton rounded-full w-24" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
