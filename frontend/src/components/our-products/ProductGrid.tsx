import type { FC } from "react";
import { useLocation, useSearchParams } from "react-router-dom"; 
import ProductCard from "./ProductCard";
import Pagination from "./Pagination";
import type { FilterOptions } from "../../types/types";
import { orderedProducts } from "../../data/productDataLoader";
import { useProductFilter } from "../../hooks/useProductFilter";
import { useSort } from "../../hooks/useSort";
import { usePagination } from "../../hooks/usePagination";
import { useEffect, useMemo } from "react";

export interface ProductGridWithPaginationProps {
  filters: FilterOptions;
  searchQuery: string;
  sortOption: string;
}

const ProductGridWithPagination: FC<ProductGridWithPaginationProps> = ({
  filters,
  searchQuery,
  sortOption,
}) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const PRODUCTS_PER_PAGE = 16;

  // === PRIORITAS URL PARAMS UNTUK TAB BARU ===
  const effectiveFilters = useMemo(() => {
    const urlCategory = searchParams.get('category');
    const urlType = searchParams.get('type');
    const urlExclude = searchParams.get('exclude');
    
    if ((urlCategory || urlType || urlExclude) && 
        filters.categories.length === 0 && 
        filters.shippedFrom.length === 0 && 
        filters.shippedTo.length === 0) {
      
      const newFilters: FilterOptions = {
        categories: urlCategory ? [urlCategory] : [],
        shippedFrom: filters.shippedFrom,
        shippedTo: filters.shippedTo
      };
      
      return newFilters;
    }
    
    return filters;
  }, [filters, searchParams]);

  const effectiveSearchQuery = useMemo(() => {
    const urlSearch = searchParams.get('search');
    return urlSearch && !searchQuery ? urlSearch : searchQuery;
  }, [searchQuery, searchParams]);

  const effectiveSortOption = useMemo(() => {
    const urlSort = searchParams.get('sort');
    // Gunakan URL sort jika ada, jika tidak gunakan dari props
    return urlSort || sortOption;
  }, [sortOption, searchParams]);

  // Step 1: Filter products dengan URL params
  const filteredProducts = useProductFilter(
    orderedProducts, 
    effectiveFilters, 
    effectiveSearchQuery,
    location.search
  );
  
  // Step 2: Sort products
  const { sortedProducts } = useSort(filteredProducts);
  
  // Step 3: Apply sort option - GUNAKAN LOGIKA SEDERHANA DARI VERSI LAMA YANG WORK
  const finalProducts = useMemo(() => {
    console.log("Applying sort option:", effectiveSortOption);
    
    switch (effectiveSortOption) {
      case "best-selling":
        // GUNAKAN LOGIKA SEDERHANA DARI VERSI LAMA YANG WORK
        return sortedProducts.filter((p) => {
          if (!p.displayName || !p.category) return false;
          const name = p.displayName.toLowerCase().trim();
          const category = p.category.toLowerCase().trim();

          // 3D Frame: 12R atau 10R, tapi bukan "by ai"
          if (
            category.includes("3d") &&
            (/\b12r\b/.test(name) || /\b10r\b/.test(name)) &&
            !name.includes("by ai")
          ) {
            console.log("Best selling 3D found:", p.displayName);
            return true;
          }

          // 2D Frame: 8R
          if (category.includes("2d") && /\b8r\b/.test(name)) {
            console.log("Best selling 2D found:", p.displayName);
            return true;
          }

          // Acrylic Stand: 2cm
          if (name.includes("acrylic stand") && name.includes("2cm")) {
            console.log("Best selling Acrylic found:", p.displayName);
            return true;
          }

          return false;
        });
        
      case "price-asc":
        return [...sortedProducts].sort((a, b) => a.price - b.price);
        
      case "price-desc":
        return [...sortedProducts].sort((a, b) => b.price - a.price);
        
      default:
        return sortedProducts;
    }
  }, [sortedProducts, effectiveSortOption]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    currentProducts,
  } = usePagination(finalProducts, PRODUCTS_PER_PAGE);

  // Reset page ketika filter/search/sort/URL berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [effectiveFilters, effectiveSearchQuery, effectiveSortOption, location.search, setCurrentPage]);

  // Debug untuk tab baru
  useEffect(() => {
    console.log("=== ProductGrid Debug ===");
    console.log("URL Search:", location.search);
    console.log("Effective Filters:", effectiveFilters);
    console.log("Effective Search Query:", effectiveSearchQuery);
    console.log("Effective Sort Option:", effectiveSortOption);
    console.log("Sort Option from props:", sortOption);
    console.log("Filtered Products Count:", filteredProducts.length);
    console.log("Sorted Products Count:", sortedProducts.length);
    console.log("Final Products Count:", finalProducts.length);
    
    // Debug khusus untuk best-selling
    if (effectiveSortOption === "best-selling") {
      console.log("=== BEST SELLING DETAILS ===");
      const bestSellingProducts = sortedProducts.filter((p) => {
        if (!p.displayName || !p.category) return false;
        const name = p.displayName.toLowerCase().trim();
        const category = p.category.toLowerCase().trim();
        
        if (category.includes("3d") && (/\b12r\b/.test(name) || /\b10r\b/.test(name)) && !name.includes("by ai")) {
          return true;
        }
        if (category.includes("2d") && /\b8r\b/.test(name)) {
          return true;
        }
        if (name.includes("acrylic stand") && name.includes("2cm")) {
          return true;
        }
        return false;
      });
      
      console.log("Potential best selling products:", bestSellingProducts.map(p => ({
        name: p.displayName,
        category: p.category,
        id: p.id
      })));
    }
  }, [location.search, effectiveFilters, effectiveSearchQuery, effectiveSortOption, sortOption, filteredProducts.length, sortedProducts.length, finalProducts.length]);

  return (
    <div className="pb-10 bg-white">
      {/* === GRID PRODUK === */}
      <div
        className="
          grid 
          grid-cols-2 
          md:grid-cols-4 
          gap-5 
          px-4 md:px-10 
          max-w-[1230px] 
          mx-auto 
          place-items-center
        "
      >
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <div key={product.id} className="w-full flex justify-center">
              <ProductCard product={product} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            {orderedProducts.length === 0
              ? "No images found."
              : effectiveSortOption === "best-selling"
                ? "No best-selling products found for current filters"
                : "No products match your current filters"}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ProductGridWithPagination;