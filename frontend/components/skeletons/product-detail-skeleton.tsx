export default function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 animate-pulse">
        {/* Image section */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg bg-surface-elevated" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 w-16 rounded bg-surface-sunken"
              />
            ))}
          </div>
        </div>
        {/* Info section */}
        <div className="space-y-4">
          <div className="h-6 w-1/3 rounded bg-surface-sunken" />
          <div className="h-8 w-3/4 rounded bg-surface-elevated" />
          <div className="h-8 w-1/4 rounded bg-surface-elevated" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-surface-sunken" />
            <div className="h-4 w-full rounded bg-surface-sunken" />
            <div className="h-4 w-2/3 rounded bg-surface-sunken" />
          </div>
          <div className="h-12 w-full rounded-lg bg-surface-sunken" />
        </div>
      </div>
    </div>
  );
}
