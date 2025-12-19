import { useState, useEffect } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import Footer from "../components/home/Footer";
import SidebarFilters from "../components/our-products/SidebarFilters";
import ProductGridWithPagination from "../components/our-products/ProductGrid";
import MobileFilterSheet from "../components/our-products/MobileFilterSheet";
import SortControls from "../components/our-products/SortControls"; 
import type { FilterOptions } from "../types/types";

type LayoutContext = {
  searchQuery: string;
  addToCart: (item: any) => void;
};

const OurProducts = () => {
  const { searchQuery } = useOutletContext<LayoutContext>();
  const location = useLocation();
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    shippedFrom: [],
    shippedTo: [],
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sortOption, setSortOption] = useState("");
  
  const [hasUrlParams, setHasUrlParams] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasParams = params.toString() !== '';
    setHasUrlParams(hasParams);
  }, [location.search, searchQuery, filters]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    if (params.toString() !== '') {
      setFilters({
        categories: [],
        shippedFrom: [],
        shippedTo: [],
      });
    }
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.toString() !== '') {
      setSortOption("");
    }
  }, [location.search]);
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex flex-1">
        <div className="hidden md:block">
          <SidebarFilters 
            onFilterChange={setFilters} 
            isDisabled={hasUrlParams}
          />
        </div>
        
        <div className="flex-1">
          <div className="p-4">
            <SortControls 
              sortOption={sortOption}
              onSortChange={setSortOption}
              onOpenFilters={() => setSheetOpen(true)}
              showReset={hasUrlParams}
              onReset={() => {
                window.history.pushState({}, '', '/products');
                setHasUrlParams(false);
              }}
            />
          </div>
          
          <ProductGridWithPagination
            filters={filters}
            searchQuery={searchQuery}
            sortOption={sortOption} 
          />
        </div>
      </div>

      <Footer />
      
      <MobileFilterSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onFilterChange={setFilters}
        isDisabled={hasUrlParams}
      />
    </div>
  );
};

export default OurProducts;