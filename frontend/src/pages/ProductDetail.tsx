import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  useParams,
  Link,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import Footer from "../components/home/Footer";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiFetch, apiAsset } from "../utils/api";

type LayoutContext = {
  searchQuery: string;
  addToCart: (item: any) => void;
};

// ===== 🎯 VIDEO HELPER =====
const isVideo = (url: string): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith('.mp4') || 
         lowerUrl.endsWith('.webm') || 
         lowerUrl.endsWith('.mov') ||
         lowerUrl.includes('.mp4') ||
         lowerUrl.includes('.webm');
};

// ===== TIPE YANG LEBIH STRICT =====
type FrameSizeOption = {
  value: string;
  label: string;
  image: string;
  allImages?: string[];
};

type PackagingOption = {
  value: string;
  label: string;
  image: string;
};

type ShadingStyleOption = {
  value: string;
  label: string;
  image: string;
};

type Product = {
  id: string;
  title: string;
  category: string;
  images: {
    main: string;
    gallery: string[];
  };
  options: {
    variations?: string[];
    frameSizes?: FrameSizeOption[];
    shadingStyles?: ShadingStyleOption[];
    faceCountOptions?: string[];
    expressOptions?: string[];
    acrylicSizes?: string[];
    acrylicStandOptions?: string[];
    packagingOptions?: PackagingOption[];
  };
  uiText: {
    addToCart: string;
    buyNow: string;
    variation: string;
    frameSize: string;
    shadingStyle: string;
    details: Record<string, string>;
    bestSellingSize?: string;
    bestSellingGift?: string;
    priceInfo?: string;
    packingInfo?: string;
    quantity?: string;
    packagingOption?: string;
    preview?: string;
  };
  isBestSelling?: boolean;
  bestSellingLabel?: string;
  price: number;
};

type UserOptions = {
  frameSize?: string;
  shading?: string;
  variation?: string;
  faceCount?: string;
  expressOption?: string;
  acrylicSize?: string;
  acrylicStandOption?: string;
  packagingOption?: string;
};

