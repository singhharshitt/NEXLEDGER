import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProductFiltersProps {
  searchInput: string;
  setSearchInput: (val: string) => void;
  category: string;
  stockStatus: string;
  handleFilterChange: (key: string, value: string) => void;
  clearFilters: () => void;
  categories: string[];
}

export function ProductFilters({
  searchInput,
  setSearchInput,
  category,
  stockStatus,
  handleFilterChange,
  clearFilters,
  categories,
}: ProductFiltersProps) {
  const hasActiveFilters = searchInput || category || stockStatus;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9A8A]" />
        <Input 
          placeholder="Search by name or SKU..."
          className="pl-9 h-10 border-[#E2EFE2] rounded-lg focus-visible:ring-[#A3E635]/40"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      
      {/* Category Select */}
      <select 
        value={category} 
        onChange={(e) => handleFilterChange('category', e.target.value)}
        className="w-full sm:w-44 h-10 px-3 border border-[#E2EFE2] rounded-lg bg-white text-sm text-[#0A1F0A] focus:outline-none focus:ring-2 focus:ring-[#A3E635]/40"
      >
        <option value="">All Categories</option>
        {categories.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      
      {/* Stock Status Select */}
      <select 
        value={stockStatus} 
        onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
        className="w-full sm:w-44 h-10 px-3 border border-[#E2EFE2] rounded-lg bg-white text-sm text-[#0A1F0A] focus:outline-none focus:ring-2 focus:ring-[#A3E635]/40"
      >
        <option value="">All Stock</option>
        <option value="HEALTHY">In Stock</option>
        <option value="LOW">Low Stock</option>
        <option value="OUT">Out of Stock</option>
      </select>
      
      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={clearFilters}
          className="h-10 text-[#5A6B5A] hover:text-[#0A1F0A]"
        >
          <X className="w-4 h-4 mr-1.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
