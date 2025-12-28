import { allProducts } from "../../data/productDataLoader";
import { getProductDescription } from "../../data/productDescriptions";
import { getPrice } from "../../utils/getPrice";

// =========================
// ===== NORMALIZERS =======
// =========================

const normalize2DShading = (val?: string) => {
  if (!val) return null;

  const map: Record<string, string> = {
    simple: "simple shading",
    bold: "bold shading",
    ai: "ai",
    "background-catalog": "background catalog",
  };

  return map[val.toLowerCase()] || null;
};

const normalize3DPackaging = (val?: string) => {
  if (!val) return null;

  const lower = val.toLowerCase();
  if (lower.includes("duskraft")) return "duskraft";
  if (lower.includes("hardbox")) return "hardbox";

  return null;
};

const normalizeFaceCount = (val?: string) => {
  if (!val) return null;

  const lower = val.toLowerCase();
  if (lower.includes("1–9") || lower.includes("1-9") || lower.includes("1–9 faces") || lower.includes("1-9 faces")) return "1-9";
  if (lower.includes("di atas") || lower.includes("10") || lower.includes("above 10") || lower.includes("diatas")) return "diatas";

  return null;
};

// =========================
// ===== ADDITIONAL KEY RESOLVER (DENGAN BAHASA)
// =========================

const resolveAdditionalKey = (productName: string, options: any, language: 'id' | 'en' = 'id'): string | null => {
  const name = productName.toLowerCase();
  const face = normalizeFaceCount(options.faceCount || options.faceCountOptions);

  // Dictionary untuk terjemahan key
  const keyDictionary = {
    'id': {
      'karikatur': {
        '1-9': "Tambahan Wajah Karikatur 1-9 wajah",
        'diatas': "Tambahan Wajah Karikatur diatas 10 wajah"
      },
      'wajah-banyak': {
        '1-9': "Biaya Tambahan Wajah Banyak 1-9 wajah",
        'diatas': "Biaya Tambahan Wajah Banyak diatas 10 wajah"
      },
      'bold-shading': "Tambahan Wajah Bold Shading",
      'foto-asli': "Tambahan Wajah dari Foto Asli",
      'ai': "Tambahan Wajah by AI",
      'background-custom': "Background Custom",
      'packing': "Biaya Tambahan Packing",
      'acrylic-frame': (size: string) => `Biaya Tambahan Ganti Frame Kaca ke Acrylic ${size}`
    },
    'en': {
      'karikatur': {
        '1-9': "Additional Caricature Face 1-9 faces",
        'diatas': "Additional Caricature Face above 10 faces"
      },
      'wajah-banyak': {
        '1-9': "Additional Cost Many Faces 1-9 faces",
        'diatas': "Additional Cost Many Faces above 10 faces"
      },
      'bold-shading': "Additional Face Bold Shading",
      'foto-asli': "Additional Face from Original Photo",
      'ai': "Additional Face by AI",
      'background-custom': "Custom Background",
      'packing': "Additional Packing Cost",
      'acrylic-frame': (size: string) => `Additional Cost Change Glass Frame to Acrylic ${size}`
    }
  };

  const dict = keyDictionary[language];

  if (name.includes("karikatur") || name.includes("caricature")) {
    if (face === "1-9") return dict['karikatur']['1-9'];
    if (face === "diatas") return dict['karikatur']['diatas'];
    return null;
  }

  if (name.includes("wajah banyak") || name.includes("many faces")) {
    if (face === "1-9") return dict['wajah-banyak']['1-9'];
    if (face === "diatas") return dict['wajah-banyak']['diatas'];
    return null;
  }

  if (name.includes("bold shading")) {
    return dict['bold-shading'];
  }

  if (name.includes("foto asli") || name.includes("original photo")) {
    return dict['foto-asli'];
  }

  if (name.includes("by ai") || name.includes(" ai ")) {
    return dict['ai'];
  }

  if (name.includes("background custom") || name.includes("custom background")) {
    return dict['background-custom'];
  }

  if (name.includes("tambahan packing") || name.includes("additional packing") || name.includes("packing")) {
    return dict['packing'];
  }

  if (name.includes("ekspress") || name.includes("express")) {
    return options.expressOption || null;
  }

  if (name.includes("ganti frame kaca ke acrylic") || name.includes("change glass frame to acrylic")) {
    if (options.acrylicSize) {
      return dict['acrylic-frame'](options.acrylicSize);
    }
    return language === 'id' 
      ? "Biaya Tambahan Ganti Frame Kaca ke Acrylic"
      : "Additional Cost Change Glass Frame to Acrylic";
  }

  return null;
};

