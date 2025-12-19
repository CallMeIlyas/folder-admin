import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { priceList } from "../data/priceList";

export interface CartItem {
  cartId: string;
  id: string;
  name: string;
  variation?: string;
  variationOptions?: string[];
  price: number;
  quantity: number;
  imageUrl: string;
  image: string;
  productType: "frame";
  parentCartId?: string;
  attributes?: {
    is8RProduct?: boolean;
    packagingPriceMap?: Record<string, number>;
    packagingType?: string;
    frameSize?: string;
    shadingStyle?: string;
    isAcrylicStand?: boolean;
    selectedAcrylicOption?: string;
    isAdditionalProduct?: boolean;
    additionalType?: string;
  };
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    item: Omit<CartItem, "cartId"> & {
      attributes?: {
        frameSize?: string;
        shadingStyle?: string;
        isAcrylicStand?: boolean;
        selectedAcrylicOption?: string;
        packagingPriceMap?: Record<string, number>;
        packagingVariations?: string[];
        selectedPackagingVariation?: string;
        isAdditionalProduct?: boolean;
        additionalType?: string;
      };
    }
  ) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  deleteItem: (cartId: string) => void;
  clearCart: () => void;
  getProductGroup: (productId: string) => CartItem[];
  updateItemVariant: (cartId: string, newVariation: string) => void;
  updateShippingCost: (cartId: string, cost: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart:", e);
    }
  }, [cart]);

