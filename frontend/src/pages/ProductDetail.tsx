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
import { useTranslation } from "react-i18next";
import { apiFetch, apiAsset } from "../utils/api";

type LayoutContext = {
  searchQuery: string;
  addToCart: (item: any) => void;
};

// ===== HELPER FUNCTIONS =====
const isVideo = (url: string): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith('.mp4') || 
         lowerUrl.endsWith('.webm') || 
         lowerUrl.endsWith('.mov') ||
         lowerUrl.includes('.mp4') ||
         lowerUrl.includes('.webm');
};

// ===== TYPES =====
type OptionGroup = {
  id: string;
  type: 'text' | 'image' | 'preview';
  label?: Record<string, string> | string;
  options: Array<{
    value: string;
    label: Record<string, string> | string;
    image?: string;
    preview?: string;
  }>;
};

type Product = {
  id: string;
  name: string;
  title: string;
  category: string;
  subcategory?: string;
  price: number;
  images: {
    main: string;
    gallery: string[];
  };
  uiText: {
    addToCart: string;
    buyNow: string;
    variation?: string;
    frameSize?: string;
    shadingStyle?: string;
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
  details?: Record<string, string>;
  // Field dari backend - SUMBER KEBENARAN SATU-SATUNYA
  optionsResolved?: {
    groups: OptionGroup[];
  };
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

// HANYA INI TYPE UNTUK OPTIONS
type UserOptions = Record<string, string>;

// ===== CUSTOM HOOK: DEBOUNCE =====
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

// ===== CUSTOM HOOK: RESOLVED OPTIONS =====
const useResolvedOptions = (product: Product | null, i18n: any) => {
  const [selectedOptions, setSelectedOptions] = useState<UserOptions>({});
  
  // Set default options saat product atau groups berubah
  useEffect(() => {
  if (!product?.optionsResolved?.groups) return;

  // Jangan override kalau user sudah pilih manual
  if (Object.keys(selectedOptions).length > 0) return;

  const defaults: UserOptions = {};
  const productKey = (product.name || product.title || "").toLowerCase();

  product.optionsResolved.groups.forEach(group => {
    // Cari option yang relevan dengan produk
    const matchedOption = group.options.find(opt =>
      productKey.includes(opt.value.toLowerCase())
    );

    defaults[group.id] = matchedOption
      ? matchedOption.value
      : group.options[0]?.value;
  });

  if (Object.keys(defaults).length > 0) {
    setSelectedOptions(defaults);
  }
}, [
  product?.optionsResolved?.groups,
  product?.name,
  product?.title
]);
  
  const handleOptionChange = useCallback((groupId: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [groupId]: value
    }));
  }, []);
  
  return {
    selectedOptions,
    handleOptionChange,
    setSelectedOptions
  };
};

// ===== MAIN COMPONENT =====
const ProductDetail = () => {

  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useOutletContext<LayoutContext>();

  // ===== STATE =====
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null)
  const [product, setProduct] = useState<Product | null>(null);
  const [additionalProducts, setAdditionalProducts] = useState<AdditionalProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const additionalSectionRef = useRef<HTMLDivElement | null>(null);
  const [displayedPrice, setDisplayedPrice] = useState<number>(0);
  
  // Gunakan hook untuk resolved options
  const { selectedOptions, handleOptionChange, setSelectedOptions } = useResolvedOptions(product, i18n);
  
  // default set variations
  useEffect(() => {
  if (!product?.frames) return

  const { glass, acrylic } = product.frames

  const variations: string[] = []
  if (glass) variations.push("Frame Kaca")
  if (acrylic) variations.push("Frame Acrylic")

  if (variations.length === 0) return

  // Jangan override kalau user sudah memilih
  if (selectedVariation) return

  // Auto pilih variant pertama
  const defaultVariation = variations[0]

  setSelectedVariation(defaultVariation)

  setSelectedOptions(prev => ({
    ...prev,
    frame: defaultVariation === "Frame Kaca" ? "glass" : "acrylic"
  }))
}, [product?.frames])
  
  // ===== AUTO PREVIEW DARI RESOLVER (WAJIB) =====
