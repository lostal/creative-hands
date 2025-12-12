/**
 * Skeleton para el Cart Drawer - muestra placeholder durante la carga
 */
const CartSkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Cart items skeleton */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex gap-3 items-center"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          {/* Product image */}
          <div className="w-16 h-16 rounded-lg skeleton shrink-0" />

          <div className="flex-1 min-w-0 space-y-2">
            {/* Name */}
            <div className="h-4 w-3/4 rounded skeleton" />

            {/* Price */}
            <div className="h-3 w-16 rounded skeleton" />

            {/* Quantity controls */}
            <div className="flex items-center gap-2 pt-1">
              <div className="w-8 h-8 rounded skeleton" />
              <div className="w-8 h-4 rounded skeleton" />
              <div className="w-8 h-8 rounded skeleton" />
            </div>
          </div>
        </div>
      ))}

      {/* Total skeleton */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="h-4 w-12 rounded skeleton" />
          <div className="h-6 w-20 rounded skeleton" />
        </div>
      </div>

      {/* Buttons skeleton */}
      <div className="space-y-2 pt-2">
        <div className="h-12 w-full rounded-full skeleton" />
        <div className="h-12 w-full rounded-full skeleton" />
      </div>
    </div>
  );
};

export default CartSkeleton;
