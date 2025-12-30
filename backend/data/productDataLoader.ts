import fs from "fs";
import path from "path";
import { getPrice } from "../utils/getPrice";
import { loadProductAdminConfig } from "../src/config/productConfig";

const adminConfig = loadProductAdminConfig();

export interface Product {
  id: string;
  imageUrl: string;
  name: string;
  displayName: string;
  size: string;
  category: string;
  subcategory: string | null;
  fullPath: string;
  price: number;
  shippedFrom: string[];
  shippedTo: string[];
  allImages?: string[];
  specialVariations?: { label: string; value: string }[];
  shadingOptions?: { label: string; value: string; preview?: string }[];
  options?: {
    variations?: string[];
  };
  sizeFrameOptions?: { label: string; value: string; image: string }[];
  details?: Record<string, any>;
  showInGallery?: boolean;
}

// === Mapping Folder → Nama Kategori Custom ===
export const categoryMapping: Record<string, string> = {
  "3D": "3D Frame",
  "2D": "2D Frame",
  "ACRYLIC STAND": "Acrylic Stand",
  "SOFTCOPY DESIGN": "Softcopy Design",
  "ADDITIONAL": "Additional",
};

// ======================================================
// === GANTI import.meta.glob → filesystem scanning =====
// ======================================================

const BASE_DIR = path.join(process.cwd(), "uploads/images/list-products");

// === Group images by folder (IDENTIK LOGIC LAMA) ===
const groupedImages: Record<string, string[]> = {};

const walk = (dir: string) => {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
      return;
    }

    if (!/\.(jpg|jpeg|png|mp4)$/i.test(file)) return;

    const normalized = fullPath.replace(/\\/g, "/").toLowerCase();

    if (normalized.includes("/variation/") || normalized.includes("/variations/")) return;

    const parts = fullPath.split(path.sep);
    const baseIndex = parts.findIndex(p => p === "list-products");
    if (baseIndex === -1) return;

    const rawCategory = parts[baseIndex + 1];
    let subcategory = parts[baseIndex + 2] || null;

    if (subcategory) {
      const lowerSub = subcategory.toLowerCase();
      if (
        lowerSub === "variation" ||
        lowerSub === "variations" ||
        (
          rawCategory.toLowerCase() === "2d" &&
          (lowerSub.includes("shading") || lowerSub.includes("size frame"))
        )
      ) {
        return;
      }
    }

    if (subcategory?.match(/\.(jpg|jpeg|png|mp4)$/i)) {
      subcategory = null;
    }

    const groupKey = subcategory ? `${rawCategory}/${subcategory}` : rawCategory;
    if (!groupedImages[groupKey]) groupedImages[groupKey] = [];

    const publicUrl =
      "/api/uploads/images/list-products/" +
      parts.slice(baseIndex + 1).join("/");

    groupedImages[groupKey].push(publicUrl);
  });
};

walk(BASE_DIR);

// === Helper 2D (SAMA PERSIS) ===
const get2DShadingOptions = () => {
  const options: { label: string; value: string; preview?: string }[] = [];
  const shadingDir = path.join(BASE_DIR, "2D/variations/shading");

  if (!fs.existsSync(shadingDir)) return options;

  fs.readdirSync(shadingDir).forEach(shadingType => {
    const files = fs.readdirSync(path.join(shadingDir, shadingType));
    if (!files.length) return;

    options.push({
      label: shadingType.replace(/2D\s*/i, "").trim(),
      value: shadingType,
      preview: `/api/uploads/images/list-products/2D/variations/shading/${shadingType}/${files[0]}`
    });
  });

  return options;
};

const get2DSizeFrameOptions = () => {
  const options: { label: string; value: string; image: string }[] = [];
  const sizeDir = path.join(BASE_DIR, "2D/variations/size frame");

  if (!fs.existsSync(sizeDir)) return options;

  fs.readdirSync(sizeDir).forEach(file => {
    const sizeName = file.replace(/\.(jpg|jpeg|png)$/i, "");
    options.push({
      label: sizeName,
      value: sizeName.toLowerCase().replace(/\s+/g, "_"),
      image: `/api/uploads/images/list-products/2D/variations/size frame/${file}`
    });
  });

  const sizeOrder = ["4R", "6R", "8R", "12R", "15cm"];
  options.sort(
    (a, b) =>
      (sizeOrder.indexOf(a.label) === -1 ? 99 : sizeOrder.indexOf(a.label)) -
      (sizeOrder.indexOf(b.label) === -1 ? 99 : sizeOrder.indexOf(b.label))
  );

  return options;
};

// === Helper untuk mendapatkan default frame variations ===
const getFrameVariations = (category: string, name: string): string[] => {
  const c = category.toLowerCase();
  const n = name.toLowerCase();

  const glassSizes = ["4r", "6r", "8r", "10r", "12r", "15cm"];
  const acrylicSizes = ["a2", "a1", "a0"];

  if (c.includes("2d")) {
    return ["frameGlass"];
  }

  if (c.includes("3d")) {
    if (acrylicSizes.some(s => n.includes(s))) {
      return ["frameAcrylic"];
    }
    if (glassSizes.some(s => n.includes(s))) {
      return ["frameGlass"];
    }
  }

  return [];
};

