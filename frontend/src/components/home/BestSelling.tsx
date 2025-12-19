import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, apiAsset } from "@/utils/api";
import { useScrollFloat } from "../../utils/scrollFloat";
import { allProducts } from "../../data/productDataLoader";
import type { Product } from "../../data/productDataLoader";
import { useTranslation } from "react-i18next";

type BestSellingItem = {
  key: string;
  displayName: string;
  match: string;
  target3D: string;
  imageUrl: string;
};

const BestSelling = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [isMobile, setIsMobile] = useState(false);
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<BestSellingItem[]>([]);

  // PANGGIL HOOK DI TOP LEVEL
  useScrollFloat(".scroll-float", items.length > 0);

  // Deteksi mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch best selling dari backend
  useEffect(() => {
    apiFetch(`/api/content/bestselling?lang=${i18n.language}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title || "");
        setItems(data.items || []);
      })
      .catch(console.error);
  }, [i18n.language]);

  // Cocokkan dengan product internal
  const bestSellingProducts = items
    .map(item => {
      const found = allProducts.find(
        p =>
          p.category === "3D Frame" &&
          p.name.toLowerCase().includes(item.match.toLowerCase())
      );

      return found
        ? {
            ...found,
            displayName: item.displayName,
            target3D: item.target3D,
            imageUrl: item.imageUrl
          }
        : null;
    })
    .filter(Boolean) as (Product & {
    displayName: string;
    target3D: string;
    imageUrl: string;
  })[];

  const handleCardClick = (product: Product & { target3D: string }) => {
    const targetName = product.target3D.trim().toLowerCase();
    const targetProduct = allProducts.find(
      p =>
        p.category === "3D Frame" &&
        p.name.trim().toLowerCase() === targetName
    );

    if (targetProduct) {
      navigate(`/product/${targetProduct.id}`, {
        state: {
          ...targetProduct,
          specialVariations: targetProduct.specialVariations || [],
          details: targetProduct.details || {}
        }
      });
    }
  };

  return (
    <>
      <div className="relative my-10 text-center h-[1px] scroll-float">
        <div className="absolute top-0 left-0 w-1/4 border-t-[5px] border-black"></div>
        <div className="absolute top-0 right-0 w-1/4 border-t-[5px] border-black"></div>
      </div>

      <section className={`bg-white ${isMobile ? "py-8" : "py-16"} scroll-float`}>
        <h2
          className={`font-nataliecaydence text-center text-black ${
            isMobile ? "text-3xl mb-6" : "text-[46px] mb-10"
          }`}
        >
          {title}
        </h2>

        <div
          className={`grid ${
            isMobile
              ? "grid-cols-1 gap-4 px-4 max-w-md mx-auto"
              : "grid-cols-4 gap-5 px-10 max-w-6xl mx-auto"
          }`}
        >
          {bestSellingProducts.map(product => (
            <div
              key={product.id}
              onClick={() => handleCardClick(product)}
              className="cursor-pointer text-center bg-white p-5 rounded-xl shadow-md hover:shadow-hover hover:-translate-y-1 transform transition-all duration-500 scroll-float group"
            >
              <img
                src={apiAsset(product.imageUrl)}
                alt={product.displayName}
                className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-110 transition-transform duration-500"
              />
              <p className="m-2.5 font-poppinsBold text-gray-600 text-base">
                {product.displayName}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default BestSelling;