const addToCart = (
  item: Omit<CartItem, "cartId"> & {
    attributes?: {
      frameSize?: string;
      shadingStyle?: string;
      isAcrylicStand?: boolean;
      selectedAcrylicOption?: string;
      packagingPriceMap?: Record<string, number>;
      packagingVariations?: string[];
      selectedPackagingVariation?: string;
      isAdditionalProduct?: boolean;
      additionalType?: string;
      selectedOption?: string;
    };
  }
) => {
  const { attributes, ...rest } = item;

  const frameSize = attributes?.frameSize?.toLowerCase() || "";
  const shadingStyle = attributes?.shadingStyle?.toLowerCase() || "";
  const is2DFrame = rest.name?.toLowerCase().includes("2d");
  const isAcrylicStand = attributes?.isAcrylicStand || false;
  const selectedAcrylicOption = attributes?.selectedAcrylicOption || "";
  
  const selectedOption = attributes?.selectedOption || "";
  
  // Deteksi Jenis Produk
  const isKarikaturProduct = rest.name?.toLowerCase().includes("wajah karikatur");
  const isManyFacesProduct = rest.name?.toLowerCase().includes("wajah banyak");
  const isExpressProduct = rest.name?.toLowerCase().includes("ekspress general");
  const isAcrylicChangeProduct = rest.name?.toLowerCase().includes("ganti frame kaca ke acrylic");
  
  const isAdditionalProduct = isKarikaturProduct || isManyFacesProduct || 
                             isExpressProduct || isAcrylicChangeProduct ||
                             attributes?.isAdditionalProduct || false;
  
  const is8RProduct = attributes?.is8RProduct || rest.name?.toLowerCase().includes("8r") || false;
  const packagingPriceMap = attributes?.packagingPriceMap || {};
  const packagingVariations = attributes?.packagingVariations || [];
  const selectedPackagingVariation = attributes?.selectedPackagingVariation || "";
  
  let finalProductName = rest.name?.trim() || "";
  let finalPrice = rest.price;

// Logika Harga 2D Frame
if (is2DFrame) {
  const twoDPrices = Object.fromEntries(
    Object.entries(priceList["2D frame"]).map(([k, v]) => [k.toLowerCase(), v])
  );

  let key = `${frameSize} ${shadingStyle}`.trim();
  if (!twoDPrices[key] && frameSize) {
    key = `${frameSize} simple shading`;
  }

  finalPrice = twoDPrices[key] || rest.price;

  // PERBAIKAN: Format nama tanpa "2d" di shading style
  let displayShading = shadingStyle
    .replace(/^2d\s+/i, "")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("Ai", "AI")
    .trim();
  
  // Pastikan tidak ada "2D" di shading style
  displayShading = displayShading.replace(/2d/gi, "").trim();
  
  finalProductName = `2D Frame ${frameSize.toUpperCase()} ${displayShading}`;
}

  // Logika Harga Acrylic Stand
  if (isAcrylicStand) {
    const acrylicPriceMap: Record<string, number> = {
      "15x15cm 1 sisi": priceList["Acrylic Stand"]?.["Acrylic Stand 3mm size 15x15cm 1 sisi"] || 324800,
      "A4 2 sisi": priceList["Acrylic Stand"]?.["Acrylic Stand 3mm size A4 2 sisi"] || 455800,
      "A3 2 sisi": priceList["Acrylic Stand"]?.["Acrylic Stand 3mm size A3 2 sisi"] || 595800,
    };

    finalPrice = acrylicPriceMap[selectedAcrylicOption] || rest.price;
    finalProductName = rest.name;
  }

  // Logika Harga Produk 8R dengan Packaging
  if (is8RProduct && selectedPackagingVariation && packagingPriceMap[selectedPackagingVariation]) {
    finalPrice = packagingPriceMap[selectedPackagingVariation] || rest.price;
  }

  // Logika Harga untuk Produk Additional
  if (isKarikaturProduct) {
    if (selectedOption.includes("10") || selectedOption.toLowerCase().includes("above")) {
      finalPrice = priceList.Additional["Tambahan Wajah Karikatur diatas 10 wajah"] || rest.price;
    } else {
      finalPrice = priceList.Additional["Tambahan Wajah Karikatur 1-9 wajah"] || rest.price;
    }
  }
  
  if (isManyFacesProduct) {
    if (selectedOption.includes("10") || selectedOption.toLowerCase().includes("above")) {
      finalPrice = priceList.Additional["Biaya Tambahan Wajah Banyak diatas 10 wajah"] || rest.price;
    } else {
      finalPrice = priceList.Additional["Biaya Tambahan Wajah Banyak 1-9 wajah"] || rest.price;
    }
  }
  
  if (isExpressProduct) {
    if (selectedOption === "Option 1") {
      finalPrice = priceList.Additional["Biaya Ekspress General"] || rest.price;
    } else if (selectedOption === "Option 2") {
      finalPrice = priceList.Additional["Biaya Ekspress General 2"] || rest.price;
    } else if (selectedOption === "Option 3") {
      finalPrice = priceList.Additional["Biaya Ekspress General 3"] || rest.price;
    }
  }
  
  if (isAcrylicChangeProduct && selectedOption) {
    const priceKey = `Biaya Tambahan Ganti Frame Kaca ke Acrylic ${selectedOption}`;
    finalPrice = priceList.Additional[priceKey] || rest.price;
  }

  // Logika Utama untuk Deteksi Variation
  let finalVariationOptions: string[] = [];
  let defaultVariation = "";

  // Kategori 1: Produk yang Pasti Memiliki Variation
  const hasVariations = () => {
    const nameLower = rest.name?.toLowerCase() || "";
    
    // 1. Produk 2D Frame - selalu punya variant shading
    if (is2DFrame) return true;
    
    // 2. Produk Additional tertentu - punya variant
    if (isAdditionalProduct && 
        (isKarikaturProduct || isManyFacesProduct || isExpressProduct || isAcrylicChangeProduct)) {
      return true;
    }
    
    // 3. Acrylic Stand - punya variant size
    if (isAcrylicStand) return true;
    
    // 4. Produk 8R dengan packaging - punya variant
    if (is8RProduct && packagingVariations.length > 0) return true;
    
    // 5. Produk Frame Kaca/Acrylic reguler (bukan 2D, bukan additional)
    // Hanya jika nama mengandung "frame" dan bukan produk tanpa variant
    if (nameLower.includes("frame") && 
        !nameLower.includes("stand") &&
        !is2DFrame &&
        !isAdditionalProduct) {
      const smallSizes = ["4r", "6r", "8r", "10r", "12r", "15cm", "20cm"];
      const largeSizes = ["a0", "a1", "a2", "a3", "a4"];
      
      const isSmallFrame = smallSizes.some(size => nameLower.includes(size));
      const isLargeFrame = largeSizes.some(size => nameLower.includes(size));
      
      return isSmallFrame || isLargeFrame;
    }
    
    return false;
  };

// Tentukan Variation Options Berdasarkan Jenis Produk
if (hasVariations()) {
  if (is2DFrame) {
    // PERBAIKAN: Tambahkan semua variasi shading yang tersedia
    finalVariationOptions = ["Simple Shading", "Bold Shading", "Background Catalog", "BY AI"];
    defaultVariation = shadingStyle 
      ? shadingStyle.charAt(0).toUpperCase() + shadingStyle.slice(1)
      : "Simple Shading";
  }
    else if (isKarikaturProduct || isManyFacesProduct) {
      finalVariationOptions = ["1–9 Wajah", "Di atas 10 Wajah"];
      defaultVariation = selectedOption || "1–9 Wajah";
    }
    else if (isExpressProduct) {
      finalVariationOptions = ["Option 1", "Option 2", "Option 3"];
      defaultVariation = selectedOption || "Option 1";
    }
    else if (isAcrylicChangeProduct) {
      finalVariationOptions = ["A2", "A1", "A0"];
      defaultVariation = selectedOption || "A2";
    }
    else if (isAcrylicStand) {
      finalVariationOptions = ["15x15cm 1 sisi", "A4 2 sisi", "A3 2 sisi"];
      defaultVariation = selectedAcrylicOption || "15x15cm 1 sisi";
    }
    else if (is8RProduct && packagingVariations.length > 0) {
      finalVariationOptions = packagingVariations;
      defaultVariation = selectedPackagingVariation || packagingVariations[0] || "";
    }
    else {
      const nameLower = rest.name?.toLowerCase() || "";
      const smallSizes = ["4r", "6r", "8r", "10r", "12r", "15cm", "20cm"];
      const largeSizes = ["a0", "a1", "a2", "a3", "a4"];
      
      const isSmallFrame = smallSizes.some(size => nameLower.includes(size));
      const isLargeFrame = largeSizes.some(size => nameLower.includes(size));
      
      if (isSmallFrame) {
        finalVariationOptions = ["Frame Kaca"];
        defaultVariation = "Frame Kaca";
      } 
      else if (isLargeFrame) {
        finalVariationOptions = ["Frame Acrylic"];
        defaultVariation = "Frame Acrylic";
      }
    }
  } else {
    finalVariationOptions = [];
    defaultVariation = "";
  }

  const mainCartItem: CartItem = {
    ...rest,
    cartId: uuidv4(),
    name: finalProductName,
    price: finalPrice,
    quantity: rest.quantity || 1,
    productType: "frame",
    variation: defaultVariation,
    variationOptions: finalVariationOptions,
    image: rest.imageUrl,
    attributes: {
      frameSize: frameSize,
      shadingStyle: shadingStyle,
      isAcrylicStand: isAcrylicStand,
      selectedAcrylicOption: selectedAcrylicOption,
      is8RProduct: is8RProduct,
      packagingPriceMap: packagingPriceMap,
      isAdditionalProduct: isAdditionalProduct,
      additionalType: isKarikaturProduct ? "wajah_karikatur" :
                    isManyFacesProduct ? "wajah_banyak" :
                    isExpressProduct ? "ekspress" :
                    isAcrylicChangeProduct ? "acrylic_change" :
                    isAcrylicStand ? "acrylic_stand" : ""
    }
  };

  setCart((prev) => [...prev, mainCartItem]);
};

  const updateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((p) =>
          p.cartId === cartId
            ? { ...p, quantity: Math.max(0, (p.quantity || 1) + delta) }
            : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  const deleteItem = (cartId: string) => {
    setCart((prev) => prev.filter((p) => p.cartId !== cartId));
  };

  const clearCart = () => setCart([]);

  const getProductGroup = (productId: string) =>
    cart.filter((item) => item.id === productId);

  const updateShippingCost = (cartId: string, cost: number) => {
    setCart((prev) =>
      prev.map((p) =>
        p.cartId === cartId ? { ...p, price: cost } : p
      )
    );
  };

const updateItemVariant = (cartId: string, newVariation: string) => {
  setCart((prev) =>
    prev.map((p) => {
      if (p.cartId !== cartId) return p;
      
      if (!p.variationOptions || p.variationOptions.length === 0) {
        return p;
      }
      
      const updated = { ...p, variation: newVariation };

      // 1. Produk 8R dengan Packaging - NAMA BERUBAH
      if (p.attributes?.is8RProduct && p.attributes?.packagingPriceMap) {
        updated.price = p.attributes.packagingPriceMap[newVariation] || p.price;
        // Untuk 8R, update nama berdasarkan variasi
        const baseName = p.name.replace(/\(.*\)/g, "").trim(); // Hapus keterangan sebelumnya
        updated.name = `${baseName} (${newVariation})`;
        return updated;
      }
      
      // 2. Additional Wajah Karikatur - NAMA TIDAK BERUBAH
      if (p.name.toLowerCase().includes("wajah karikatur")) {
        const key = newVariation.includes("10") || newVariation.toLowerCase().includes("atas")
          ? "Tambahan Wajah Karikatur diatas 10 wajah"
          : "Tambahan Wajah Karikatur 1-9 wajah";
        updated.price = priceList.Additional[key] || p.price;
        return updated;
      }
      
      // 3. Additional Ganti Frame Kaca ke Acrylic - NAMA TIDAK BERUBAH
      if (p.name.toLowerCase().includes("ganti frame kaca ke acrylic")) {
        const key = `Biaya Tambahan Ganti Frame Kaca ke Acrylic ${newVariation}`;
        updated.price = priceList.Additional[key] || p.price;
        return updated;
      }
      
      // 4. Additional Ekspress General - NAMA TIDAK BERUBAH
      if (p.name.toLowerCase().includes("ekspress general")) {
        let key = "Biaya Ekspress General";
        if (newVariation === "Option 2") key = "Biaya Ekspress General 2";
        if (newVariation === "Option 3") key = "Biaya Ekspress General 3";
        
        updated.price = priceList.Additional[key] || p.price;
        return updated;
      }
      
      // 5. Additional Wajah Banyak - NAMA TIDAK BERUBAH
      if (p.name.toLowerCase().includes("wajah banyak")) {
        const key = newVariation.includes("10") || newVariation.toLowerCase().includes("atas")
          ? "Biaya Tambahan Wajah Banyak diatas 10 wajah"
          : "Biaya Tambahan Wajah Banyak 1-9 wajah";
        updated.price = priceList.Additional[key] || p.price;
        return updated;
      }
      
      // 6. Acrylic Stand - NAMA TIDAK BERUBAH
      if (p.attributes?.isAcrylicStand) {
        const acrylicPriceMap: Record<string, number> = {
          "15x15cm 1 sisi": priceList["Acrylic Stand"]?.["Acrylic Stand 3mm size 15x15cm 1 sisi"] || 324800,
          "A4 2 sisi": priceList["Acrylic Stand"]?.["Acrylic Stand 3mm size A4 2 sisi"] || 455800,
          "A3 2 sisi": priceList["Acrylic Stand"]?.["Acrylic Stand 3mm size A3 2 sisi"] || 595800,
        };
        
        updated.price = acrylicPriceMap[newVariation] || p.price;
        return updated;
      }
      
// 7. 2D Frame - NAMA BERUBAH (sesuai kebutuhan shading)
if (p.attributes?.frameSize && p.name.toLowerCase().includes("2d")) {
  const twoDPrices = Object.fromEntries(
    Object.entries(priceList["2D frame"]).map(([k, v]) => [k.toLowerCase(), v])
  );
  
  const frameSize = p.attributes.frameSize.toLowerCase();
  
  // PERBAIKAN: Handle semua jenis shading style
  let shadingStyle = newVariation.toLowerCase();
  if (shadingStyle.includes("simple")) {
    shadingStyle = "simple shading";
  } else if (shadingStyle.includes("bold")) {
    shadingStyle = "bold shading";
  } else if (shadingStyle.includes("background")) {
    shadingStyle = "background catalog";
  } else if (shadingStyle.includes("ai") || shadingStyle.includes("by ai")) {
    shadingStyle = "by ai";
  } else {
    shadingStyle = "simple shading";
  }
  
  let key = `${frameSize} ${shadingStyle}`.trim();
  if (!twoDPrices[key] && frameSize) {
    key = `${frameSize} simple shading`;
  }
  
  updated.price = twoDPrices[key] || p.price;
  
  // PERBAIKAN: Format nama tanpa "2d" di shading style
  let displayShading = newVariation
    .replace(/^2d\s+/i, "")
    .replace(/2d/gi, "")
    .trim();
  
  updated.name = `2D Frame ${frameSize.toUpperCase()} ${displayShading}`;
  
  return updated;
}
      
      // 8. Frame Kaca/Acrylic Reguler - NAMA TIDAK BERUBAH
      if (p.name.toLowerCase().includes("frame") && !p.attributes?.isAcrylicStand) {
        const productKey = p.name.toLowerCase();
        const priceKeys = Object.keys(priceList).filter(key => 
          productKey.includes(key.toLowerCase())
        );
        
        if (priceKeys.length > 0) {
          const mainKey = priceKeys[0];
          const variantKey = newVariation.includes("Acrylic") ? "Acrylic" : "Kaca";
          
          const priceEntries = Object.entries(priceList[mainKey] || {});
          
          const matchingPrice = priceEntries.find(([key]) => 
            key.toLowerCase().includes(variantKey.toLowerCase())
          );
          
          if (matchingPrice) {
            updated.price = matchingPrice[1];
          }
        }
        
        // NAMA TIDAK DIRUBAH! Hanya update variasi dan harga
        return updated;
      }

      return updated;
    })
  );
};

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        deleteItem,
        clearCart,
        getProductGroup,
        updateItemVariant,
        updateShippingCost,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
};