useEffect(() => {
  if (!product?.optionsResolved?.groups) return;

  // Cari group yang punya image atau preview
  const previewGroup = product.optionsResolved.groups.find(g =>
    g.options.some(o => o.image || o.preview)
  );

  if (!previewGroup) return;

  const selectedValue = selectedOptions[previewGroup.id];
  const option = previewGroup.options.find(o => o.value === selectedValue);

  if (!option) return;

  const previewSrc = option.preview || option.image;
  if (!previewSrc) return;

  const preview = apiAsset(previewSrc);

  setSelectedPreviewImage(preview);
  setShowPreview(true);
}, [product?.optionsResolved?.groups, selectedOptions]);
  
  // Debounce untuk price calculation
  const debouncedOptions = useDebounce(selectedOptions, 300);

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
        
        // Fetch product
        const productResponse = await apiFetch(
          `/api/products/${id}?lang=${i18n.language}`
        );
        if (!productResponse.ok) {
          throw new Error(`Failed to fetch product: ${productResponse.status}`);
        }
        
        const productData: Product = await productResponse.json();
        setProduct(productData);
        
        console.log("Product data loaded:", {
          id: productData.id,
          hasOptionsResolved: !!productData.optionsResolved,
          groups: productData.optionsResolved?.groups?.length || 0
        });
        
        // Set default image dan harga
        const mainImage = apiAsset(productData.images.main);
        setSelectedImage(mainImage);
        setDisplayedPrice(productData.price || 0);
        
        // Fetch additional products jika bukan Additional atau Softcopy
        if (!["Additional", "Softcopy Design"].includes(productData.category)) {
          try {
            const additionalResponse = await apiFetch(
              `/api/products/additional?category=${encodeURIComponent(productData.category)}`
            );
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
  }, [id, i18n.language]);

  // ===== CALCULATE PRICE =====
  useEffect(() => {
    if (!product?.id) return;
    if (Object.keys(debouncedOptions).length === 0) return;

    const fetchCalculatedPrice = async () => {
      try {
        // Filter hanya options yang memiliki nilai
        const sanitizedOptions = Object.fromEntries(
          Object.entries(debouncedOptions).filter(([_, value]) => 
            value && value.trim() !== ""
          )
        );

        // Untuk Softcopy, harga tetap
        if (product.category.includes("Softcopy")) {
          setDisplayedPrice(product.price);
          return;
        }

        if (Object.keys(sanitizedOptions).length === 0) {
          setDisplayedPrice(product.price || 0);
          return;
        }

        console.log('Calculating price with options:', {
          productId: product.id,
          options: sanitizedOptions
        });

        const response = await apiFetch("/api/products/calculate-price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            options: sanitizedOptions
          })
        });

        if (!response.ok) {
          throw new Error(`Price calculation failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Price calculation result:', data);
        
        if (typeof data.price === 'number') {
          setDisplayedPrice(data.price);
        } else {
          setDisplayedPrice(product.price || 0);
        }
      } catch (err) {
        console.error("Error calculating price:", err);
        setDisplayedPrice(product.price || 0);
      }
    };

    fetchCalculatedPrice();
  }, [product, debouncedOptions]);

  // ===== RENDER FUNCTIONS =====
  
  // SATU-SATUNYA RENDERER UNTUK OPTIONS
  const renderOptionGroups = () => {
    if (!product?.optionsResolved?.groups?.length) return null;

    console.log("Rendering option groups:", product.optionsResolved.groups);

    return product.optionsResolved.groups.map(group => {
      // Resolve label berdasarkan bahasa
      const groupLabel = typeof group.label === 'object' 
        ? group.label[i18n.language] || group.label['en'] || group.id
        : group.label || group.id;

      return (
        <div key={group.id} className="mt-4 md:mt-6 mb-3 md:mb-4">
          <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
            {groupLabel}
          </label>
          
<div className="flex gap-2 md:gap-4 flex-wrap">
  {group.options
    .filter(opt => opt.active !== false) // ✅ FILTER DULU
    .map(opt => {
      const optionLabel = typeof opt.label === 'object'
        ? opt.label[i18n.language] || opt.label['en'] || opt.value
        : opt.label || opt.value;

              const isSelected = selectedOptions[group.id] === opt.value;

              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    console.log(`Setting ${group.id} to ${opt.value}`);
                    handleOptionChange(group.id, opt.value);
                    
                  }}
                  className={`cursor-pointer box-border overflow-hidden rounded-xl flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2 md:p-3 w-28 h-28 md:w-36 md:h-36 transition-all duration-150 border ${
                    isSelected
                      ? "ring-2 ring-blue-500 border-transparent"
                      : "border-gray-300 hover:border-blue-400 hover:shadow-sm"
                  }`}
                >
                  {opt.image && (
                    <img
                      src={apiAsset(opt.image)}
                      alt={optionLabel}
                      className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl"
                      onError={(e) => {
                        e.currentTarget.src = "/api/uploads/images/placeholder/option-default.jpg";
                      }}
                    />
                  )}
                  
                  {!opt.image && (
                    <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gray-100 rounded-xl">
                      <span className="text-[13px] md:text-[15px] font-semibold text-gray-800 text-center leading-tight px-2">
                        {optionLabel}
                      </span>
                    </div>
                  )}
                  
                  <span className="text-[13px] md:text-base font-medium text-gray-800 text-center">
                    {optionLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };
  
const renderFrameOptions = () => {
  if (!product?.frames) return null
  if (!product.category.toLowerCase().includes("frame")) return null

  const { glass, acrylic } = product.frames
  if (!glass && !acrylic) return null

  const variations: string[] = []
  if (glass) variations.push("Frame Kaca")
  if (acrylic) variations.push("Frame Acrylic")

  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between mt-4 space-y-2 md:space-y-0">
      <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold md:translate-y-3">
        {t("product.variation")}
      </label>

      <div className="flex flex-row flex-wrap gap-2 md:-translate-x-[165px] md:translate-y-2 font-poppinsRegular">
        {variations.map((variation) => {
          let displayText = variation
          if (variation === "Frame Kaca") displayText = t("product.frameGlass")
          if (variation === "Frame Acrylic") displayText = t("product.frameAcrylic")

          return (
            <button
              key={variation}
              onClick={() => {
                setSelectedVariation(variation)

                setSelectedOptions(prev => ({
                  ...prev,
                  frame: variation === "Frame Kaca" ? "glass" : "acrylic"
                }))
              }}
              className={`px-4 md:px-6 py-2 border rounded-md text-[13px] md:text-sm transition-colors ${
                selectedVariation === variation
                  ? "bg-[#dcbec1] border-[#bfa4a6]"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {displayText}
            </button>
          )
        })}
      </div>
    </div>
  )
}


  const renderBestSellingLabel = () => {
  if (!product?.bestSelling?.enabled) return null

  const text =
    product.bestSelling.label?.[i18n.language] ||
    product.bestSelling.label?.en

  if (!text) return null

  return (
    <div className="flex items-center space-x-2 text-yellow-600 px-2 md:px-3 py-1 rounded-full text-[12px] md:text-[15px] font-poppinsMediumItalic w-fit mt-2">
      <FaStar className="w-3 h-3 md:w-4 md:h-4" />
      <span>{text}</span>
    </div>
  )
}

