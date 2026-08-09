export function ProductSkeleton() {
  return (
    <>
      {/* Desktop Table Skeleton */}
      <div className="hidden md:block bg-white rounded-xl border border-[#E2EFE2] overflow-hidden animate-pulse shadow-sm">
        <div className="h-10 bg-[#E8F0E8] px-4 grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_1fr_1.2fr_100px] items-center gap-4">
          {Array(8).fill(null).map((_, i) => (
            <div key={i} className={`h-3 bg-[#D4E4D4] rounded ${i === 7 ? 'w-12 justify-self-end' : i === 3 || i === 4 || i === 5 ? 'w-16 justify-self-end' : 'w-16'}`} />
          ))}
        </div>
        {Array(5).fill(null).map((_, i) => (
          <div key={i} className="h-16 px-4 grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_1fr_1.2fr_100px] items-center gap-4 border-b border-[#E2EFE2] last:border-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 bg-[#E8F0E8] rounded flex-shrink-0" />
              <div className="h-3 bg-[#E8F0E8] rounded w-32" />
            </div>
            <div className="h-3 bg-[#E8F0E8] rounded w-20" />
            <div className="h-3 bg-[#E8F0E8] rounded w-20" />
            <div className="h-3 bg-[#E8F0E8] rounded w-16 justify-self-end" />
            <div className="h-3 bg-[#E8F0E8] rounded w-12 justify-self-end" />
            <div className="h-3 bg-[#E8F0E8] rounded w-12 justify-self-end" />
            <div className="flex items-center gap-3">
              <div className="h-1.5 bg-[#E8F0E8] rounded-full w-16" />
              <div className="h-4 bg-[#E8F0E8] rounded w-12" />
            </div>
            <div className="flex justify-end gap-1">
              <div className="h-6 bg-[#E8F0E8] rounded w-6" />
              <div className="h-6 bg-[#E8F0E8] rounded w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Card Skeleton */}
      <div className="md:hidden space-y-3">
        {Array(3).fill(null).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E2EFE2] p-4 space-y-3 animate-pulse shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-[#E8F0E8] rounded-lg flex-shrink-0" />
                <div className="space-y-2 py-1">
                  <div className="h-3 bg-[#E8F0E8] rounded w-32" />
                  <div className="h-3 bg-[#E8F0E8] rounded w-20" />
                </div>
              </div>
              <div className="h-5 bg-[#E8F0E8] rounded w-16 mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="h-2.5 bg-[#E8F0E8] rounded w-10 mb-2" />
                <div className="h-3 bg-[#E8F0E8] rounded w-16" />
              </div>
              <div>
                <div className="h-2.5 bg-[#E8F0E8] rounded w-10 mb-2" />
                <div className="h-3 bg-[#E8F0E8] rounded w-16" />
              </div>
            </div>
            <div className="h-1.5 bg-[#E8F0E8] rounded-full w-full" />
            <div className="flex gap-2 pt-2 border-t border-[#E2EFE2]">
              <div className="h-10 bg-[#E8F0E8] rounded flex-1" />
              <div className="h-10 bg-[#E8F0E8] rounded flex-1" />
              <div className="h-10 bg-[#E8F0E8] rounded flex-1" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
