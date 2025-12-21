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
  if (lower.includes("1–9") || lower.includes("1-9")) return "1-9";
  if (lower.includes("di atas") || lower.includes("10")) return "diatas";

  return null;
};

// =========================
// ===== ADDITIONAL KEY RESOLVER
// =========================

const resolveAdditionalKey = (productName: string, options: any): string | null => {
  const name = productName.toLowerCase();
  const face = normalizeFaceCount(options.faceCount);

  if (name.includes("karikatur")) {
    if (face === "1-9") return "Tambahan Wajah Karikatur 1-9 wajah";
    if (face === "diatas") return "Tambahan Wajah Karikatur diatas 10 wajah";
    return null;
  }

  if (name.includes("wajah banyak")) {
    if (face === "1-9") return "Biaya Tambahan Wajah Banyak 1-9 wajah";
    if (face === "diatas") return "Biaya Tambahan Wajah Banyak diatas 10 wajah";
    return null;
  }

  if (name.includes("bold shading")) {
    return "Tambahan Wajah Bold Shading";
  }

  if (name.includes("foto asli")) {
    return "Tambahan Wajah dari Foto Asli";
  }

  if (name.includes("by ai") || name.includes(" ai")) {
    return "Tambahan Wajah by AI";
  }

  if (name.includes("background custom")) {
    return "Background Custom";
  }

  if (name.includes("tambahan packing")) {
    return "Biaya Tambahan Packing";
  }

  if (name.includes("ekspress") || name.includes("express")) {
    return options.expressOption || null;
  }

  if (name.includes("ganti frame kaca ke acrylic")) {
    if (options.acrylicSize) {
      return `Biaya Tambahan Ganti Frame Kaca ke Acrylic ${options.acrylicSize}`;
    }
    return "Biaya Tambahan Ganti Frame Kaca ke Acrylic";
  }

  return null;
};

// =========================
// ===== SERVICE ===========
// =========================

export const productService = {
  getProductDetail(category: string, name: string) {
    return getProductDescription(category, name);
  },

  getBasePrice(productId: string) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return 0;
    return getPrice(product.category, product.name);
  },

  isBestSelling(productId: string) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return { isBestSelling: false };

    const name = product.name.toLowerCase();
    const category = product.category.toLowerCase();

    if (
      (category.includes("3d") && (name.includes("12r") || name.includes("10r"))) ||
      (category.includes("2d") && name.includes("8r"))
    ) {
      return { isBestSelling: true, label: "Paling populer untuk ukuran" };
    }

    return { isBestSelling: false };
  },

  calculatePrice(productId: string, options: any) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return 0;

    const category = product.category.toLowerCase();
    let price = 0;

    console.log("========== CALCULATE PRICE ==========");
    console.log("productId:", productId);
    console.log("category:", product.category);
    console.log("name:", product.name);
    console.log("options:", options);

    // =========================
    // ===== ADDITIONAL (HARD RULE)
    // =========================
    if (category.includes("additional")) {
      const key = resolveAdditionalKey(product.name, options);
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