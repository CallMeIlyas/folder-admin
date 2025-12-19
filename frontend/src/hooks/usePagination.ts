import { useState, useMemo } from "react";

interface Product {
  id: string;
  imageUrl: string;
  name: string;
  size: string;
  category: string;
  subcategory: string | null;
  fullPath: string;
  price: number;
  shippedFrom: string;
  shippedTo: string[];
  allImages?: string[];
}

export const usePagination = (products: Product[], productsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(products.length / productsPerPage);
  
  const currentProducts = useMemo(() => {
    return products.slice(
      (currentPage - 1) * productsPerPage,
      currentPage * productsPerPage
    );
  }, [products, currentPage, productsPerPage]);

  return { currentPage, setCurrentPage, totalPages, currentProducts };
};