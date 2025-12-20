import type { FC } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import LazyImage from "../../utils/LazyImage";
import { useTranslation } from "react-i18next";
import { apiAsset } from "../../utils/api";

export interface ProductCardItem {
  id: string;
  displayName: string;
  category: string;
  price: number | null;
  imageUrl: string;
}

interface ProductCardProps {
  product: ProductCardItem;
}

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const isBestSelling = () => {
    const name = product.displayName.toLowerCase();
    const category = product.category.toLowerCase();

    if (category.includes("3d") && (name.includes("12r") || name.includes("10r"))) return true;
    if (category.includes("2d") && name.includes("8r")) return true;
    if (name.includes("acrylic stand 2cm")) return true;

    return false;
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="cursor-pointer text-center bg-white p-[15px] rounded-[10px] shadow-md transition-transform duration-300 hover:-translate-y-[5px] w-[150px] h-[240px] sm:w-[180px] sm:h-[260px] md:w-[200px] md:h-[280px] flex flex-col justify-between no-underline"
    >
      <div className="relative mb-[12px] rounded-[8px] overflow-hidden">
        <LazyImage
            src={apiAsset(product.imageUrl)}
          alt={product.displayName}
          placeholder="/api/uploads/images/placeholder/product.jpg"
          className="w-full aspect-square object-cover"
        />

        {isBestSelling() && (
          <div className="absolute bottom-0 left-0 bg-black text-white text-[11px] font-semibold px-[10px] py-[4px] rounded-r-full flex items-center gap-[6px] shadow-md">
            <FaStar className="text-white text-[10px]" />
            <span>Best Selling</span>
          </div>
        )}
      </div>

      <div className="mt-[8px] leading-snug">
        <p className="font-bold text-[#444] text-[15px] leading-tight break-words">
          {product.displayName}
        </p>

        <p className="text-[15px] font-semibold text-red-600">
          {product.price !== null
            ? `Rp ${product.price.toLocaleString("id-ID")}`
            : currentLang === "id"
              ? "Harga tidak tersedia"
              : "Price not available"}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;