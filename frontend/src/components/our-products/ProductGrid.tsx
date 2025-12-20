import { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "./ProductCard";
import Pagination from "./Pagination";
import type { FilterOptions } from "../../types/types";

interface Product {
  id: string;
  displayName: string;
  category: string;
  price: number | null;
  imageUrl: string;
}

interface ApiResponse {
  items: Product[];
  page: number;
  totalPages: number;
  totalItems: number;
}

interface Props {
  filters: FilterOptions;
  searchQuery: string;
  sortOption: string;
}

const ProductGridWithPagination: FC<Props> = ({
  filters,
  searchQuery,
  sortOption,
}) => {
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("limit", "16");

    if (searchQuery) params.set("search", searchQuery);
    if (sortOption) params.set("sort", sortOption);

    if (filters.categories.length > 0) {
      params.set("category", filters.categories.join(","));
    }

    setLoading(true);

    fetch(`http://localhost:3001/api/content/products?${params.toString()}`)
      .then(res => res.json())
      .then((data: ApiResponse) => {
        setProducts(data.items || []);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [page, filters, searchQuery, sortOption, location.search]);

  return (
    <div className="pb-10 bg-white">
      <div
        className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-5
          px-4 md:px-10
          max-w-[1230px]
          mx-auto
        "
      >
        {loading ? (
          <div className="col-span-full text-center py-10">
            Loading...
          </div>
        ) : products.length > 0 ? (
          products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            Tidak ada produk
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default ProductGridWithPagination;