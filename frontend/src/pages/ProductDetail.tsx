import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  preview?: string;
};

type SpecialVariation = {
  value: string;
  label: string;
  image?: string;
};

type Product = {
  id: string;
  name: string;
  title: string;
  category: string;
  subcategory?: string;
  size?: string;
  type?: string;
  price: number;
  images: {
    main: string;
    gallery: string[];
  };
  options?: {
    variations?: string[];
    frameSizes?: FrameSizeOption[];
    shadingStyles?: ShadingStyleOption[];
    faceCountOptions?: string[];
    expressOptions?: string[];
    acrylicSizes?: string[];
    acrylicStandOptions?: string[];
    packagingOptions?: PackagingOption[];
    specialVariations?: SpecialVariation[];
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
  shadingOptions?: ShadingStyleOption[];
  sizeFrameOptions?: FrameSizeOption[];
  specialVariations?: SpecialVariation[];
  details?: Record<string, string>;
  hasDescriptionData?: boolean;
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

type UserOptions = {
  frameSize?: string;
  shading?: string;
  variation?: string;
  faceCount?: string;
  expressOption?: string;
  acrylicSize?: string;
  acrylicStandOption?: string;
  packagingOption?: string;
  specialVariation?: string;
};

// ===== OPTIONS DATA FALLBACK =====
const getAdditionalOptions = (productName: string = "", productCategory: string = "") => {
  const name = (productName || "").toLowerCase();
  const category = (productCategory || "").toLowerCase();
  
  // Biaya Tambahan Wajah Karikatur
  if (name.includes("biaya tambahan wajah karikatur") || name.includes("tambahan wajah karikatur")) {
    return {
      faceCountOptions: ["1–9 Wajah", "Di atas 10 Wajah"]
    };
  }
  
  // Biaya Tambahan Wajah Banyak (Design dari Customer)
  if (name.includes("biaya tambahan wajah banyak") || name.includes("tambahan wajah banyak")) {
    return {
      faceCountOptions: ["1–9 Wajah", "Di atas 10 Wajah"]
    };
  }
  
  // Biaya Ekspress General
  if (name.includes("biaya ekspress") || name.includes("biaya express") || name.includes("ekspress")) {
    return {
      expressOptions: ["Option 1", "Option 2", "Option 3"]
    };
  }
  
  // Biaya Tambahan Ganti Frame Kaca ke Acrylic
  if (name.includes("ganti frame kaca ke acrylic") || name.includes("acrylic frame") || 
      (category.includes("additional") && name.includes("acrylic"))) {
    return {
      acrylicSizes: ["A2", "A1", "A0"]
    };
  }
  
  // Background Custom
  if (name.includes("background custom") || name.includes("custom background")) {
    return {
      variations: ["Default Background", "Custom Background"]
    };
  }
  
  // Acrylic Stand 3mm
  if ((name.includes("acrylic stand") && name.includes("3mm")) || 
      (category.includes("acrylic") && name.includes("3mm"))) {
    return {
      acrylicStandOptions: ["15x15cm 1 sisi", "A4 2 sisi", "A3 2 sisi"]
    };
  }
  
  // Additional Packing
  if (name.includes("additional packing") || name.includes("tambahan packing") || 
      name.includes("biaya tambahan packing")) {
    return {
      variations: ["Standard Packing", "Premium Packing"]
    };
  }
  
  return null;
};

// ===== 2D FRAME SIZE OPTIONS =====
const get2DFrameSizes = () => [
  {
    value: "4r",
    label: "4R",
    image: "/api/uploads/images/list-products/2D/variation/frame/4R/4R.jpg"
  },
  {
    value: "15cm",
    label: "15x15cm",
    image: "/api/uploads/images/list-products/2D/variation/frame/15cm/15cm.jpg"
  },
  {
    value: "6r",
    label: "6R",
    image: "/api/uploads/images/list-products/2D/variation/frame/6R/6R.jpg"
  },
  {
    value: "8r",
    label: "8R",
    image: "/api/uploads/images/list-products/2D/variation/frame/8R/8R.jpg"
  },
  {
    value: "12r",
    label: "12R",
    image: "/api/uploads/images/list-products/2D/variation/frame/12R/12R.jpg"
  }
];

// ===== CUSTOM HOOKS =====
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

// ===== MAIN COMPONENT =====
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
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [variationImages, setVariationImages] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const additionalSectionRef = useRef<HTMLDivElement | null>(null);

  // ===== EFFECTIVE OPTIONS CALCULATION =====
  const effectiveOptions = useMemo(() => {
    if (!product) return null;

    const category = (product.category || "").toLowerCase();
    const name = (product.name || "").toLowerCase();
    const title = (product.title || "").toLowerCase();
    const is3D = category.includes("3d");
    const is2D = category.includes("2d");
    const is8R = name.includes("8r") || title.includes("8r");
    const isAcrylicStand = category.includes("acrylic") || name.includes("acrylic");
    const isAdditional = category.includes("additional");
    const isSoftcopy = category.includes("softcopy");

    // Jika Additional product, gunakan data dari getAdditionalOptions
    if (isAdditional) {
      const additionalOpts = getAdditionalOptions(product.name, product.category);
      return {
        // Prioritize product.options, then fallback to additionalOpts
        variations: product.options?.variations || additionalOpts?.variations || [],
        faceCountOptions: product.options?.faceCountOptions || additionalOpts?.faceCountOptions || [],
        expressOptions: product.options?.expressOptions || additionalOpts?.expressOptions || [],
        acrylicSizes: product.options?.acrylicSizes || additionalOpts?.acrylicSizes || [],
        acrylicStandOptions: product.options?.acrylicStandOptions || additionalOpts?.acrylicStandOptions || [],
        // Other options are typically not needed for additional products
        frameSizes: product.options?.frameSizes || [],
        shadingStyles: product.options?.shadingStyles || [],
        packagingOptions: product.options?.packagingOptions || [],
        specialVariations: product.options?.specialVariations || [],
      };
    }

    // Untuk produk reguler (non-additional)
    return {
      // Variations
      variations: product.options?.variations?.length 
        ? product.options.variations 
        : (is3D || is2D) && !isAcrylicStand && !isAdditional && !isSoftcopy
          ? ["Frame Kaca", "Frame Acrylic"]
          : [],

      // Frame Sizes - Hanya untuk 2D, 3D tidak perlu frame sizes
      frameSizes: product.options?.frameSizes?.length 
        ? product.options.frameSizes 
        : product.sizeFrameOptions?.length
          ? product.sizeFrameOptions
          : is2D
            ? get2DFrameSizes()
            : [],

      // Shading Styles - Include Background Catalog (hanya untuk 2D)
shadingStyles: is2D
  ? [
      {
        value: "simple",
        label: "Simple Shading",
        image: apiAsset("images/list-products/2D/variation/shading/2D SIMPLE SHADING/2D SIMPLE SHADING.jpg")
      },
      {
        value: "background-catalog",
        label: "Background Catalog",
        image: apiAsset("images/list-products/2D/variation/shading/2D BACKGROUND CATALOG/1.jpg")
      },
      {
        value: "bold",
        label: "Bold Shading",
        image: apiAsset("images/list-products/2D/variation/shading/2D BOLD SHADING/2D BOLD SHADING.jpg")
      },
      {
        value: "ai",
        label: "AI Generated",
        image: apiAsset("images/list-products/2D/variation/shading/2D BY AI/1.jpg")
      }
    ]
  : product.options?.shadingStyles || [],

      // Packaging Options untuk 8R (3D)
      packagingOptions: product.options?.packagingOptions?.length 
        ? product.options.packagingOptions 
        : is8R && is3D
          ? [
              { value: "duskraft", label: "Dus Kraft + Paperbag", image: "/api/uploads/images/list-products/3D/12R/PACKING_HARDBOX.jpg" },
              { value: "hardbox", label: "Black Hardbox + Paperbag", image: "/api/uploads/images/list-products/3D/12R/PACKING_HARDBOX.jpg" },
            ]
          : [],

      // Face Count Options
      faceCountOptions: product.options?.faceCountOptions?.length 
        ? product.options.faceCountOptions 
        : name.includes("karikatur") || name.includes("wajah")
          ? ["1–9 Wajah", "Di atas 10 Wajah"]
          : [],

      // Express Options
      expressOptions: product.options?.expressOptions?.length 
        ? product.options.expressOptions 
        : name.includes("express") || name.includes("ekspress")
          ? ["Option 1", "Option 2", "Option 3"]
          : [],

      // Acrylic Sizes
      acrylicSizes: product.options?.acrylicSizes?.length 
        ? product.options.acrylicSizes 
        : (name.includes("acrylic") && name.includes("ganti")) || 
          (isAdditional && name.includes("acrylic"))
          ? ["A2", "A1", "A0"]
          : [],

      // Acrylic Stand Options
      acrylicStandOptions: product.options?.acrylicStandOptions?.length 
        ? product.options.acrylicStandOptions 
        : isAcrylicStand && name.includes("3mm")
          ? ["15x15cm 1 sisi", "A4 2 sisi", "A3 2 sisi"]
          : [],

      // Special Variations
      specialVariations: product.options?.specialVariations?.length 
        ? product.options.specialVariations 
        : product.specialVariations?.length
          ? product.specialVariations
          : [],
    };
  }, [product]);

  const options = effectiveOptions;

  // ===== DEBOUNCE =====
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
        
        // Fetch product
        const productResponse = await apiFetch(`/api/products/${id}`);
        if (!productResponse.ok) {
          throw new Error(`Failed to fetch product: ${productResponse.status}`);
        }
        
        const productData: Product = await productResponse.json();
        setProduct(productData);
        
        // Set default image
        const findFirstNonVideo = () => {
          if (!productData.images?.gallery || productData.images.gallery.length === 0) {
            return apiAsset(productData.images?.main || "");
          }
          
          const nonVideo = productData.images.gallery.find(
            img => !isVideo(apiAsset(img))
          );
          
          if (nonVideo) {
            return apiAsset(nonVideo);
          }
          
          return apiAsset(productData.images.gallery[0] || productData.images?.main || "");
        };
        
        const firstImage = findFirstNonVideo();
        setSelectedImage(firstImage);
        setDisplayedPrice(productData.price || 0);
        
        // Fetch additional products if not Additional or Softcopy
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
  }, [id]);

  // ===== SET DEFAULT OPTIONS =====
  useEffect(() => {
    if (!product || !options) return;
    
    // Only set defaults if selectedOptions is empty
    if (Object.keys(selectedOptions).length > 0) return;

    const defaults: UserOptions = {};
    
    // Set variation default
    if (options.variations?.[0]) {
      defaults.variation = options.variations[0];
    }
    
    // Set frame size default (hanya untuk 2D)
    if (options.frameSizes?.[0] && product.category.toLowerCase().includes("2d")) {
      defaults.frameSize = options.frameSizes[0].value;
    }
    
    // Set shading default (hanya untuk 2D)
    if (options.shadingStyles?.length && product.category.toLowerCase().includes("2d")) {
      const simpleShading = options.shadingStyles.find(opt => 
        opt.label.toLowerCase().includes("simple")
      );
      defaults.shading = simpleShading ? simpleShading.value : options.shadingStyles[0].value;
    }
    
    // Set face count default (khusus Additional)
    if (options.faceCountOptions?.[0] && product.category.includes("Additional")) {
      defaults.faceCount = options.faceCountOptions[0];
    }
    
    // Set packaging default (untuk 3D 8R)
    if (options.packagingOptions?.[0]) {
      defaults.packagingOption = options.packagingOptions[0].value;
    }
    
    // Set special variation default
    if (options.specialVariations?.[0]) {
      defaults.specialVariation = options.specialVariations[0].value;
    }
    
    // Set express option default (khusus Additional)
    if (options.expressOptions?.[0] && product.category.includes("Additional")) {
      defaults.expressOption = options.expressOptions[0];
    }
    
    // Set acrylic size default (khusus Additional)
    if (options.acrylicSizes?.[0] && product.category.includes("Additional")) {
      defaults.acrylicSize = options.acrylicSizes[0];
    }
    
    // Set acrylic stand option default (khusus Additional/Acrylic)
    if (options.acrylicStandOptions?.[0] && 
        (product.category.includes("Additional") || product.category.includes("Acrylic"))) {
      defaults.acrylicStandOption = options.acrylicStandOptions[0];
    }

    if (Object.keys(defaults).length > 0) {
      setSelectedOptions(defaults);
    }
  }, [product, options, selectedOptions]);

  // ===== CALCULATE PRICE =====
  useEffect(() => {
    if (!product?.id) return;
    if (Object.keys(debouncedOptions).length === 0) return;

    const fetchCalculatedPrice = async () => {
      try {
        const sanitizedOptions = Object.fromEntries(
          Object.entries(debouncedOptions).filter(([_, value]) => 
            value && value.trim() !== ""
          )
        );

        if (Object.keys(sanitizedOptions).length === 0) {
          setDisplayedPrice(product.price || 0);
          return;
        }

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
        if (typeof data.price === 'number') {
          setDisplayedPrice(data.price);
        }
      } catch (err) {
        console.error("Error calculating price:", err);
        setDisplayedPrice(product.price || 0);
      }
    };

    fetchCalculatedPrice();
  }, [product, debouncedOptions]);

  // ===== HANDLERS =====
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

  if (images && images.length > 0) {
    const apiImages = images.map(img => apiAsset(img));

    setVariationImages(apiImages);
    setSelectedPreviewImage(apiImages[0]); // WAJIB
    setShowPreview(true);
    setIsZoomOpen(false); // reset modal
  } else {
    setVariationImages([]);
    setSelectedPreviewImage(null);
    setShowPreview(false);
    setIsZoomOpen(false);
  }
}, []);

  const handleAddToCart = () => {
    if (!product) return;

    // Prepare cart item berdasarkan tipe produk
    const cartItem = {
      id: product.id,
      name: product.name || product.title,
      title: product.title,
      price: displayedPrice,
      quantity: quantity,
      imageUrl: apiAsset(product.images?.main || ""),
      options: selectedOptions,
      productType: (product.category || "").toLowerCase().includes("frame") ? "frame" : "other",
      timestamp: Date.now(),
      category: product.category,
      attributes: {
        // Attributes umum
        frameSize: selectedOptions.frameSize,
        shadingStyle: selectedOptions.shading,
        variation: selectedOptions.variation,
        packagingOption: selectedOptions.packagingOption,
        
        // Attributes khusus Additional
        faceCount: selectedOptions.faceCount,
        expressOption: selectedOptions.expressOption,
        acrylicSize: selectedOptions.acrylicSize,
        acrylicStandOption: selectedOptions.acrylicStandOption,
        specialVariation: selectedOptions.specialVariation,
        
        // Flags
        isAdditionalProduct: (product.category || "").includes("Additional"),
        isAcrylicStand: (product.category || "").includes("Acrylic"),
        isKarikaturProduct: (product.name || "").toLowerCase().includes("karikatur") || false,
        isManyFacesProduct: (product.name || "").toLowerCase().includes("wajah banyak") || false,
        isExpressProduct: (product.name || "").toLowerCase().includes("ekspress") || false,
        isAcrylicChange: (product.name || "").toLowerCase().includes("ganti frame") || false,
      }
    };

    addToCart(cartItem);
  };

  const handleAdditionalProductClick = (additionalProduct: AdditionalProduct) => {
    navigate(`/product/${additionalProduct.id}`);
  };

  // ===== RENDER FUNCTIONS =====
  const renderBestSellingLabel = () => {
    if (!product) return null;

    const category = (product.category || "").toLowerCase();
    const name = (product.name || "").toLowerCase();
    const title = (product.title || "").toLowerCase();

    if (category.includes("3d") && (/\b12r\b/.test(name) || /\b12r\b/.test(title))) {
      return (
        <div className="flex items-center space-x-2 text-yellow-600 px-2 md:px-3 py-1 rounded-full text-[12px] md:text-[15px] font-poppinsMediumItalic w-fit mt-2">
          <FaStar className="w-3 h-3 md:w-4 md:h-4" />
          <span>{product.uiText?.bestSellingSize || t("product.bestSellingSize")}</span>
        </div>
      );
    }

    if (category.includes("2d")) {
      return (
        <div className="flex items-center space-x-2 text-yellow-600 px-2 md:px-3 py-1 rounded-full text-[12px] md:text-[15px] font-poppinsMediumItalic w-fit mt-2">
          <FaStar className="w-3 h-3 md:w-4 md:h-4" />
          <span>{product.uiText?.bestSellingGift || t("product.bestSellingGift")}</span>
        </div>
      );
    }

    return null;
  };

  // Function untuk merender Face Count Options (khusus Additional)
  const renderFaceCountOptions = () => {
    if (!options?.faceCountOptions?.length) return null;

    return (
      <div className="mt-4 md:mt-6 mb-3 md:mb-4">
        <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
          {t("product.chooseFaceCount")}
        </label>
        <p className="text-[13px] md:text-[15px] font-poppinsRegular text-gray-700 mb-2 md:mb-3">
          Pilih jumlah wajah yang ingin ditambahkan
        </p>
        <div className="flex gap-2 md:gap-4 flex-wrap">
          {options.faceCountOptions.map((option) => (
            <div
              key={option}
              onClick={() => handleOptionChange("faceCount", option)}
              className={`cursor-pointer box-border overflow-hidden rounded-xl flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2 md:p-3 w-28 h-28 md:w-36 md:h-36 transition-all duration-150 border ${
                selectedOptions.faceCount === option
                  ? "ring-2 ring-blue-500 border-transparent"
                  : "border-gray-300 hover:border-blue-400 hover:shadow-sm"
              }`}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gray-100 rounded-xl">
                <span className="text-[14px] md:text-lg font-semibold text-gray-800 text-center leading-tight px-2">
                  {option}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Function untuk merender Express Options (khusus Additional)
  const renderExpressOptions = () => {
    if (!options?.expressOptions?.length) return null;

    return (
      <div className="mt-4 md:mt-6 mb-3 md:mb-4">
        <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
          {t("product.chooseExpress")}
        </label>
        <p className="text-[13px] md:text-[15px] font-poppinsRegular text-gray-700 mb-2 md:mb-3">
          Pilih opsi express yang diinginkan
        </p>
        <div className="flex gap-2 md:gap-4 flex-wrap">
          {options.expressOptions.map((option) => (
            <div
              key={option}
              onClick={() => handleOptionChange("expressOption", option)}
              className={`cursor-pointer box-border overflow-hidden rounded-xl flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2 md:p-3 w-28 h-28 md:w-36 md:h-36 transition-all duration-150 border ${
                selectedOptions.expressOption === option
                  ? "ring-2 ring-blue-500 border-transparent"
                  : "border-gray-300 hover:border-blue-400 hover:shadow-sm"
              }`}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gray-100 rounded-xl">
                <span className="text-[13px] md:text-[15px] font-semibold text-gray-800 text-center leading-tight">
                  {option}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Function untuk merender Acrylic Size Options (khusus Additional)
  const renderAcrylicSizeOptions = () => {
    if (!options?.acrylicSizes?.length) return null;

    return (
      <div className="mt-4 md:mt-6 mb-3 md:mb-4">
        <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
          {t("product.chooseAcrylicSize")}
        </label>
        <p className="text-[13px] md:text-[15px] font-poppinsRegular text-gray-700 mb-2 md:mb-3">
          Pilih ukuran acrylic yang diinginkan
        </p>
        <div className="flex gap-2 md:gap-4 flex-wrap">
          {options.acrylicSizes.map((size) => (
            <div
              key={size}
              onClick={() => handleOptionChange("acrylicSize", size)}
              className={`cursor-pointer box-border overflow-hidden rounded-xl flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2 md:p-3 w-28 h-28 md:w-36 md:h-36 transition-all duration-150 border ${
                selectedOptions.acrylicSize === size
                  ? "ring-2 ring-blue-500 border-transparent"
                  : "border-gray-300 hover:border-blue-400 hover:shadow-sm"
              }`}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gray-100 rounded-xl">
                <span className="text-3xl md:text-4xl font-bold text-gray-400">{size}</span>
              </div>
              <span className="text-[13px] md:text-base font-medium text-gray-800 text-center">{size}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Function untuk merender Acrylic Stand Options
  const renderAcrylicStandOptions = () => {
    if (!options?.acrylicStandOptions?.length) return null;

    return (
      <div className="mt-4 md:mt-6 mb-3 md:mb-4">
        <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
          {t("product.chooseSizeAndSides")}
        </label>
        <div className="flex gap-2 md:gap-4 flex-wrap">
          {options.acrylicStandOptions.map((option) => (
            <div
              key={option}
              onClick={() => handleOptionChange("acrylicStandOption", option)}
              className={`cursor-pointer box-border overflow-hidden rounded-xl flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2 md:p-3 w-28 h-28 md:w-36 md:h-36 transition-all duration-150 border ${
                selectedOptions.acrylicStandOption === option
                  ? "ring-2 ring-blue-500 border-transparent"
                  : "border-gray-300 hover:border-blue-400 hover:shadow-sm"
              }`}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gray-100 rounded-xl">
                <span className="text-[13px] md:text-[15px] font-semibold text-gray-800 text-center leading-tight px-2">
                  {option}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPackagingOptions = () => {
    if (!options?.packagingOptions?.length) return null;

    return (
      <div className="mt-4 md:mt-6 mb-3 md:mb-4 font-poppinsSemiBold">
        <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
          {product?.uiText?.packagingOption || t("product.packagingOption")}
        </label>
        <div className="flex gap-2 md:gap-4 flex-wrap">
          {options.packagingOptions.map((opt) => (
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
                onError={(e) => {
                  e.currentTarget.src = "/api/uploads/images/placeholder/packaging-default.jpg";
                }}
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

  const renderFrameSizeOptions = () => {
    // Hanya render untuk produk 2D
    if (!options?.frameSizes?.length || !product?.category.toLowerCase().includes("2d")) {
      return null;
    }

    // Urutkan frame sizes
    const sortedFrameSizes = [...options.frameSizes].sort((a, b) => {
      const order = ["4r", "15cm", "6r", "8r", "12r"];
      const aIndex = order.indexOf(a.value.toLowerCase());
      const bIndex = order.indexOf(b.value.toLowerCase());
      
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      
      return aIndex - bIndex;
    });

    // Fungsi untuk mendapatkan label yang benar
    const getDisplayLabel = (value: string) => {
      const labelMap: Record<string, string> = {
        "4r": "4R",
        "15cm": "15x15cm",
        "6r": "6R",
        "8r": "8R",
        "12r": "12R"
      };
      return labelMap[value.toLowerCase()] || value;
    };

    return (
      <div className="mt-4 md:mt-6 mb-3 md:mb-4">
        <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
          {product?.uiText?.frameSize || t("product.frameSize")}
        </label>
        <div className="flex gap-2 md:gap-4 flex-wrap">
          {sortedFrameSizes.map((opt) => (
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
                onError={(e) => {
                  e.currentTarget.src = "/api/uploads/images/placeholder/frame-default.jpg";
                }}
              />
              <span className="text-[13px] md:text-base font-medium text-gray-800 text-center">
                {getDisplayLabel(opt.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderShadingOptions = () => {
    // Hanya render untuk produk 2D
    if (!options?.shadingStyles?.length || !product?.category.toLowerCase().includes("2d")) {
      return null;
    }

    return (
      <div className="mt-4 md:mt-6 mb-3 md:mb-4">
        <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
          {product?.uiText?.shadingStyle || t("product.shadingStyle")}
        </label>
        <div className="flex gap-2 md:gap-4 flex-wrap">
          {options.shadingStyles.map((opt) => (
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
  src={opt.image || opt.preview || "/api/uploads/images/placeholder/shading-default.jpg"}
  alt={opt.label}
  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl"
  onError={(e) => {
    e.currentTarget.src = "/api/uploads/images/placeholder/shading-default.jpg";
  }}
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
    if (!options?.variations?.length) return null;

    return (
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mt-4 space-y-2 md:space-y-0">
        <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold md:translate-y-3">
          {product?.uiText?.variation || t("product.variation")}
        </label>
        <div className="flex flex-row flex-wrap gap-2 md:-translate-x-[165px] md:translate-y-2 font-poppinsRegular">
          {options.variations.map((variation) => (
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

  const renderSpecialVariations = () => {
    if (!options?.specialVariations?.length) return null;

    return (
      <div className="mt-4 md:mt-6 mb-3 md:mb-4 font-poppinsSemiBold">
        <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
          {t("product.packagingOption")}
        </label>
        <div className="flex gap-2 md:gap-4 flex-wrap">
          {options.specialVariations.map((opt) => (
            <div
              key={opt.value}
              onClick={() => handleOptionChange("specialVariation", opt.value)}
              className={`cursor-pointer box-border overflow-hidden rounded-xl flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2 md:p-3 w-28 h-28 md:w-36 md:h-36 transition-all duration-150 border ${
                selectedOptions.specialVariation === opt.value
                  ? "ring-2 ring-blue-500 border-transparent"
                  : "border-gray-300 hover:border-blue-400 hover:shadow-sm"
              }`}
            >
              {opt.image && (
                <img
                  src={apiAsset(opt.image)}
                  alt={opt.label}
                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl"
                  onError={(e) => {
                    e.currentTarget.src = "/api/uploads/images/placeholder/variation-default.jpg";
                  }}
                />
              )}
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

  // Check if product is Additional
  const isAdditional = (product.category || "").includes("Additional");
  const is2D = (product.category || "").toLowerCase().includes("2d");
  const is3D = (product.category || "").toLowerCase().includes("3d");

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
                  {product.uiText?.preview || t("product.preview")} {selectedOptions.frameSize}
                </h3>
            
                {selectedPreviewImage && (
                  <img
                    src={selectedPreviewImage}
                    alt={`Preview ${selectedOptions.frameSize}`}
                    onClick={() => setIsZoomOpen(true)}
                    className="w-full h-auto object-contain rounded-lg border border-gray-300 mb-3 md:mb-4 transition-all duration-300 cursor-zoom-in hover:scale-[1.02]"
                    onError={(e) => {
                      e.currentTarget.src = "/api/uploads/images/placeholder/preview-default.jpg";
                    }}
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
                      onError={(e) => {
                        e.currentTarget.src = "/api/uploads/images/placeholder/variation-thumb.jpg";
                      }}
                    />
                  ))}
                </div>
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
            
            {/* Render semua options berdasarkan tipe produk */}
            {isAdditional ? (
              // Options khusus Additional Products
              <>
                {renderFaceCountOptions()}
                {renderExpressOptions()}
                {renderAcrylicSizeOptions()}
                {renderAcrylicStandOptions()}
                {renderVariationOptions()}
              </>
            ) : is2D ? (
              // Options untuk produk 2D
              <>
                {renderFrameSizeOptions()}
                {renderShadingOptions()}
                {renderVariationOptions()}
                {renderSpecialVariations()}
                {renderPackagingOptions()}
              </>
            ) : is3D ? (
              // Options untuk produk 3D
              <>
                {renderVariationOptions()}
                {renderSpecialVariations()}
                {renderPackagingOptions()}
              </>
            ) : (
              // Options untuk produk lainnya (Acrylic, Softcopy, dll)
              <>
                {renderVariationOptions()}
                {renderSpecialVariations()}
                {renderPackagingOptions()}
                {renderAcrylicStandOptions()}
                {renderAcrylicSizeOptions()}
              </>
            )}
            
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