// ===== HANDLERS =====
  const handleAddToCart = () => {
    if (!product) return;

    console.log("➕ Adding to cart with options:", selectedOptions);

    // SIMPLIFIED: Hanya kirim data minimal
    // CartContext akan fetch optionsResolved sendiri dari backend
    const cartItem = {
      id: product.id,
      name: product.name || product.title,
      title: product.title,
      price: displayedPrice,
      quantity: quantity,
      imageUrl: apiAsset(product.images?.main || ""),
      image: apiAsset(product.images?.main || ""),
      options: selectedOptions, // User selections
      productType: (product.category || "").toLowerCase().includes("frame") 
        ? "frame" as const 
        : "other" as const,
      category: product.category,
    };

    console.log("➕ Cart item to add:", cartItem);
    addToCart(cartItem);
    
    // Optional: Show success message
    // toast.success("Product added to cart!");
  };

  const handleAdditionalProductClick = (additionalProduct: AdditionalProduct) => {
    navigate(`/product/${additionalProduct.id}`);
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

  // Check product type
  const isAdditional = (product.category || "").includes("Additional");
  const is2D = (product.category || "").toLowerCase().includes("2d");
  const is3D = (product.category || "").toLowerCase().includes("3d");
  const isSoftcopy = (product.category || "").toLowerCase().includes("softcopy");

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
            onClick={() => navigate(`/products?category=${(product.category || "").toLowerCase()}`)}
          >
            {product.category || "Unknown"} &gt;
          </span>
          <span className="mx-1 text-black">{product.title || "Untitled Product"}</span>
        </div>

        {/* Product Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-16">
          {/* Left: Gallery Section */}
          <div className="w-full">
            {/* Main Image/Video */}
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
                alt={product.title || "Product"}
                className="w-full h-auto object-cover rounded-lg border border-gray-200 mb-3 md:mb-4"
                onError={(e) => {
                  e.currentTarget.src = "/api/uploads/images/placeholder/product-default.jpg";
                }}
              />
            )}
            
            {/* Thumbnails */}
            {product.images?.gallery?.length > 1 && (
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
                            alt={`${product.title || "Product"} ${idx + 1}`}
                            onClick={() => setSelectedImage(url)}
                            className={`w-full h-16 md:h-24 object-cover rounded-md border-2 cursor-pointer transition-all duration-200 ${
                              selectedImage === url
                                ? "border-pink-500 scale-105"
                                : "border-gray-200 hover:border-gray-400"
                            }`}
                            onError={(e) => {
                              e.currentTarget.src = "/api/uploads/images/placeholder/product-thumb.jpg";
                            }}
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
            
            {/* Preview Images */}
            {selectedPreviewImage && showPreview && (
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
                  {product.uiText?.preview || t("product.preview")}
                </h3>
            
                <img
                  src={selectedPreviewImage}
                  alt="Preview"
                  onClick={() => setIsZoomOpen(true)}
                  className="w-full h-auto object-contain rounded-lg border border-gray-300 mb-3 md:mb-4 transition-all duration-300 cursor-zoom-in hover:scale-[1.02]"
                  onError={(e) => {
                    e.currentTarget.src = "/api/uploads/images/placeholder/preview-default.jpg";
                  }}
                />
              </div>
            )}
          </div>
            
          {/* Zoom Modal */}
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
                onError={(e) => {
                  e.currentTarget.src = "/api/uploads/images/placeholder/zoom-default.jpg";
                }}
              />
            </div>
          )}
            
          {/* Right: Info Section */}
          <div className="flex flex-col">
            <h1 className="text-[18px] md:text-[25px] font-poppinsMedium leading-tight">
              {product.title || "Untitled Product"}
            </h1>
            
            {renderBestSellingLabel()}
            
            <p className="text-[24px] md:text-[30px] font-poppinsMedium text-red-600 mt-2">
              Rp {displayedPrice.toLocaleString("id-ID")}
            </p>
            
            {/* SATU-SATUNYA RENDERER OPTIONS */}
            {renderOptionGroups()}
            {renderFrameOptions()}
            
            
            {/* Quantity */}
            <div className="mt-6 md:mt-10">
              <div className="hidden md:flex items-center justify-between">
                <label className="text-[18px] font-poppinsSemiBold">
                  {product.uiText?.quantity || t("product.quantity")}
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
                  {product.uiText?.quantity || t("product.quantity")}
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
            
            {/* Buttons */}
            <div className="flex flex-col pt-4 font-poppinsSemiBold">
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 px-4 md:px-6 py-3 border bg-[#dcbec1] font-poppinsSemiBold rounded-lg hover:bg-[#c7a9ac] transition-colors text-[14px] md:text-base"
                >
                  {product.uiText?.addToCart || t("product.addToCart")}
                </button>
                <button
                  className="flex-1 px-4 md:px-6 py-3 bg-[#E2DAD8] font-poppinsSemiBold rounded-lg hover:bg-[#D3C7C4] transition-colors text-[14px] md:text-base"
                >
                  {product.uiText?.buyNow || t("product.buyNow")}
                </button>
              </div>
              
              {product.uiText?.priceInfo && (
                <p className="mt-6 md:mt-[17%] text-[14px] md:text-[16px] font-poppinsSemiBoldItalic text-black">
                  • {product.uiText.priceInfo}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-10 md:mt-16 pt-6 md:pt-10">
          <h2 className="text-[20px] md:text-[24px] font-poppinsSemiBold mb-3 md:mb-4">
            {t("product.details")}
          </h2>
            
          {(product.uiText?.details || product.details) ? (
            <div className="grid grid-cols-[max-content_max-content_1fr] gap-x-1 md:gap-x-2 gap-y-2 text-[13px] md:text-[15px] items-baseline">
              {Object.entries(product.uiText?.details || product.details || {}).map(([key, value]) => (
                <React.Fragment key={key}>
                  <span className="font-poppinsSemiBold">{key}</span>
                  <span className="font-poppinsRegular">:</span>
                  <span className="font-poppinsRegular">{value}</span>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Product details not available.</p>
          )}
            
          {product.uiText?.packingInfo && (
            <p className="font-poppinsRegular mt-4 md:mt-6 text-[13px] md:text-base">
              {product.uiText.packingInfo}
              <br />
              <br />
            </p>
          )}
        </div>

        {/* Additional Products - Tidak ditampilkan untuk produk Additional */}
        {!isAdditional && additionalProducts.length > 0 && (
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
                      onError={(e) => {
                        e.currentTarget.src = "/api/uploads/images/placeholder/additional-default.jpg";
                      }}
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