import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, apiAsset } from "@/utils/api";
import { useScrollFloat } from "../../utils/scrollFloat";
import { useTranslation } from "react-i18next";

type BestSellingItem = {
  key: string;
  displayName: string;
  imageUrl: string;
};

type Product = {
  id: string;
  displayName: string;
  category: string;
};

const normalize = (v: string) =>
  v.toLowerCase().replace(/\s+/g, "").replace(/-/g, "");

const BestSelling = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [isMobile, setIsMobile] = useState(false);
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<BestSellingItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useScrollFloat(".scroll-float", items.length > 0);

  /* ===== MOBILE ===== */
  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth <= 768);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ===== BEST SELLING CONTENT ===== */
  useEffect(() => {
    apiFetch(`/api/content/bestselling?lang=${i18n.language}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title || "");
        setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch(console.error);
  }, [i18n.language]);

  /* ===== PRODUCTS FROM BACKEND ===== */
  useEffect(() => {
    apiFetch("/api/content/products")
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data.items) ? data.items : []);
      })
      .catch(console.error);
  }, []);

  /* ===== MATCHING (FINAL) ===== */
  const bestSellingProducts = items
    .map(item => {
      const product = products.find(
        p =>
          p.category === "3D Frame" &&
          normalize(p.displayName).includes(normalize(item.key))
      );

      if (!product) return null;

      return {
        id: product.id,
        displayName: item.displayName,
        imageUrl: item.imageUrl
      };
    })
    .filter(Boolean) as {
      id: string;
      displayName: string;
      imageUrl: string;
    }[];

  /* ===== NAVIGATION ===== */
  const handleClick = (id: string) => {
    navigate(`/product/${id}`);
  };

  return (
    <>
      <div className="relative my-10 h-[1px] scroll-float">
        <div className="absolute left-0 w-1/4 border-t-[5px] border-black" />
        <div className="absolute right-0 w-1/4 border-t-[5px] border-black" />
      </div>

      <section className={`bg-white ${isMobile ? "py-8" : "py-16"} scroll-float`}>
        <h2
          className={`font-nataliecaydence text-center ${
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
          {bestSellingProducts.map(item => (
            <div
              key={item.id}
              onClick={() => handleClick(item.id)}
              className="cursor-pointer text-center bg-white p-5 rounded-xl shadow-md hover:-translate-y-1 transition-all duration-500 scroll-float"
            >
              <img
                src={apiAsset(item.imageUrl)}
                alt={item.displayName}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <p className="font-poppinsBold text-gray-600">
                {item.displayName}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default BestSelling;