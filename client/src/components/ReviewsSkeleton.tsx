/**
 * Skeleton para Reviews - muestra placeholder durante la carga
 */
const ReviewsSkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Rating summary skeleton */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-xl skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded skeleton" />
          <div className="h-3 w-24 rounded skeleton" />
        </div>
      </div>

      {/* Review items skeleton */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full skeleton" />

            <div className="flex-1 space-y-2">
              {/* Name and date */}
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 rounded skeleton" />
                <div className="h-3 w-16 rounded skeleton" />
              </div>

              {/* Stars */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="w-4 h-4 rounded skeleton" />
                ))}
              </div>

              {/* Comment */}
              <div className="space-y-1.5 pt-1">
                <div className="h-3 w-full rounded skeleton" />
                <div className="h-3 w-3/4 rounded skeleton" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewsSkeleton;