// =========================
// ===== SERVICE ===========
// =========================

export const productService = {
  getProductDetail(category: string, name: string, language: 'id' | 'en' = 'id') {
    // Update getProductDescription untuk menerima parameter bahasa
    // Jika getProductDescription tidak mendukung bahasa, kita perlu buat wrapper
    const description = getProductDescription(category, name);
    
    // Jika description sudah berupa object dengan properti bahasa
    if (description && typeof description === 'object' && (description.id || description.en)) {
      return description[language] || description.id || description.en;
    }
    
    // Fallback: return description as-is (untuk backward compatibility)
    return description;
  },

  getBasePrice(productId: string, language: 'id' | 'en' = 'id') {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return 0;
    
    // Jika getPrice mendukung bahasa, update parameter
    // Jika tidak, return harga dasar saja
    return getPrice(product.category, product.name);
  },

  isBestSelling(productId: string, language: 'id' | 'en' = 'id') {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return { isBestSelling: false };

    const name = product.name.toLowerCase();
    const category = product.category.toLowerCase();

    if (
      (category.includes("3d") && (name.includes("12r") || name.includes("10r"))) ||
      (category.includes("2d") && name.includes("8r"))
    ) {
      const labels = {
        id: "Paling populer untuk ukuran",
        en: "Most popular for size"
      };
      return { isBestSelling: true, label: labels[language] };
    }

    return { isBestSelling: false };
  },

  calculatePrice(productId: string, options: any, language: 'id' | 'en' = 'id') {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return 0;

    const category = product.category.toLowerCase();
    let price = 0;

    console.log("========== CALCULATE PRICE ==========");
    console.log("productId:", productId);
    console.log("category:", product.category);
    console.log("name:", product.name);
    console.log("language:", language);
    console.log("options:", options);

    // =========================
    // ===== ADDITIONAL (HARD RULE)
    // =========================
    if (category.includes("additional")) {
      const key = resolveAdditionalKey(product.name, options, language);
      if (key) {
        price = getPrice("Additional", key);
        console.log("[ADDITIONAL] lookup:", key, price);
        return price;
      }
      console.log("[ADDITIONAL] no matching key");
      return 0;
    }

    // =========================
    // ===== 2D FRAME =========
    // =========================
    if (category.includes("2d")) {
      const frameSize = options.frameSize;
      const shadingKey = normalize2DShading(options.shading);

      if (frameSize && shadingKey) {
        price = getPrice("2D frame", shadingKey, frameSize);
        console.log("[2D] lookup:", frameSize, shadingKey, price);
      }

      if (price === 0) {
        price = getPrice(product.category, product.name);
        console.log("[2D] fallback:", price);
      }
    }

    // =========================
    // ===== 3D FRAME =========
    // =========================
    else if (category.includes("3d")) {
      const frameSize = product.name;
      const packaging = normalize3DPackaging(options.packagingOption);

      if (frameSize === "8R" && packaging) {
        const key = `${frameSize} ${packaging}`;
        price = getPrice("3D frame", key);
        console.log("[3D] lookup:", key, price);
      }

      if (price === 0) {
        price = getPrice(product.category, product.name);
        console.log("[3D] fallback:", price);
      }
    }

    // =========================
    // ===== ACRYLIC STAND =====
    // =========================
    else if (category.includes("acrylic stand")) {
      const opt = options.acrylicStandOption;

      if (opt) {
        const key = `Acrylic Stand 3mm size ${opt}`;
        price = getPrice("Acrylic Stand", key);
        console.log("[ACRYLIC] lookup:", key, price);
      }

      if (price === 0) {
        price = getPrice(product.category, product.name);
        console.log("[ACRYLIC] fallback:", price);
      }
    }

    // =========================
    // ===== OTHER ============
    // =========================
else {
      price = getPrice(product.category, product.name);
    }

    console.log("FINAL PRICE:", price);
    console.log("====================================");

    return price;
  },
};

// =========================
// ===== GET ALL PRODUCTS ==
// =========================

export const getAllProducts = async (language: 'id' | 'en' = 'id') => {
  return allProducts.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: getPrice(p.category, p.name),
  }));
};