import React, { useState, useEffect, useRef } from "react";
import {
  useParams,
  useLocation,
  Link,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import Footer from "../components/home/Footer";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { priceList } from "../data/priceList";
import { getPrice } from "../utils/getPrice";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { allProducts, orderedProducts } from "../data/productDataLoader";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import productOptions from "../data/productOptions";
import { getProductDescription, getProductTitle } from "../data/productDescriptions";

// Helper function to determine variations based on category and size
const getProductVariations = (category: string, name: string): string[] => {
  const categoryLower = category?.toLowerCase() || "";
  const nameLower = name?.toLowerCase() || "";
  
  // Sizes yang dapat Frame Kaca (2D dan 3D)
  const glassFrameSizes = ["4r", "15cm", "6r", "20cm", "8r", "10r", "12r"];
  
  // Sizes yang dapat Acrylic (hanya 3D besar)
  const acrylicSizes = ["a2", "a1", "a0"];
  
  // Check if product is 2D or 3D Frame
  if (categoryLower.includes("2d") || categoryLower.includes("3d")) {
    // Check for glass frame sizes
    const hasGlassSize = glassFrameSizes.some(size => nameLower.includes(size));
    if (hasGlassSize) {
      return ["Frame Kaca"];
    }
    
    // Check for acrylic sizes (only for 3D)
    if (categoryLower.includes("3d")) {
      const hasAcrylicSize = acrylicSizes.some(size => nameLower.includes(size));
      if (hasAcrylicSize) {
        return ["Frame Acrylic"];
      }
    }
  }
  
  // Default: no variations
  return [];
};

const getFullSizeLabel = (category, shortName) => {
  const categoryData = productOptions[category];
  if (!categoryData || !categoryData.sizes) return shortName;

  const found = categoryData.sizes.find(size => {
    return size.value.startsWith(shortName);
  });

  return found ? found.label : shortName;
};

type LayoutContext = {
  searchQuery: string;
  addToCart: (item: any) => void;
};

// Packaging images khusus untuk 3D Frame 8R
const packagingImages = import.meta.glob(
  "../assets/3d-package-photo/8R/*.{jpg,JPG,jpeg,png}",
  { eager: true, as: "url" }
);

const getPackagingImage = (filename: string): string => {
  const entry = Object.entries(packagingImages).find(([path]) => 
    path.toUpperCase().includes(filename.toUpperCase())
  );
  return entry ? entry[1] : "https://via.placeholder.com/48";
};

// Helper untuk harga produk tambahan
const getAdditionalPrice = (name: string): number | string => {
  const additionalPrices = priceList.Additional;

  switch (name) {
    case "Additional Faces": {
      const minPrice = additionalPrices["Tambahan Wajah Karikatur 1-9 wajah"];
      const maxPrice = additionalPrices["Tambahan Wajah Karikatur diatas 10 wajah"];
      return `Rp ${minPrice.toLocaleString("id-ID")} - Rp ${maxPrice.toLocaleString("id-ID")}`;
    }
    case "Background Custom":
      return additionalPrices["Background Custom"];

    case "Additional Packing":
      return additionalPrices["Biaya Tambahan Packing untuk Order Banyak via Kargo"];

    default:
      return 0;
  }
};

const formatProductName = (name: string): string => {
  if (!name) return name;
  
  const sizePattern = /(A\d+)-(\d+)X(\d+)CM/i;
  const match = name.match(sizePattern);
  
  if (match) {
    const [, size, width, height] = match;
    return `${size} / ${width}x${height}cm`;
  }
  
  return name;
};

const ProductDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useOutletContext<LayoutContext>();
  const currentLang = i18n.language;
  const faceOptions = currentLang === "id" 
    ? ["1–9 Wajah", "Di atas 10 Wajah"]
    : ["1–9 Faces", "Above 10 Faces"];

  // ===== 🚨 PERBAIKAN UTAMA: CARI PRODUK DENGAN BENAR =====
  const findProductById = (productId: string) => {
    // 1. Cari di orderedProducts dulu (prioritas utama - karena ini yang ditampilkan di grid)
    let product = orderedProducts.find(p => p.id === productId);
    
    // 2. Jika tidak ditemukan, cari di allProducts
    if (!product) {
      product = allProducts.find(p => p.id === productId);
    }
    
    // 3. DEBUG: Log untuk mencari tahu
    console.log("=== PRODUCT SEARCH DEBUG ===");
    console.log("Looking for ID:", productId);
    console.log("Found in orderedProducts:", !!orderedProducts.find(p => p.id === productId));
    console.log("Found in allProducts:", !!allProducts.find(p => p.id === productId));
    console.log("Product found:", product ? {
      id: product.id,
      name: product.name,
      category: product.category,
      subcategory: product.subcategory
    } : "Not found");
    
    return product;
  };

  // Gunakan location.state jika ada (klik kiri), jika tidak cari dari ID (klik kanan/tab baru)
  const productFromState = location.state as any;
  const productFromId = productFromState || findProductById(id || "");

  // Destructure dari product yang ditemukan
  const { 
    imageUrl = "https://i.ibb.co/z5pYtWj/1000273753.jpg", 
    name = "Default Product Name", 
    category = "2D Frame", 
    size = "", 
    type = "", 
    price = 0, 
    allImages = [],
    shadingOptions: productShadingOptions = [],
    sizeFrameOptions: productSizeFrameOptions = [],
    specialVariations: productSpecialVariations = [],
    details: productDetailsFromData = {}
  } = productFromId || {};

  // 🧩 State utama
  const [includePacking, setIncludePacking] = useState(false);
  const [selectedAdditionalFaceOption, setSelectedAdditionalFaceOption] = useState<"1-9" | "10+" | null>("1-9");
  const [selectedKarikaturOption, setSelectedKarikaturOption] = useState<string>("");
  const additionalSectionRef = useRef<HTMLDivElement | null>(null);
  
  // Gunakan fungsi getProductVariations untuk menentukan variations
  const productVariations = getProductVariations(category, name);
  const [selectedVariation, setSelectedVariation] = useState(
    productVariations[0] || ""
  );
  
  const [quantity, setQuantity] = useState<number | "">(1);
  const [faces] = useState<number | "">(1);
  const [background, setBackground] = useState<"Default" | "Custom">("Default");
  const [selectedImage, setSelectedImage] = useState(
    imageUrl || "https://i.ibb.co/z5pYtWj/1000273753.jpg"
  );
  const [selectedProductVariation, setSelectedProductVariation] = useState<string>("");
  const [displayedPrice, setDisplayedPrice] = useState<number>(price || getPrice(category, name) || 0);
  const [selectedShading, setSelectedShading] = useState<string>("");
  const [selectedSizeFrame, setSelectedSizeFrame] = useState<string>("");
  const [selectedFaceOptionCustom, setSelectedFaceOptionCustom] = useState<string>("");
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [selectedExpressOption, setSelectedExpressOption] = useState<string>("");
  const [selectedAcrylicOption, setSelectedAcrylicOption] = useState<string>("");

  // ======== AUTO LOAD VARIATION IMAGES ========
  const frameSizeImages = import.meta.glob("../assets/list-products/2D/variation/frame/**/*.{jpg,png,JPG,jpeg,webp}", {
    eager: true,
    as: "url",
  });

  const shadingImages = import.meta.glob("../assets/list-products/2D/variation/shading/**/*.{jpg,png,JPG,jpeg,webp}", {
    eager: true,
    as: "url",
  });

  // Group berdasarkan nama folder
  const frameGroups: Record<string, string[]> = {};

  Object.entries(frameSizeImages).forEach(([path, url]) => {
    const parts = path.split("/");
    const folderName = parts[parts.length - 2];
    if (!frameGroups[folderName]) frameGroups[folderName] = [];
    frameGroups[folderName].push(url as string);
  });

  // Convert ke format UI
  const frameSizeOptions = Object.entries(frameGroups).map(([folder, urls]) => ({
    value: folder,
    label: folder.toUpperCase(),
    image: urls[0],
    allImages: urls,
  }));

  // Urutkan frame size
  const sizeOrder = ["4R", "6R", "8R", "12R", "15CM"];
  frameSizeOptions.sort((a, b) => {
    const aIndex = sizeOrder.findIndex((s) => a.value.toUpperCase().includes(s));
    const bIndex = sizeOrder.findIndex((s) => b.value.toUpperCase().includes(s));

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.value.localeCompare(b.value, "en", { numeric: true });
  });

  // Group shading
  const shadingGroups: Record<string, { value: string; label: string; preview: string }> = {};

  Object.entries(shadingImages).forEach(([path, url]) => {
    const parts = path.split("/");
    const folderName = parts[parts.length - 2];
    if (!shadingGroups[folderName]) {
      shadingGroups[folderName] = {
        value: folderName,
        label: folderName.replace(/^2D\s+/i, ""),
        preview: url as string,
      };
    }
  });

  const shadingOptions = Object.values(shadingGroups);

  // 🆕 DAPATKAN TITLE DAN DESKRIPSI PRODUK
  const productDescription = getProductDescription(category, name);
  const productTitle = getProductTitle(category, name);
  
  // 🆕 TENTUKAN DETAIL PRODUK
  let productDetails = {};
  let hasDescriptionData = false;
  
  if (productDescription) {
    hasDescriptionData = true;
    const { title, ...detailsWithoutTitle } = productDescription;
    productDetails = detailsWithoutTitle;
  }

  // 🚨 PERBAIKAN: Gunakan data dari productFromId jika ada
  const product = productFromId ? {
    id: productFromId.id,
    name: productFromId.name || "Default Product Name",
    title: productTitle,
    imageUrl: productFromId.imageUrl || "https://i.ibb.co/z5pYtWj/1000273753.jpg",
    category: productFromId.category || "2D Frame",
    size: productFromId.size || "",
    type: productFromId.type || "",
    price: productFromId.price || getPrice(productFromId.category, productFromId.name) || 0,
    allImages: productFromId.allImages || [],
    shadingOptions: productShadingOptions.length > 0 ? productShadingOptions : shadingOptions,
    sizeFrameOptions: productSizeFrameOptions.length > 0 ? productSizeFrameOptions : frameSizeOptions,
    variations: productVariations,
    details: Object.keys(productDetailsFromData).length > 0 ? productDetailsFromData : productDetails,
    hasDescriptionData: hasDescriptionData || Object.keys(productDetailsFromData).length > 0,
    specialVariations: productSpecialVariations,
  } : {
    // Fallback jika tidak ditemukan
    id: id || "",
    name: "Product Not Found",
    title: "Product Not Found",
    imageUrl: "https://i.ibb.co/z5pYtWj/1000273753.jpg",
    category: "Unknown",
    size: "",
    type: "",
    price: 0,
    allImages: [],
    shadingOptions: [],
    sizeFrameOptions: [],
    variations: [],
    details: {},
    hasDescriptionData: false,
    specialVariations: [],
  };

  const categoryOptions = productOptions[product.category as keyof typeof productOptions];

  // Untuk Additional dan Softcopy Design, tidak perlu size
  const isAdditionalOrSoftcopy = ["Additional", "Softcopy Design"].includes(product.category);

  // 🆕 TAMBAHKAN LOGIC UNTUK ACRYLIC STAND
  const isAcrylicStand = product.category === "Acrylic Stand" || 
                        product.name?.toLowerCase().includes("acrylic stand");

  const defaultSize = isAdditionalOrSoftcopy || isAcrylicStand
    ? "" 
    : (categoryOptions?.sizes?.find((s) => s.label.toUpperCase().startsWith(product.name.toUpperCase()))
        ?.label || product.size || "Custom");

  // 🆕 DEFINE normalizedSizeKey
  const normalizedSizeKey = Object.keys(categoryOptions?.specialCases || {}).find((key) =>
    key.toLowerCase().includes(product.name.toLowerCase())
  );

  const specialVariations =
    product.category === "3D Frame" && normalizedSizeKey
      ? categoryOptions?.specialCases?.[normalizedSizeKey] || []
      : product.specialVariations || [];

  // 🚨 EMERGENCY FIX: Redirect jika ID adalah prod-8 lama
  useEffect(() => {
    if (id === 'prod-8' && !location.state && productFromId?.category?.includes("2D")) {
      console.log("EMERGENCY FIX: Redirecting old prod-8 to 3D 12R");
      
      // Cari 3D 12R di orderedProducts
      const correctProduct = orderedProducts.find(p => 
        p.category.includes("3D") && 
        (p.name.includes("12R") || p.subcategory?.includes("12R"))
      );
      
      if (correctProduct && correctProduct.id !== 'prod-8') {
        navigate(`/product/${correctProduct.id}`, {
          state: correctProduct,
          replace: true
        });
      }
    }
  }, [id, location.state, navigate, productFromId]);

  // semua useEffect lainnya tetap sama
  useEffect(() => {
    if (specialVariations.length > 0 && !selectedProductVariation) {
      setSelectedProductVariation(specialVariations[0].value);
    }
  }, [specialVariations, selectedProductVariation]);
  
  useEffect(() => {
    const categoryKey = "3D frame";
    const nameKey = product.name?.toLowerCase() || "";
    const isAcrylicAdditional =
      product.name?.toLowerCase().includes("biaya tambahan ganti frame kaca ke acrylic");
  
    if (isAcrylicAdditional) {
      if (selectedSizeFrame) {
        const acrylicPrice =
          priceList.Additional[`Biaya Tambahan Ganti Frame Kaca ke Acrylic ${selectedSizeFrame}`] ||
          priceList.Additional["Biaya Tambahan Ganti Frame Kaca ke Acrylic"] ||
          0;
  
        setDisplayedPrice(acrylicPrice);
      } else {
        setDisplayedPrice(product.price);
      }
  
      return;
    }
  
    if (product.category?.toLowerCase().includes("3d") && nameKey.includes("8r")) {
      let normalized = selectedProductVariation?.toLowerCase() || "";
      normalized = normalized
        .replace(/\s+/g, "")
        .replace(/_/g, "")
        .replace(/\+/g, "");
  
      let priceKey: string | null = null;
  
      if (normalized.includes("duskraft")) {
        priceKey = "8R duskraft";
      } else if (normalized.includes("hardbox")) {
        priceKey = "8R hardbox";
      }
  
      if (priceKey && priceList[categoryKey]?.[priceKey]) {
        setDisplayedPrice(priceList[categoryKey][priceKey]);
      } else {
        setDisplayedPrice(product.price);
      }
  
      return;
    }
  
    if (
      selectedVariation === "Frame Kaca" ||
      (!selectedSizeFrame && selectedVariation !== "Frame Acrylic")
    ) {
      setDisplayedPrice(product.price);
    } else if (selectedVariation === "Frame Acrylic" && selectedSizeFrame) {
      const acrylicPrice =
        priceList.Additional[`Biaya Tambahan Ganti Frame Kaca ke Acrylic ${selectedSizeFrame}`] || 0;
      setDisplayedPrice(acrylicPrice);
    }
  }, [selectedProductVariation, product, selectedSizeFrame, selectedVariation]);
  
useEffect(() => {
  const isManyFaceProduct = product.name
    ?.toLowerCase()
    .includes("biaya tambahan wajah banyak (design dari customer)");

  if (!isManyFaceProduct) return;

  if (selectedFaceOptionCustom === faceOptions[0]) {
    setDisplayedPrice(
      priceList.Additional["Biaya Tambahan Wajah Banyak 1-9 wajah"] || product.price
    );
  } else if (selectedFaceOptionCustom === faceOptions[1]) {
    setDisplayedPrice(
      priceList.Additional["Biaya Tambahan Wajah Banyak diatas 10 wajah"] || product.price
    );
  } else {
    setSelectedFaceOptionCustom(faceOptions[0]);
    setDisplayedPrice(
      priceList.Additional["Biaya Tambahan Wajah Banyak 1-9 wajah"] || product.price
    );
  }
}, [selectedFaceOptionCustom, product, faceOptions]);
  
  useEffect(() => {
    const isExpressProduct = product.name
      ?.toLowerCase()
      .includes("biaya ekspress general");
  
    if (!isExpressProduct) return;
  
    if (selectedExpressOption === "Option 1") {
      setDisplayedPrice(priceList.Additional["Biaya Ekspress General"] || product.price);
    } else if (selectedExpressOption === "Option 2") {
      setDisplayedPrice(priceList.Additional["Biaya Ekspress General 2"] || product.price);
    } else if (selectedExpressOption === "Option 3") {
      setDisplayedPrice(priceList.Additional["Biaya Ekspress General 3"] || product.price);
    } else {
      setDisplayedPrice(product.price);
    }
  }, [selectedExpressOption, product]);
  
  useEffect(() => {
    const is2DFrame = product.category?.toLowerCase().includes("2d");
    if (!is2DFrame) return;
  
    if (selectedSizeFrame && selectedShading) {
      const size = selectedSizeFrame.toLowerCase();
  
      const shadingRaw = selectedShading.toLowerCase().replace(/^2d\s+/i, "").trim();
  
      const shadingMap: Record<string, string> = {
        "simple shading": "simple shading",
        "background catalog": "background catalog",
        "bold shading": "bold shading",
        "by ai": "ai",
        "ai": "ai",
      };
  
      const shadingKey =
        shadingMap[shadingRaw] ||
        shadingMap[shadingRaw.replace("shading", "").trim()] ||
        "simple shading";
  
      const key = `${size} ${shadingKey}`;
  
      const twoDFramePriceList = Object.fromEntries(
        Object.entries(priceList["2D frame"]).map(([k, v]) => [k.toLowerCase(), v])
      );
  
      const twoDPrice =
        twoDFramePriceList[key] ||
        twoDFramePriceList[`${size} simple shading`] ||
        product.price;
  
      setDisplayedPrice(twoDPrice);
    } else if (selectedSizeFrame && !selectedShading) {
      const key = `${selectedSizeFrame.toLowerCase()} simple shading`;
  
      const twoDFramePriceList = Object.fromEntries(
        Object.entries(priceList["2D frame"]).map(([k, v]) => [k.toLowerCase(), v])
      );
  
      const twoDPrice = twoDFramePriceList[key] || product.price;
      setDisplayedPrice(twoDPrice);
    } else {
      setDisplayedPrice(product.price);
    }
  }, [selectedSizeFrame, selectedShading, product]);
  
  useEffect(() => {
    if (product.category?.toLowerCase().includes("2d") && !selectedShading) {
      const simpleOption = product.shadingOptions.find((opt) =>
        opt.label.toLowerCase().includes("simple shading")
      );
  
      if (simpleOption) {
        setSelectedShading(simpleOption.value);
      }
    }
  }, [product, selectedShading]);
  
  useEffect(() => {
    const name = product.name?.toLowerCase() || "";
    const category = product.category?.toLowerCase() || "";
  
    const isAcrylic3mm =
      category.includes("acrylic") && name.includes("3mm");
  
    if (!isAcrylic3mm) return;
  
    const acrylicPriceList = priceList["Acrylic Stand"] || {};
  
    let newPrice = product.price;
  
    if (selectedAcrylicOption === "15x15cm 1 sisi") {
      newPrice =
        acrylicPriceList["Acrylic Stand 3mm size 15x15cm 1 sisi"] ||
        product.price;
    } else if (selectedAcrylicOption === "A4 2 sisi") {
      newPrice =
        acrylicPriceList["Acrylic Stand 3mm size A4 2 sisi"] ||
        product.price;
    } else if (selectedAcrylicOption === "A3 2 sisi") {
      newPrice =
        acrylicPriceList["Acrylic Stand 3mm size A3 2 sisi"] ||
        product.price;
    }
  
    setDisplayedPrice(newPrice);
  }, [selectedAcrylicOption, product]);
  
useEffect(() => {
  const isKarikaturProduct = product.name
    ?.toLowerCase()
    .includes("biaya tambahan wajah karikatur");

  if (!isKarikaturProduct) return;

  if (selectedKarikaturOption === faceOptions[0]) {
    setDisplayedPrice(
      priceList.Additional["Tambahan Wajah Karikatur 1-9 wajah"] || product.price
    );
  } else if (selectedKarikaturOption === faceOptions[1]) {
    setDisplayedPrice(
      priceList.Additional["Tambahan Wajah Karikatur diatas 10 wajah"] || product.price
    );
  } else {
    setSelectedKarikaturOption(faceOptions[0]);
    setDisplayedPrice(
      priceList.Additional["Tambahan Wajah Karikatur 1-9 wajah"] || product.price
    );
  }
}, [selectedKarikaturOption, product, faceOptions]);

const handleAddToCart = () => {
  const finalQty = quantity === "" ? 1 : quantity;
  const faceCountLabel = "1–9 wajah";

  let productName = "";
  
  const isKarikaturProduct = product.name
    ?.toLowerCase()
    .includes("biaya tambahan wajah karikatur");
    
  const isManyFacesProduct = product.name
    ?.toLowerCase()
    .includes("biaya tambahan wajah banyak (design dari customer)");
    
  const isExpressProduct = product.name
    ?.toLowerCase()
    .includes("biaya ekspress general");
    
  const isAcrylicChangeProduct = product.name
    ?.toLowerCase()
    .includes("biaya tambahan ganti frame kaca ke acrylic");
    
  const isAcrylicStand = product.category === "Acrylic Stand" || 
                        product.name?.toLowerCase().includes("acrylic stand");
  
  const is8RProduct = product.name?.toLowerCase().includes("8r") || 
                     selectedSizeFrame?.toLowerCase().includes("8r");
  
  const productVariations = getProductVariations(product.category, product.name);
  
  let variationOptions: string[] = [];
  
  if (isKarikaturProduct || isManyFacesProduct) {
    variationOptions = ["1–9 Wajah", "Di atas 10 Wajah"];
  } else if (isExpressProduct) {
    variationOptions = ["Option 1", "Option 2", "Option 3"];
  } else if (isAcrylicChangeProduct) {
    variationOptions = ["A2", "A1", "A0"];
  } else if (isAcrylicStand) {
    variationOptions = ["15x15cm 1 sisi", "A4 2 sisi", "A3 2 sisi"];
  } else if (is8RProduct) {
    variationOptions = ["Dus Kraft + Paperbag", "Black Hardbox + Paperbag"];
  } else if (productVariations.length > 0) {
    variationOptions = productVariations;
  } else {
    variationOptions = ["Frame Kaca", "Frame Acrylic"];
  }
  
  const cleanShadingStyle = (shading: string): string => {
    if (!shading) return "";
    return shading
      .replace(/^2d\s+/i, "")
      .replace(/\s*2d\s*/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  };
  
  const cleanedShadingStyle = cleanShadingStyle(selectedShading);
  
  let selectedOption = "";
  
  if (isKarikaturProduct) {
    selectedOption = selectedKarikaturOption || "1–9 Wajah";
  } else if (isManyFacesProduct) {
    selectedOption = selectedFaceOptionCustom || "1–9 Wajah";
  } else if (isExpressProduct) {
    selectedOption = selectedExpressOption || "Option 1";
  } else if (isAcrylicChangeProduct) {
    selectedOption = selectedSizeFrame || "A2";
  } else if (isAcrylicStand) {
    selectedOption = selectedAcrylicOption || "15x15cm 1 sisi";
  } else if (is8RProduct) {
    selectedOption = "Dus Kraft + Paperbag";
  } else if (productVariations.length > 0) {
    selectedOption = selectedVariation || productVariations[0];
  } else {
    selectedOption = "Frame Kaca";
  }

  if (isAcrylicStand) {
    productName = `Acrylic Stand ${product.name}`;
  } 
  else if (product.category === "3D Frame" || product.category === "2D Frame" || product.category === "Frame") {
    const categoryOptions = productOptions[product.category];
    let fullSizeLabel = product.name;

    if (categoryOptions?.sizes) {
      const found = categoryOptions.sizes.find(s => s.value.startsWith(product.name));
      if (found) fullSizeLabel = found.label;
    }
    productName = `${product.category} ${fullSizeLabel}`;
  }
  else if (product.category === "Softcopy Design") {
    productName = `Softcopy Design ${product.name}`;
  }
  else if (product.category === "Additional") {
    productName = product.name;
  }
  else {
    productName = product.name || "Default Product Name";
  }
  
  let packagingPriceMap: Record<string, number> = {};
  if (is8RProduct) {
    packagingPriceMap = {
      "Dus Kraft + Paperbag": priceList["3D frame"]?.["8R duskraft"] || 0,
      "Black Hardbox + Paperbag": priceList["3D frame"]?.["8R hardbox"] || 0,
    };
  }

  addToCart({
    id: product.id || "p1",
    name: productName,
    price: displayedPrice,
    quantity: finalQty,
    imageUrl: product.imageUrl,
    variation: selectedOption,
    variationOptions: variationOptions,
    productType: "frame",
    attributes: {
      faceCount: faceCountLabel,
      backgroundType: background === "Custom" ? "BG Custom" : "BG Default",
      includePacking,
      frameSize: selectedSizeFrame,
      shadingStyle: cleanedShadingStyle,
      isAcrylicStand: isAcrylicStand,
      selectedOption: selectedOption,
      isAdditionalProduct: isKarikaturProduct || isManyFacesProduct || 
                          isExpressProduct || isAcrylicChangeProduct || isAcrylicStand,
      ...(is8RProduct && {
        is8RProduct: true,
        packagingPriceMap,
        packagingVariations: ["Dus Kraft + Paperbag", "Black Hardbox + Paperbag"],
        selectedPackagingVariation: selectedOption
      })
    }
  });
};

const [variationImages, setVariationImages] = useState<string[]>([]);
const [showPreview, setShowPreview] = useState<boolean>(false);
const previewRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Breadcrumb - Mobile optimized */}
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
            onClick={() => {
              const categoryLower = product.category.toLowerCase();
              
              // Navigasi berdasarkan kategori dengan param yang konsisten
              if (categoryLower.includes("3d")) {
                navigate(`/products?category=3d&type=3d_frame`);
              } else if (categoryLower.includes("2d")) {
                navigate(`/products?category=2d&type=2d_frame`);
              } else if (categoryLower.includes("acrylic")) {
                navigate(`/products?category=acrylic`);
              } else if (categoryLower.includes("softcopy")) {
                navigate(`/products?category=softcopy`);
              } else if (categoryLower.includes("additional")) {
                navigate(`/products?category=additional`);
              } else {
                navigate("/products");
              }
            }}
          >
            {product.category} &gt;
          </span>
          
          <span className="mx-1 text-black">{product.title}</span>
        </div>

        {/* Layout - Mobile: Stack vertically, Desktop: Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-16">
          {/* === Gallery Utama - Mobile optimized === */}
          <div className="w-full">
            {selectedImage.endsWith(".mp4") || selectedImage.endsWith(".webm") ? (
              <video
                src={selectedImage}
                controls
                className="w-full h-auto rounded-lg border border-gray-200 mb-3 md:mb-4"
              />
            ) : (
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-auto object-cover rounded-lg border border-gray-200 mb-3 md:mb-4"
              />
            )}
          
            {/* Thumbnail utama - Mobile: 3 items, Desktop: 4-5 items */}
            {product.allImages.length > 1 && (
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
                  {product.allImages.map((media: string, idx: number) => {
                    const isVideo =
                      media.endsWith(".mp4") ||
                      media.endsWith(".webm") ||
                      media.endsWith(".mov");
          
                    return (
                      <SwiperSlide key={idx}>
                        {isVideo ? (
                          <video
                            src={media}
                            muted
                            playsInline
                            onClick={() => setSelectedImage(media)}
                            className={`w-full h-16 md:h-24 object-cover rounded-md border-2 cursor-pointer transition-all duration-200 ${
                              selectedImage === media
                                ? "border-pink-500 scale-105"
                                : "border-gray-200 hover:border-gray-400"
                            }`}
                          />
                        ) : (
                          <img
                            src={media}
                            alt={`${product.title} ${idx + 1}`}
                            onClick={() => setSelectedImage(media)}
                            className={`w-full h-16 md:h-24 object-cover rounded-md border-2 cursor-pointer transition-all duration-200 ${
                              selectedImage === media
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
          
          {/* 🆕 PREVIEW FRAME SIZE - Mobile optimized */}
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
                  {t("product.preview")} {selectedSizeFrame}
              </h3>
          
              {selectedPreviewImage && (
                <img
                  src={selectedPreviewImage}
                  alt={`Preview ${selectedSizeFrame}`}
                  onClick={() => setIsZoomOpen(true)}
                  className="w-full h-auto object-contain rounded-lg border border-gray-300 mb-3 md:mb-4 transition-all duration-300 cursor-zoom-in hover:scale-[1.02]"
                />
              )}
          
              {/* Grid thumbnail - Mobile: 2 columns, Desktop: 3-4 columns */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                {variationImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${selectedSizeFrame} ${i + 1}`}
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
          
          {/* 🖼️ Fullscreen Zoom Modal - Mobile optimized */}
          {isZoomOpen && selectedPreviewImage && (
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
          
          {/* Right: Info - Mobile optimized */}
          <div className="flex flex-col">
            {/* 🆕 JUDUL PRODUK DARI ENGLISH VERSION */}
            <h1 className="text-[18px] md:text-[25px] font-poppinsMedium leading-tight">
              {product.title}
            </h1>
          
            {/* ⭐ Best Selling label - Mobile optimized */}
            {(() => {
              const category = product.category?.toLowerCase() || "";
              const name = product.name?.toLowerCase() || "";
          
              if (category.includes("3d") && /\b12r\b/.test(name)) {
                return (
                  <div className="flex items-center space-x-2 text-yellow-600 px-2 md:px-3 py-1 rounded-full text-[12px] md:text-[15px] font-poppinsMediumItalic w-fit mt-2">
                    <FaStar className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{t("product.bestSellingSize")}</span>
                  </div>
                );
              }
          
              if (category.includes("2d")) {
                return (
                  <div className="flex items-center space-x-2 text-yellow-600 px-2 md:px-3 py-1 rounded-full text-[12px] md:text-[15px] font-poppinsMediumItalic w-fit mt-2">
                    <FaStar className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{t("product.bestSellingGift")}</span>
                  </div>
                );
              }
          
              return null;
            })()}
          
          <p className="text-[24px] md:text-[30px] font-poppinsMedium text-red-600 mt-2">
            Rp {displayedPrice.toLocaleString("id-ID")}
          </p>
          
                      {/* SPECIAL VARIATIONS - Packaging Options - Mobile optimized */}
                      {specialVariations.length > 0 && (
                        <div className="mt-4 md:mt-6 mb-3 md:mb-4 font-poppinsSemiBold">
                          <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
                              {t("product.packagingOption")}
                          </label>
                          <div className="flex gap-2 md:gap-4 flex-wrap">
                            {specialVariations.map((opt) => (
                              <div
                                key={opt.value}
                                onClick={() => setSelectedProductVariation(opt.value)}
                                className={`cursor-pointer box-border overflow-hidden rounded-xl flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2 md:p-3 w-28 h-28 md:w-36 md:h-36 transition-all duration-150 border ${
                                    selectedProductVariation?.toLowerCase() === opt.value?.toLowerCase()
                                      ? "ring-2 ring-blue-500 border-transparent"
                                      : "border-gray-300 hover:border-blue-400 hover:shadow-sm"
                                  }`}
                              >
                                <img
                                  src={getPackagingImage(
                                    opt.value === "dus_kraft_paperbag"
                                      ? "PACKING DUS KRAFT.jpg"
                                      : "PACKING HARDBOX.jpg"
                                  )}
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
                      )}
                    
                      {/* 🔹 2D FRAME - Shading & Frame Size Options - Mobile optimized */}
                      {product.category === "2D Frame" && (
                        <>
                          {/* Frame Size Options */}
                          {product.sizeFrameOptions.length > 0 && (
                            <div className="mt-4 md:mt-6 mb-3 md:mb-4 font-poppinsSemiBold">
                              <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
                               {t("product.frameSize")}
                              </label>
                              <div className="flex gap-2 md:gap-4 flex-wrap">
                                {product.sizeFrameOptions.map((opt) => (
                                  <div
                                    key={opt.value}
                                    onClick={() => {
                                      setSelectedSizeFrame(opt.value);
                                      if (opt.allImages?.length > 0) {
                                        setVariationImages(opt.allImages);
                                        setSelectedPreviewImage(opt.allImages[0]);
                                        setShowPreview(false);
                                        setTimeout(() => setShowPreview(true), 50);
                                      } else {
                                        setVariationImages([]);
                                        setSelectedPreviewImage(null);
                                        setShowPreview(false);
                                      }
                                    }}
                                    className={`cursor-pointer box-border overflow-hidden rounded-xl flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2 md:p-3 w-28 h-28 md:w-36 md:h-36 transition-all duration-150 border ${
                                      selectedSizeFrame === opt.value
                                        ? "ring-2 ring-blue-500 border-transparent"
                                        : "border-gray-300 hover:border-blue-400 hover:shadow-sm"
                                    }`}
                                  >
                                    <img
                                      src={opt.image}
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
                          )}
                      
                          {/* Shading Options */}
                          {product.shadingOptions.length > 0 && (
                            <div className="mt-4 md:mt-6 mb-3 md:mb-4 font-poppinsSemiBold">
                              <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
                              {t("product.shadingStyle")}
                              </label>
                              <div className="flex gap-2 md:gap-4 flex-wrap">
                                {product.shadingOptions.map((opt) => (
                                  <div
                                    key={opt.value}
                                    onClick={() => setSelectedShading(opt.value)}
                                    className={`cursor-pointer box-border overflow-hidden rounded-xl flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2 md:p-3 w-28 h-28 md:w-36 md:h-36 transition-all duration-150 border ${
                                      selectedShading === opt.value
                                        ? "ring-2 ring-blue-500 border-transparent"
                                        : "border-gray-300 hover:border-blue-400 hover:shadow-sm"
                                    }`}
                                  >
                                    {opt.preview && (
                                      <img
                                        src={opt.preview}
                                        alt={opt.label}
                                        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl"
                                      />
                                    )}
                                    <span className="text-[13px] md:text-base font-medium text-gray-800 text-center">
                                      {opt.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
          
                      {/* Variation - Mobile: Stack vertically */}
                      {!["Additional", "Softcopy Design"].includes(product.category) && product.variations.length > 0 && (
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mt-4 space-y-2 md:space-y-0">
                          <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold md:translate-y-3">
                              {t("product.variation")}
                          </label>
                          <div className="flex flex-row flex-wrap gap-2 md:-translate-x-[165px] md:translate-y-2 font-poppinsRegular">
                            {product.variations.map((variation) => {
                              let displayText = variation;
                              if (variation === "Frame Kaca") displayText = t("product.frameGlass");
                              if (variation === "Frame Acrylic") displayText = t("product.frameAcrylic");
                              
                              return (
                                <button
                                  key={variation}
                                  onClick={() => setSelectedVariation(variation)}
                                  className={`px-4 md:px-6 py-2 border rounded-md text-[13px] md:text-sm transition-colors ${
                                    selectedVariation === variation
                                      ? "bg-[#dcbec1] border-[#bfa4a6]"
                                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                                  }`}
                                >
                                  {displayText}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
          
                      {/* 🧩 Additional Custom - Biaya Tambahan Wajah Karikatur - Mobile optimized */}
                      {product.name
                        ?.toLowerCase()
                        .includes("biaya tambahan wajah karikatur") && (
                        <div className="mt-4 md:mt-6 mb-3 md:mb-4 font-poppinsSemiBold">
                          <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
                            {t("product.additionalCustomKarikaturFaces")}
                          </label>
                      
                          <p className="text-[13px] md:text-[15px] font-poppinsRegular text-gray-700 mb-2 md:mb-3">
                            {t("product.chooseFaceCount")}
                          </p>
                      
<div className="flex gap-2 md:gap-4 flex-wrap">
  {faceOptions.map((option) => (
                              <div
                                key={option}
                                onClick={() =>
                                  setSelectedKarikaturOption((prev) =>
                                    prev === option ? "" : option
                                  )
                                }
                                className={`cursor-pointer box-border overflow-hidden rounded-xl flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2 md:p-3 w-28 h-28 md:w-36 md:h-36 transition-all duration-150 border ${
                                  selectedKarikaturOption === option
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
                      )}
                      
                      {/* 🧩 Additional Custom - Biaya Tambahan Ganti Frame Kaca ke Acrylic - Mobile optimized */}
                      {product.name?.toLowerCase().includes("biaya tambahan ganti frame kaca ke acrylic") && (
                        <div className="mt-4 md:mt-6 mb-3 md:mb-4 font-poppinsSemiBold">
                          <p className="text-[13px] md:text-[15px] font-poppinsSemiBold text-gray-700 mb-2 md:mb-3">
                              {t("product.chooseAcrylicSize")}
                          </p>
                      
                          <div className="flex gap-2 md:gap-4 flex-wrap">
                            {["A2", "A1", "A0"].map((size) => {
                              const acrylicPrice =
                                priceList.Additional[`Biaya Tambahan Ganti Frame Kaca ke Acrylic ${size}`] ||
                                priceList.Additional["Biaya Tambahan Ganti Frame Kaca ke Acrylic"] ||
                                0;
                      
                              return (
                                <div
                                  key={size}
                                  onClick={() => {
                                    setSelectedSizeFrame((prev) => {
                                      const isSame = prev === size;
                                      const newPrice = isSame ? product.price : product.price + acrylicPrice;
                                      setDisplayedPrice(newPrice);
                                      return isSame ? "" : size;
                                    });
                                  }}
                                  className={`cursor-pointer box-border overflow-hidden rounded-xl flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2 md:p-3 w-28 h-28 md:w-36 md:h-36 transition-all duration-150 border ${
                                    selectedSizeFrame === size
                                      ? "ring-2 ring-blue-500 border-transparent"
                                      : "border-gray-300 hover:border-blue-400 hover:shadow-sm"
                                  }`}
                                >
                                  <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gray-100 rounded-xl">
                                    <span className="text-3xl md:text-4xl font-bold text-gray-400">{size}</span>
                                  </div>
                                  <span className="text-[13px] md:text-base font-medium text-gray-800 text-center">{size}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
          
                      {/* 🧩 Additional Custom - Biaya Tambahan Wajah Banyak - Mobile optimized */}
                      {product.name
                        ?.toLowerCase()
                        .includes("biaya tambahan wajah banyak (design dari customer)") && (
                        <div className="mt-4 md:mt-6 mb-3 md:mb-4 font-poppinsSemiBold">
                          <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
                              {t("product.additionalCustomManyFaces")}
                          </label>
                      
                          <p className="text-[13px] md:text-[15px] font-poppinsRegular text-gray-700 mb-2 md:mb-3">
                              {t("product.chooseFaceCount")}
                          </p>
                      
<div className="flex gap-2 md:gap-4 flex-wrap">
  {faceOptions.map((option) => (
                              <div
                                key={option}
                                onClick={() =>
                                  setSelectedFaceOptionCustom((prev) =>
                                    prev === option ? "" : option
                                  )
                                }
                                className={`cursor-pointer box-border overflow-hidden rounded-xl flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2 md:p-3 w-28 h-28 md:w-36 md:h-36 transition-all duration-150 border ${
                                  selectedFaceOptionCustom === option
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
                      )}
          
                      {/* 🧩 Additional Custom - Biaya Ekspress General - Mobile optimized */}
                      {product.name?.toLowerCase().includes("biaya ekspress general") && (
                        <div className="mt-4 md:mt-6 mb-3 md:mb-4 font-poppinsSemiBold">
                          <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
                              {t("product.additionalCustomExpress")}
                          </label>
                      
                          <p className="text-[13px] md:text-[15px] font-poppinsRegular text-gray-700 mb-2 md:mb-3">
                              {t("product.chooseExpress")}
                          </p>
                      
                          <div className="flex gap-2 md:gap-4 flex-wrap">
                            {[
                              { label: "Option 1", price: priceList.Additional["Biaya Ekspress General"] },
                              { label: "Option 2", price: priceList.Additional["Biaya Ekspress General 2"] },
                              { label: "Option 3", price: priceList.Additional["Biaya Ekspress General 3"] },
                            ].map((option) => (
                              <div
                                key={option.label}
                                onClick={() =>
                                  setSelectedExpressOption((prev) =>
                                    prev === option.label ? "" : option.label
                                  )
                                }
                                className={`cursor-pointer box-border overflow-hidden rounded-xl flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2 md:p-3 w-28 h-28 md:w-36 md:h-36 transition-all duration-150 border ${
                                  selectedExpressOption === option.label
                                    ? "ring-2 ring-blue-500 border-transparent"
                                    : "border-gray-300 hover:border-blue-400 hover:shadow-sm"
                                }`}
                              >
                                <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gray-100 rounded-xl">
                                  <span className="text-[13px] md:text-[15px] font-semibold text-gray-800 text-center leading-tight">
                                    {option.label}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
          
                      {/* 🧩 Acrylic Stand 3mm Options - Mobile optimized */}
                      {product.name?.toLowerCase().includes("3mm") && (
                        <div className="mt-4 md:mt-6 mb-3 md:mb-4 font-poppinsSemiBold">
                          <label className="block text-[16px] md:text-[18px] font-poppinsSemiBold mb-2 md:mb-3">
                              {t("product.chooseSizeAndSides")}
                          </label>
                      
                          <div className="flex gap-2 md:gap-4 flex-wrap">
                            {[
                              { label: "15x15cm 1 sisi", key: "15x15cm 1 sisi" },
                              { label: "A4 2 sisi", key: "A4 2 sisi" },
                              { label: "A3 2 sisi", key: "A3 2 sisi" },
                            ].map((option) => (
                              <div
                                key={option.key}
                                onClick={() =>
                                  setSelectedAcrylicOption((prev) =>
                                    prev === option.key ? "" : option.key
                                  )
                                }
                                className={`cursor-pointer box-border overflow-hidden rounded-xl flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2 md:p-3 w-28 h-28 md:w-36 md:h-36 transition-all duration-150 border ${
                                  selectedAcrylicOption === option.key
                                    ? "ring-2 ring-blue-500 border-transparent"
                                    : "border-gray-300 hover:border-blue-400 hover:shadow-sm"
                                }`}
                              >
                                <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gray-100 rounded-xl">
                                  <span className="text-[13px] md:text-[15px] font-semibold text-gray-800 text-center leading-tight px-2">
                                    {option.label}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
          
                      {/* Quantity - Responsive: Mobile (vertical stack) vs Desktop (horizontal) */}
                      {/* Mobile Layout - Stack vertically */}
                      <div className="mt-6 md:hidden">
                        <label className="block text-[16px] font-poppinsSemiBold mb-3">
                          {t("product.quantity")}
                        </label>
                        <div className="flex items-center font-poppinsRegular border border-gray-300 rounded-md w-fit">
                          <button
                            type="button"
                            onClick={() =>
                              setQuantity((prev) => Math.max(1, Number(prev) - 1))
                            }
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
                              setQuantity(val === "" ? "" : Math.max(1, Number(val)));
                            }}
                            className="w-14 text-center font-poppinsRegular border-x border-gray-300 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setQuantity((prev) => Number(prev) + 1)}
                            className="px-3 py-2 text-lg font-bold text-gray-700 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
          
                      {/* Desktop Layout - Horizontal with label on left */}
                      <div className="hidden md:flex items-center justify-between mt-10">
                        <label className="text-[18px] font-poppinsSemiBold">
                          {t("product.quantity")}
                        </label>
                        <div className="flex items-center -translate-x-[160px] font-poppinsRegular border border-gray-300 rounded-md w-fit">
                          <button
                            type="button"
                            onClick={() =>
                              setQuantity((prev) => Math.max(1, Number(prev) - 1))
                            }
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
                              setQuantity(val === "" ? "" : Math.max(1, Number(val)));
                            }}
                            className="w-16 text-center font-poppinsRegular border-x border-gray-300 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setQuantity((prev) => Number(prev) + 1)}
                            className="px-4 py-2 text-lg font-bold text-gray-700 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
          
                      {/* Buttons + Info Price - Mobile optimized */}
                      <div className="flex flex-col pt-4 font-poppinsSemiBoldi">
                        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                          <button
                            onClick={handleAddToCart}
                            className="flex-1 px-4 md:px-6 py-3 border bg-[#dcbec1] font-poppinsSemiBold rounded-lg hover:bg-[#c7a9ac] transition-colors text-[14px] md:text-base"
                          >
                              {t("product.addToCart")}
                          </button>
                          <button
                            className="flex-1 px-4 md:px-6 py-3 bg-[#E2DAD8] font-poppinsSemiBold rounded-lg hover:bg-[#D3C7C4] transition-colors text-[14px] md:text-base"
                          >
                              {t("product.buyNow")}
                          </button>
                        </div>
                      
                        {/* Info Price */}
                        <p className="mt-6 md:mt-[17%] text-[14px] md:text-[16px] font-poppinsSemiBoldItalic text-black">
                          • {t("product.priceInfo")}
                        </p>
                      </div>
                    </div>
        </div>

{/* Product Details - Mobile optimized */}
<div className="mt-10 md:mt-16 pt-6 md:pt-10">
  <h2 className="text-[20px] md:text-[24px] font-poppinsSemiBold mb-3 md:mb-4">
    {t("product.details")}
  </h2>
  
  {/*  SEMUA DETAIL DARI ENGLISH VERSION DITAMPILKAN DI SINI */}
  {product.hasDescriptionData ? (
    <div className="grid grid-cols-[max-content_max-content_1fr] gap-x-1 md:gap-x-2 gap-y-2 text-[13px] md:text-[15px] items-baseline">
      {Object.entries(product.details).map(([key, value]) => (
        <React.Fragment key={key}>
          {/* Kolom 1: Label */}
          <span className="font-poppinsSemiBold">{key}</span>
          
          {/* Kolom 2: Titik Dua */}
          <span className="font-poppinsRegular font-bold">:</span>
          
          {/* Kolom 3: Value */}
          <span className="font-poppinsRegular font-bold">{value}</span>
        </React.Fragment>
      ))}
    </div>
  ) : (
    <p className="text-gray-600">Product details not available.</p>
  )}
  
  {/* Info packing default */}
  <p className="font-poppinsRegular mt-4 md:mt-6 text-[13px] md:text-base">
    {t("product.packingInfo")}
    <br />
    <br />
  </p>
</div>

        {/* 🧩 Additional Products - SEKARANG UNTUK SEMUA KATEGORI KECUALI Additional DAN Softcopy Design */}
        {!["Additional", "Softcopy Design"].includes(product.category) && (
          <div ref={additionalSectionRef} className="mt-10 md:mt-16">
            <h2 className="text-[18px] md:text-xl font-bold font-poppinsRegular mb-4 md:mb-6">
                {t("product.additionalProducts")}
            </h2>

            {(() => {
              const additionalProductsMap = [
                { 
                  displayName: "Additional Faces", 
                  match: "BIAYA TAMBAHAN WAJAH KARIKATUR", 
                  targetProduct: "BIAYA TAMBAHAN WAJAH KARIKATUR",
                  imageUrl: new URL(
                    "../assets/list-products/ADDITIONAL/BIAYA TAMBAHAN WAJAH KARIKATUR/TAMBAHAN WAJAH 1.jpg",
                    import.meta.url
                  ).href,
                  price: `Rp ${priceList.Additional["Tambahan Wajah Karikatur 1-9 wajah"].toLocaleString("id-ID")} - Rp ${priceList.Additional["Tambahan Wajah Karikatur diatas 10 wajah"].toLocaleString("id-ID")}`
                },
                { 
                  displayName: "Background Custom", 
                  match: "BACKGROUND Custom", 
                  targetProduct: "BACKGROUND Custom",
                  imageUrl: new URL(
                    "../assets/bg-catalog/goverment-police/KA-MAY23-01.jpg",
                    import.meta.url
                  ).href,
                  price: `Rp ${priceList.Additional["Background Custom"].toLocaleString("id-ID")}`
                },
                { 
                  displayName: "Additional Packing", 
                  match: "BIAYA TAMBAHAN PACKING", 
                  targetProduct: "BIAYA TAMBAHAN PACKING",
                  imageUrl: new URL(
                    "../assets/list-products/3D/A0-80X110CM/PACKING AIR COLUMN BAGS.jpg",
                    import.meta.url
                  ).href,
                  price: `Rp ${priceList.Additional["Biaya Tambahan Packing"].toLocaleString("id-ID")}`
                },
              ];

              const findAdditionalProduct = (nameToMatch) => {
                if (!nameToMatch) return null;
                const needle = nameToMatch.trim().toLowerCase();
                const exact = allProducts.find(
                  (p) => p.category === "Additional" && p.name?.trim().toLowerCase() === needle
                );
                if (exact) return exact;
                return allProducts.find(
                  (p) => p.category === "Additional" && p.name?.trim().toLowerCase().includes(needle)
                ) || null;
              };

              const additionalProducts = additionalProductsMap
                .map((item) => {
                  const found = findAdditionalProduct(item.targetProduct);
                  return found
                    ? { ...found, displayName: item.displayName, targetProduct: item.targetProduct, imageUrl: item.imageUrl, price: item.price }
                    : null;
                })
                .filter(Boolean) as (Product & {
                  displayName: string;
                  targetProduct: string;
                  imageUrl: string;
                  price: string;
                })[];

              const handleCardClick = (product: Product & { targetProduct: string }) => {
                const targetName = product.targetProduct.trim().toLowerCase();
                const targetProduct =
                  allProducts.find((p) => p.category === "Additional" && p.name?.trim().toLowerCase() === targetName)
                  || allProducts.find((p) => p.category === "Additional" && p.name?.trim().toLowerCase().includes(targetName));

                if (targetProduct) {
                  navigate(`/product/${targetProduct.id}`, {
                    state: {
                      ...targetProduct,
                      specialVariations: targetProduct.specialVariations || [],
                      details: targetProduct.details || {},
                    },
                  });
                }
              };

              return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                  {additionalProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleCardClick(product)}
                      className="border rounded-xl overflow-hidden text-center hover:shadow-md transition-all bg-white cursor-pointer flex flex-col items-center justify-between w-full h-[300px] md:h-[360px] hover:scale-105 transition-transform duration-200"
                    >
                      <div className="relative w-full aspect-square overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.displayName}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 hover:scale-110"
                        />
                      </div>

                      <div className="p-2 md:p-3 flex flex-col flex-grow justify-between w-full">
                        <h3 className="text-[12px] md:text-sm font-semibold text-gray-700 line-clamp-2">
                          {product.displayName}
                        </h3>
                        <p className="text-[12px] md:text-sm font-bold text-pink-600 mt-1">
                          {product.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;