// === Generate Semua Produk (IDENTIK) ===
export const allProducts: Product[] = Object.entries(groupedImages)
  .map(([groupKey, images], index) => {
    const [rawCategory, subcategory] = groupKey.split("/");
    const mappedCategory =
      categoryMapping[rawCategory.toUpperCase()] || rawCategory;

    // ✅ FIX: Deklarasi cleanSub dan fileName DI AWAL
    const cleanSub = subcategory?.trim() || null;
    const fileName = cleanSub || `Product ${index + 1}`;

    // Generate product ID
    const productId = `prod-${rawCategory.toLowerCase()}-${(cleanSub || "default")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")}`;

    // Get admin config untuk product ini
    const admin = adminConfig[productId];

    // Skip produk jika tidak aktif di admin config
    if (admin?.active === false) {
      return null;
    }

    const decodedImages = images.map(img => decodeURIComponent(img));

    // ✅ FIX: SEKARANG fileName SUDAH ADA untuk digunakan di sini
    // FRAME OVERRIDE LOGIC: Ganti dengan admin config jika ada
    const defaultFrames = getFrameVariations(mappedCategory, fileName);
    let frameVariations = defaultFrames;
    
    if (admin?.frames) {
      frameVariations = [];
      if (admin.frames.glass) frameVariations.push("frameGlass");
      if (admin.frames.acrylic) frameVariations.push("frameAcrylic");
    }

    // 🔴 PRIORITAS MAIN IMAGE
const mainImage =
  admin?.mainImage ||
  decodedImages.find(img => {
    const f = img.split("/").pop()?.toLowerCase() || "";
    return f === "main image.jpg";
  }) ||
  decodedImages.find(img => {
    const f = img.split("/").pop()?.toLowerCase() || "";
    return f.includes("main image") || f.includes("mainimage");
  }) ||
  decodedImages.find(img => {
    const f = img.split("/").pop()?.toLowerCase() || "";
    return f === "1.jpg";
  }) ||
  decodedImages[0];

    // 🔴 PAKSA MAIN IMAGE DI INDEX 0
    const orderedImages = [
      mainImage,
      ...decodedImages.filter(img => img !== mainImage),
    ];

    // Show in gallery default to true jika tidak ada config
    const showInGallery = admin?.showInGallery !== false;

    return {
      id: productId,
      imageUrl: mainImage,
      name: fileName,
      displayName: subcategory
        ? `${mappedCategory} ${subcategory.replace(/-\s*\d+\s*x\s*\d+\s*cm/i, "").trim()}`
        : mappedCategory,
      size: "Custom",
      category: mappedCategory,
      subcategory: subcategory || null,
      fullPath: `${mappedCategory}${subcategory ? " / " + subcategory : ""}`,
      price: getPrice(mappedCategory, fileName),
      shippedFrom: ["Bogor", "Jakarta"],
      shippedTo: ["Worldwide"],
      allImages: orderedImages,

      options: {
        variations: frameVariations,
      },

      shadingOptions:
        mappedCategory === "2D Frame" ? get2DShadingOptions() : undefined,
      sizeFrameOptions:
        mappedCategory === "2D Frame" ? get2DSizeFrameOptions() : undefined,
      
      // Tambahkan showInGallery dari admin config
      showInGallery: showInGallery
    };
  })
  .filter(Boolean) as Product[]; // Filter out null products

// === Custom Ordering (TIDAK DIUBAH SATU KARAKTER) ===
const baris1 = [
  { category: "3D Frame", name: "12R" },
  { category: "3D Frame", name: "10R" },
  { category: "3D Frame", name: "A2-40X55CM" },
  { category: "3D Frame", name: "A1-55X80CM" },
];

const baris2 = [
  { category: "2D Frame", name: "15cm" },
  { category: "2D Frame", name: "6R" },
  { category: "2D Frame", name: "8R" },
  { category: "2D Frame", name: "12R" },
];

const baris3 = [
  { category: "Acrylic Stand", name: "2CM" },
  { category: "Acrylic Stand", name: "3MM" },
  { category: "Softcopy Design", name: "WITH BACKGROUND CUSTOM" },
  { category: "Additional", name: "BACKGROUND CUSTOM" },
];

const baris4 = [
  { category: "3D Frame", name: "4R" },
  { category: "Additional", name: "BIAYA TAMBAHAN WAJAH KARIKATUR" },
  { category: "Additional", name: "BIAYA EKSPRESS GENERAL" },
  { category: "Additional", name: "BIAYA TAMBAHAN GANTI FRAME KACA KE ACRYLIC" },
];

const findProduct = (item: { category: string; name: string }) =>
  allProducts.find(p => p.category === item.category && p.name === item.name) || null;

const part1 = baris1.map(findProduct).filter(Boolean) as Product[];
const part2 = baris2.map(findProduct).filter(Boolean) as Product[];
const part3 = baris3.map(findProduct).filter(Boolean) as Product[];
const part4 = baris4.map(findProduct).filter(Boolean) as Product[];

let orderedProducts = [...part1, ...part2, ...part3, ...part4];
const usedIds = new Set(orderedProducts.map(p => p.id));
const remainingProducts = allProducts.filter(p => !usedIds.has(p.id));
orderedProducts = [...orderedProducts, ...remainingProducts];

// Export produk untuk gallery (hanya yang showInGallery true)
export const galleryProducts = allProducts.filter(p => p.showInGallery !== false);

export { orderedProducts };