type AdditionalProduct = {
  id: string;
  name: string;
  displayName: string;
  category: string;
  imageUrl: string;
  price: number | string;
  targetProduct: string;
};

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ProductDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useOutletContext<LayoutContext>();

  // ===== STATE =====
  const [selectedOptions, setSelectedOptions] = useState<UserOptions>({});
  const [displayedPrice, setDisplayedPrice] = useState<number>(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [additionalProducts, setAdditionalProducts] = useState<AdditionalProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk UI
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [variationImages, setVariationImages] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const additionalSectionRef = useRef<HTMLDivElement | null>(null);

  // ===== 🎯 DEBOUNCE SELECTED OPTIONS =====
  const debouncedOptions = useDebounce(selectedOptions, 200);

  // ===== FETCH PRODUCT DATA =====
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) {
        setError("Product ID is required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const productResponse = await apiFetch(`/api/products/${id}`);
        if (!productResponse.ok) {
          throw new Error(`Failed to fetch product: ${productResponse.status}`);
        }
        
        const productData: Product = await productResponse.json();
        setProduct(productData);
        
        // 🎯 SETELAH AUDIT VIDEO: Pilih image pertama yang bukan video untuk default
        const findFirstNonVideo = () => {
          if (!productData.images.gallery || productData.images.gallery.length === 0) {
            return apiAsset(productData.images.main);
          }
          
          // Cari yang bukan video
          const nonVideo = productData.images.gallery.find(
            img => !isVideo(apiAsset(img))
          );
          
          // Jika ada non-video, gunakan itu
          if (nonVideo) {
            return apiAsset(nonVideo);
          }
          
          // Jika semua video, gunakan main image atau video pertama
          return apiAsset(productData.images.gallery[0] || productData.images.main);
        };
        
        const firstImage = findFirstNonVideo();
        setSelectedImage(firstImage);
        setDisplayedPrice(productData.price);
        
        if (!["Additional", "Softcopy Design"].includes(productData.category)) {
          try {
            const additionalResponse = await apiFetch(`/api/products/additional?category=${productData.category}`);
            if (additionalResponse.ok) {
              const additionalData = await additionalResponse.json();
              setAdditionalProducts(additionalData);
            }
          } catch (additionalError) {
            console.warn("Failed to load additional products:", additionalError);
          }
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  // ===== SET DEFAULT OPTIONS =====
  useEffect(() => {
    if (!product) return;

    const defaults: UserOptions = {};
    
    if (product.options.variations?.[0]) {
      defaults.variation = product.options.variations[0];
    }
    
    if (product.options.frameSizes?.[0]) {
      defaults.frameSize = product.options.frameSizes[0].value;
    }
    
    if (product.options.shadingStyles?.[0]) {
      defaults.shading = product.options.shadingStyles[0].value;
    }
    
    if (product.options.faceCountOptions?.[0]) {
      defaults.faceCount = product.options.faceCountOptions[0];
    }
    
    if (product.options.packagingOptions?.[0]) {
      defaults.packagingOption = product.options.packagingOptions[0].value;
    }

    if (Object.keys(defaults).length > 0) {
      setSelectedOptions(defaults);
    }
  }, [product]);

  // ===== CALCULATE PRICE DENGAN GUARD =====
  useEffect(() => {
    if (!product?.id) return;
    if (Object.keys(debouncedOptions).length === 0) return;

    const calculatePrice = async () => {
      try {
        const response = await apiFetch("/api/products/calculate-price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            options: debouncedOptions
          })
        });

        if (!response.ok) {
          throw new Error(`Price calculation failed: ${response.status}`);
        }
        
        const data = await response.json();
        if (typeof data.price === 'number') {
          setDisplayedPrice(data.price);
        }
      } catch (err) {
        console.error("Error calculating price:", err);
        setDisplayedPrice(product.price);
      }
    };

    calculatePrice();
  }, [product, debouncedOptions]);

  // ===== HANDLE OPTION SELECTION =====
  const handleOptionChange = useCallback((optionType: keyof UserOptions, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionType]: value
    }));
  }, []);

  const handleFrameSizeSelect = useCallback((size: string, images?: string[]) => {
    setSelectedOptions(prev => ({
      ...prev,
      frameSize: size
    }));

    if (images?.length) {
      const apiImages = images.map(img => apiAsset(img));
      setVariationImages(apiImages);
      setSelectedPreviewImage(apiImages[0]);
      setShowPreview(false);
      setTimeout(() => setShowPreview(true), 50);
    } else {
      setVariationImages([]);
      setSelectedPreviewImage(null);
      setShowPreview(false);
    }
  }, []);

  // ===== HANDLE ADD TO CART =====
  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.title,
      price: displayedPrice,
      quantity: quantity,
      imageUrl: apiAsset(product.images.main),
      options: selectedOptions,
      productType: product.category.toLowerCase().includes("frame") ? "frame" : "other",
      timestamp: Date.now()
    });
  };

  // ===== HANDLE ADDITIONAL PRODUCT CLICK =====
  const handleAdditionalProductClick = (additionalProduct: AdditionalProduct) => {
    navigate(`/product/${additionalProduct.id}`);
  };

  // ===== RENDER COMPONENTS =====
  const renderFrameSizeOptions = () => {
    if (!product?.options.frameSizes?.length) return null;

    return (
      <div className="mt-4 md:mt-6 mb-3 md:mb-4">
        <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
          {product.uiText.frameSize}
        </label>
        <div className="flex gap-2 md:gap-4 flex-wrap">
          {product.options.frameSizes.map((opt) => (
            <div
              key={opt.value}
              onClick={() => handleFrameSizeSelect(opt.value, opt.allImages)}
              className={`cursor-pointer box-border overflow-hidden rounded-xl flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2 md:p-3 w-28 h-28 md:w-36 md:h-36 transition-all duration-150 border ${
                selectedOptions.frameSize === opt.value
                  ? "ring-2 ring-blue-500 border-transparent"
                  : "border-gray-300 hover:border-blue-400 hover:shadow-sm"
              }`}
            >
              <img
                src={apiAsset(opt.image)}
                alt={opt.label}
                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl"
              />
              <span className="text-[13px] md:text-base font-medium text-gray-800 text-center">
                {opt.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderShadingOptions = () => {
    if (!product?.options.shadingStyles?.length) return null;

    return (
      <div className="mt-4 md:mt-6 mb-3 md:mb-4">
        <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
          {product.uiText.shadingStyle}
        </label>
        <div className="flex gap-2 md:gap-4 flex-wrap">
          {product.options.shadingStyles.map((opt) => (
            <div
              key={opt.value}
              onClick={() => handleOptionChange("shading", opt.value)}
              className={`cursor-pointer box-border overflow-hidden rounded-xl flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2 md:p-3 w-28 h-28 md:w-36 md:h-36 transition-all duration-150 border ${
                selectedOptions.shading === opt.value
                  ? "ring-2 ring-blue-500 border-transparent"
                  : "border-gray-300 hover:border-blue-400 hover:shadow-sm"
              }`}
            >
              <img
                src={apiAsset(opt.image)}
                alt={opt.label}
                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl"
              />
              <span className="text-[13px] md:text-base font-medium text-gray-800 text-center">
                {opt.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderVariationOptions = () => {
    if (!product?.options.variations?.length) return null;

    return (
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mt-4 space-y-2 md:space-y-0">
        <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold md:translate-y-3">
          {product.uiText.variation}
        </label>
        <div className="flex flex-row flex-wrap gap-2 md:-translate-x-[165px] md:translate-y-2 font-poppinsRegular">
          {product.options.variations.map((variation) => (
            <button
              key={variation}
              onClick={() => handleOptionChange("variation", variation)}
              className={`px-4 md:px-6 py-2 border rounded-md text-[13px] md:text-sm transition-colors ${
                selectedOptions.variation === variation
                  ? "bg-[#dcbec1] border-[#bfa4a6]"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {variation}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderPackagingOptions = () => {
    if (!product?.options.packagingOptions?.length) return null;

    return (
      <div className="mt-4 md:mt-6 mb-3 md:mb-4 font-poppinsSemiBold">
        <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
          {product.uiText.packagingOption || t("product.packagingOption")}
        </label>
        <div className="flex gap-2 md:gap-4 flex-wrap">
          {product.options.packagingOptions.map((opt) => (
            <div
              key={opt.value}
              onClick={() => handleOptionChange("packagingOption", opt.value)}
              className={`cursor-pointer box-border overflow-hidden rounded-xl flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2 md:p-3 w-28 h-28 md:w-36 md:h-36 transition-all duration-150 border ${
                selectedOptions.packagingOption === opt.value
                  ? "ring-2 ring-blue-500 border-transparent"
                  : "border-gray-300 hover:border-blue-400 hover:shadow-sm"
              }`}
            >
              <img
                src={apiAsset(opt.image)}
                alt={opt.label}
                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl"
              />
              <span className="text-[13px] md:text-base font-medium text-gray-800 text-center">
                {opt.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ===== LOADING & ERROR STATES =====
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="text-gray-600 mt-2">{error || "Product not found"}</p>
        <Link to="/products" className="mt-4 text-blue-600 hover:underline">
          {t("product.breadcrumbProducts")}
        </Link>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Breadcrumb */}
        <div className="text-[11px] md:text-[14px] font-poppinsSemiBold mb-4 md:mb-6 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:underline">
            Little Amora
          </Link>{" "}
          &gt;
          <Link to="/products" className="mx-1 hover:underline">
            {t("product.breadcrumbProducts")}
          </Link>{" "}
          &gt;
          <span
            className="mx-1 cursor-pointer hover:underline"
            onClick={() => navigate(`/products?category=${product.category.toLowerCase()}`)}
          >
            {product.category} &gt;
          </span>
          <span className="mx-1 text-black">{product.title}</span>
        </div>

        {/* Product Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-16">
          {/* Gallery Section */}
          <div className="w-full">
            {/* 🎯 SETELAH AUDIT VIDEO: Main Image/Video Render */}
            {isVideo(selectedImage) ? (
              <video
                src={selectedImage}
                controls
                autoPlay
                muted
                loop
                className="w-full h-auto rounded-lg border border-gray-200 mb-3 md:mb-4"
                playsInline
              />
            ) : (
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-auto object-cover rounded-lg border border-gray-200 mb-3 md:mb-4"
              />
            )}
          
            {/* Thumbnails */}
            {product.images.gallery.length > 1 && (
              <div className="relative mt-3 md:mt-4">
                <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-600 rounded-full shadow p-1.5 md:p-2">
                  <FaChevronLeft size={14} className="md:w-[18px] md:h-[18px]" />
                </button>
          
                <Swiper
                  modules={[Navigation]}
                  navigation={{
                    prevEl: ".swiper-button-prev-custom",
                    nextEl: ".swiper-button-next-custom",
                  }}
                  slidesPerView={3}
                  spaceBetween={8}
                  grabCursor={true}
                  className="!px-6 md:!px-8"
                  breakpoints={{
                    0: { slidesPerView: 3, spaceBetween: 8 },
                    640: { slidesPerView: 4, spaceBetween: 10 },
                    1024: { slidesPerView: 5, spaceBetween: 10 },
                  }}
                >
                  {product.images.gallery.map((media: string, idx: number) => {
                    const url = apiAsset(media);
                    const isVideoFile = isVideo(url);
                    
                    return (
                      <SwiperSlide key={idx}>
                        {isVideoFile ? (
                          <video
                            src={url}
                            muted
                            playsInline
                            className={`w-full h-16 md:h-24 object-cover rounded-md border-2 cursor-pointer transition-all duration-200 ${
                              selectedImage === url
                                ? "border-pink-500 scale-105"
                                : "border-gray-200 hover:border-gray-400"
                            }`}
                            onClick={() => setSelectedImage(url)}
                          />
                        ) : (
                          <img
                            src={url}
                            alt={`${product.title} ${idx + 1}`}
                            onClick={() => setSelectedImage(url)}
                            className={`w-full h-16 md:h-24 object-cover rounded-md border-2 cursor-pointer transition-all duration-200 ${
                              selectedImage === url
                                ? "border-pink-500 scale-105"
                                : "border-gray-200 hover:border-gray-400"
                            }`}
                          />
                        )}
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
          
                <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-600 rounded-full shadow p-1.5 md:p-2">
                  <FaChevronRight size={14} className="md:w-[18px] md:h-[18px]" />
                </button>
              </div>
            )}
          
            {/* Preview Images (Frame Size Variation) */}
            {variationImages.length > 0 && (
              <div
                ref={previewRef}
                className="mt-6 md:mt-8"
                style={{
                  opacity: showPreview ? 1 : 0,
                  transform: showPreview ? "translateY(0)" : "translateY(-10px)",
                  transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
                }}
              >
                <h3 className="text-[16px] md:text-[18px] font-poppinsSemiBold mb-3 md:mb-4">
                  {product.uiText.preview || t("product.preview")} {selectedOptions.frameSize}
                </h3>
          
                {selectedPreviewImage && (
                  <img
                    src={selectedPreviewImage}
                    alt={`Preview ${selectedOptions.frameSize}`}
                    onClick={() => setIsZoomOpen(true)}
                    className="w-full h-auto object-contain rounded-lg border border-gray-300 mb-3 md:mb-4 transition-all duration-300 cursor-zoom-in hover:scale-[1.02]"
                  />
                )}
          
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                  {variationImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${selectedOptions.frameSize} ${i + 1}`}
                      onClick={() => setSelectedPreviewImage(img)}
                      className={`w-full aspect-square object-cover rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedPreviewImage === img
                          ? "border-blue-500 scale-105"
                          : "border-gray-200 hover:border-blue-400 hover:shadow-lg"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Zoom Modal (Only for images, not videos) */}
          {isZoomOpen && selectedPreviewImage && !isVideo(selectedPreviewImage) && (
            <div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] animate-fadeIn p-4"
              onClick={() => setIsZoomOpen(false)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomOpen(false);
                }}
                className="absolute top-4 md:top-6 right-4 md:right-6 text-white text-2xl md:text-3xl font-bold hover:text-gray-300 transition"
              >
                ✕
              </button>
          
              <img
                src={selectedPreviewImage}
                alt="Zoomed preview"
                className="max-w-[95%] md:max-w-[90%] max-h-[90%] object-contain rounded-lg shadow-lg border border-gray-400 cursor-zoom-out transition-transform duration-300"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          {/* Info Section */}
          <div className="flex flex-col">
            <h1 className="text-[18px] md:text-[25px] font-poppinsMedium leading-tight">
              {product.title}
            </h1>
          
            {product.isBestSelling && (
              <div className="flex items-center space-x-2 text-yellow-600 px-2 md:px-3 py-1 rounded-full text-[12px] md:text-[15px] font-poppinsMediumItalic w-fit mt-2">
                <FaStar className="w-3 h-3 md:w-4 md:h-4" />
                <span>{product.bestSellingLabel || product.uiText.bestSellingSize}</span>
              </div>
            )}
          
            <p className="text-[24px] md:text-[30px] font-poppinsMedium text-red-600 mt-2">
              Rp {displayedPrice.toLocaleString("id-ID")}
            </p>
          
            {renderPackagingOptions()}
            {renderFrameSizeOptions()}
            {renderShadingOptions()}
            {renderVariationOptions()}
          
            {/* Additional Options will be rendered here */}
            
            <div className="mt-6 md:mt-10">
              <div className="hidden md:flex items-center justify-between">
                <label className="text-[18px] font-poppinsSemiBold">
                  {product.uiText.quantity || t("product.quantity")}
                </label>
                <div className="flex items-center -translate-x-[160px] font-poppinsRegular border border-gray-300 rounded-md w-fit">
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-4 py-2 text-lg font-bold text-gray-700 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuantity(val === "" ? 1 : Math.max(1, Number(val)));
                    }}
                    className="w-16 text-center font-poppinsRegular border-x border-gray-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="px-4 py-2 text-lg font-bold text-gray-700 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
          
              <div className="md:hidden mt-6">
                <label className="block text-[16px] font-poppinsSemiBold mb-3">
                  {product.uiText.quantity || t("product.quantity")}
                </label>
                <div className="flex items-center font-poppinsRegular border border-gray-300 rounded-md w-fit">
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-3 py-2 text-lg font-bold text-gray-700 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuantity(val === "" ? 1 : Math.max(1, Number(val)));
                    }}
                    className="w-14 text-center font-poppinsRegular border-x border-gray-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="px-3 py-2 text-lg font-bold text-gray-700 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          
            <div className="flex flex-col pt-4 font-poppinsSemiBoldi">
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 px-4 md:px-6 py-3 border bg-[#dcbec1] font-poppinsSemiBold rounded-lg hover:bg-[#c7a9ac] transition-colors text-[14px] md:text-base"
                >
                  {product.uiText.addToCart}
                </button>
                <button
                  className="flex-1 px-4 md:px-6 py-3 bg-[#E2DAD8] font-poppinsSemiBold rounded-lg hover:bg-[#D3C7C4] transition-colors text-[14px] md:text-base"
                >
                  {product.uiText.buyNow}
                </button>
              </div>
            
              <p className="mt-6 md:mt-[17%] text-[14px] md:text-[16px] font-poppinsSemiBoldItalic text-black">
                • {product.uiText.priceInfo}
              </p>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-10 md:mt-16 pt-6 md:pt-10">
          <h2 className="text-[20px] md:text-[24px] font-poppinsSemiBold mb-3 md:mb-4">
            {t("product.details")}
          </h2>
          
          {product.uiText.details ? (
            <div className="grid grid-cols-[max-content_max-content_1fr] gap-x-1 md:gap-x-2 gap-y-2 text-[13px] md:text-[15px] items-baseline">
              {Object.entries(product.uiText.details).map(([key, value]) => (
                <React.Fragment key={key}>
                  <span className="font-poppinsSemiBold">{key}</span>
                  <span className="font-poppinsRegular font-bold">:</span>
                  <span className="font-poppinsRegular font-bold">{value}</span>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Product details not available.</p>
          )}
          
          <p className="font-poppinsRegular mt-4 md:mt-6 text-[13px] md:text-base">
            {product.uiText.packingInfo}
            <br />
            <br />
          </p>
        </div>

        {/* Additional Products */}
        {additionalProducts.length > 0 && (
          <div ref={additionalSectionRef} className="mt-10 md:mt-16">
            <h2 className="text-[18px] md:text-xl font-bold font-poppinsRegular mb-4 md:mb-6">
              {t("product.additionalProducts")}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {additionalProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleAdditionalProductClick(item)}
                  className="border rounded-xl overflow-hidden text-center hover:shadow-md transition-all bg-white cursor-pointer flex flex-col items-center justify-between w-full h-[300px] md:h-[360px] hover:scale-105 transition-transform duration-200"
                >
                  <div className="relative w-full aspect-square overflow-hidden">
                    <img
                      src={apiAsset(item.imageUrl)}
                      alt={item.displayName}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 hover:scale-110"
                    />
                  </div>

                  <div className="p-2 md:p-3 flex flex-col flex-grow justify-between w-full">
                    <h3 className="text-[12px] md:text-sm font-semibold text-gray-700 line-clamp-2">
                      {item.displayName}
                    </h3>
                    <p className="text-[12px] md:text-sm font-bold text-pink-600 mt-1">
                      {typeof item.price === 'number' 
                        ? `Rp ${item.price.toLocaleString("id-ID")}`
                        : item.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;