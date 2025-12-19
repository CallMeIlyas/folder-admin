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
  displayName?: string;
  allImages?: string[];
}

export const useSort = (products: Product[]) => {
  const [sortOption, setSortOption] = useState("default");

  // Fungsi penentuan produk Best Selling
  const isBestSelling = (p: Product) => {
    if (!p.displayName || !p.category) return false;

    const name = p.displayName.toLowerCase().trim();
    const category = p.category.toLowerCase().trim();

    // 3D Category: hanya 12R & 10R (bukan "by AI")
    if (
      category.includes("3d") &&
      (/\b12r\b/.test(name) || /\b10r\b/.test(name)) &&
      !name.includes("by ai")
    ) {
      return true;
    }

    //  2D Category: hanya 8R
    if (category.includes("2d") && /\b8r\b/.test(name)) {
      return true;
    }

    //  Acrylic Stand 2cm
    if (name.includes("acrylic stand") && name.includes("2cm")) {
      return true;
    }

    return false;
  };

  const sortedProducts = useMemo(() => {
    if (sortOption === "best-selling") {
      // Filter hanya produk yang sesuai best selling
      return products.filter(isBestSelling);
    }

    // Sorting harga
    switch (sortOption) {
      case "price-asc":
        return [...products].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...products].sort((a, b) => b.price - a.price);
      default:
        return products;
    }
  }, [products, sortOption]);

  return { sortedProducts, sortOption, setSortOption };
};