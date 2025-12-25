import { useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import ProductCard from "./ProductCard";
import Pagination from "./Pagination";
import type { FilterOptions } from "../../types/types";
import { apiFetch, apiAsset } from "@/utils/api";

interface Product {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
}

interface ApiResponse {
  items: Product[];
  totalItems: number;
  totalPages: number;
}

interface ProductGridProps {
  filters: FilterOptions;
  searchQuery?: string;
  sortOption?: string;
}

const ProductGrid: FC<ProductGridProps> = ({
  filters,
  searchQuery = "",
  sortOption = "all",
}) => {
  const PRODUCTS_PER_PAGE = 16;

  const [items, setItems] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const categoryParam = useMemo(() => {
    if (!filters.categories.length) return "";
    return filters.categories.join(",");
  }, [filters.categories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery, sortOption]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const params = new URLSearchParams({
        search: searchQuery,
        categories: categoryParam,
        sort: sortOption,
        page: String(currentPage),
        limit: String(PRODUCTS_PER_PAGE),
      });

      try {
        const res = await apiFetch(`/api/content/background-catalog?${params.toString()}`)
        const data: ApiResponse = await res.json();

        setItems(data.items);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("Failed to fetch background catalog", err);
        setItems([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, categoryParam, sortOption, currentPage]);

  return (
    <div className="pb-10 bg-white">
      <div
        className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-4 md:gap-5
          px-4 md:px-10
          max-w-[1230px]
          mx-auto
          place-items-center
        "
      >
        {loading && (
          <div className="col-span-full text-center py-10 text-gray-400">
            Loading...
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            No products match your current filters
          </div>
        )}

        {!loading &&
          items.map((product) => (
            <div key={product.id} className="w-full flex justify-center">
              <ProductCard
                imageUrl={apiAsset(product.imageUrl)}
                name={product.name}
              />
            </div>
          ))}
      </div>

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

export default ProductGrid;