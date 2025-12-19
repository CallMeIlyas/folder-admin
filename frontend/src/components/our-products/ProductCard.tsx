import type { FC } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/productDataLoader";
import { FaStar } from "react-icons/fa";
import LazyImage from "../../utils/LazyImage";

interface ProductCardProps {
  product: Product;
}

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  // Fungsi menentukan produk Best Selling
  const isBestSelling = (product: Product) => {
    if (!product.displayName || !product.category) return false;

    const name = product.displayName.toLowerCase().trim();
    const category = product.category.toLowerCase().trim();

    if (
      category.includes("3d") &&
      (name.match(/\b12r\b/) || name.match(/\b10r\b/)) &&
      !name.includes("by ai")
    ) {
      return true;
    }

    if (category.includes("2d") && name.match(/\b8r\b/)) {
      return true;
    }

    if (name.includes("acrylic stand 2cm")) {
      return true;
    }

    return false;
  };

  return (
    <Link
      to={`/product/${product.id}`}
      state={{
        ...product,
        specialVariations: product.specialVariations || [],
        details: product.details || {},
      }}
      className="cursor-pointer text-center bg-white p-[15px] rounded-[10px] shadow-md transition-transform duration-300 ease-in-out hover:-translate-y-[5px] w-[150px] h-[240px] sm:w-[180px] sm:h-[260px] md:w-[200px] md:h-[280px] flex flex-col justify-between no-underline"
    >
      {/* WRAPPER GAMBAR */}
      <div className="relative mb-[12px] rounded-[8px] overflow-hidden">
        <LazyImage
          src={product.imageUrl}
          alt={product.name}
          placeholder="/placeholder/low-res.jpg"
          className="w-full aspect-square object-cover"
        />

        {/* ⭐ BEST SELLING BADGE */}
        {isBestSelling(product) && (
          <div className="absolute bottom-0 left-0 bg-black text-white text-[11px] font-semibold px-[10px] py-[4px] rounded-r-full flex items-center gap-[6px] shadow-md font-poppinsItalic">
            <FaStar className="text-white text-[10px]" />
            <span>Best Selling</span>
          </div>
        )}
      </div>

      {/* NAMA & HARGA */}
      <div className="mt-[8px] leading-snug">
        <p className="font-bold text-[#444] text-[15px] leading-tight break-words">
          {product.displayName}
        </p>
        <p className="text-[15px] font-semibold text-red-600">
          {product.price
            ? `Rp ${product.price.toLocaleString("id-ID")}`
            : "Harga tidak tersedia"}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;