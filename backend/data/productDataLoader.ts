import fs from "fs";
import path from "path";
import { getPrice } from "../utils/getPrice";
import { loadProductAdminConfig } from "../src/config/productConfig";

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
  description?: { en?: string; id?: string } | string | null;
  allImages?: string[];
  specialVariations?: { label: string; value: string }[];
  shadingOptions?: { label: string; value: string; preview?: string }[];
  options?: {
    variations?: string[];
  };
  sizeFrameOptions?: { label: string; value: string; image: string }[];
  details?: Record<string, any>;
  
  // Admin sekarang WAJIB, bukan opsional
  admin: {
    active: boolean;
    showInGallery: boolean;
    shippedFrom: string[];
    shippedTo: string[];
    frames: {
      glass: boolean;
      acrylic: boolean;
    };
    mainImageIndex: number;
    displayNameOverride?: string;
  };
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
  const c = category.toLowerCase()
  const n = name.toLowerCase()

  const glassSizes = ["4r", "6r", "8r", "10r", "12r", "15cm"]
  const acrylicOnlySizes = ["a2", "a1", "a0"]

  if (c.includes("2d")) {
    return ["frameGlass"]
  }

  if (c.includes("3d")) {
    // 🔥 PAKSA ACRYLIC ONLY
    if (acrylicOnlySizes.some(s => n.includes(s))) {
      return ["frameAcrylic"]
    }

    // 🔥 GLASS DEFAULT UNTUK UKURAN KECIL
    if (glassSizes.some(s => n.includes(s))) {
      return ["frameGlass"]
    }
  }

  return []
}

// === Function untuk mendapatkan semua produk ===
export const getAllProducts = (): Product[] => {
  const adminConfig = loadProductAdminConfig();

  return Object.entries(groupedImages)
    .map(([groupKey, images], index) => {
      const [rawCategory, subcategory] = groupKey.split("/");
      const mappedCategory =
        categoryMapping[rawCategory.toUpperCase()] || rawCategory;

      const cleanSub = subcategory?.trim() || null;
      const fileName = cleanSub || `Product ${index + 1}`;

      const productId = `prod-${rawCategory.toLowerCase()}-${(cleanSub || "default")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")}`;

      const admin = adminConfig[productId];

      // LANGKAH 2: Resolve description
      const resolvedDescription = admin?.description ?? null;

      const decodedImages = images.map(img => decodeURIComponent(img));

      let frameVariations: string[] = []

      if (admin?.frames) {
        if (admin.frames.glass === true) {
          frameVariations.push("frameGlass")
        }

        if (admin.frames.acrylic === true) {
          frameVariations.push("frameAcrylic")
        }
      } else {
        frameVariations = getFrameVariations(mappedCategory, fileName)
      }

      // urutan gambar harus STABIL
      const orderedImages = [...decodedImages];

      // ambil index dari admin
      const mainIndex = admin?.mainImageIndex ?? 0;

      // ambil main image dari index
      const mainImage = orderedImages[mainIndex] ?? orderedImages[0];

      const displayName = fileName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      
      // Gunakan displayNameOverride jika ada, atau fallback ke displayName
      const finalDisplayName = admin?.displayNameOverride?.trim() || displayName;
      
      // Clean subcategory untuk fullPath jika ada
      const pathSubcategory = cleanSub ? `/${cleanSub}` : '';
      const fullPath = `/api/uploads/images/list-products/${rawCategory}${pathSubcategory}`;

      // Get shading options hanya untuk 2D Frame
      const shadingOptions = mappedCategory === "2D Frame" ? get2DShadingOptions() : undefined;
      
      // Get size frame options hanya untuk 2D Frame  
      const sizeFrameOptions = mappedCategory === "2D Frame" ? get2DSizeFrameOptions() : undefined;

      // Admin object - SELALU ada dengan nilai default yang jelas
      const adminObject = {
        active: admin?.active !== false,
        showInGallery: admin?.showInGallery !== false,
        shippedFrom: admin?.shippedFrom ?? ["Bogor", "Jakarta"],
        shippedTo: admin?.shippedTo ?? ["Worldwide"],
        frames: admin?.frames || { glass: false, acrylic: false },
        mainImageIndex: mainIndex,
        displayNameOverride: admin?.displayNameOverride?.trim() || ""
      };

      // LANGKAH 3: Return object dengan description
      return {
        id: productId,
        imageUrl: mainImage,
        name: fileName,
        displayName: finalDisplayName, // Gunakan finalDisplayName yang sudah include override
        baseDisplayName: displayName, // Simpan displayName asli tanpa override
        size: "Custom",
        category: mappedCategory,
        subcategory: subcategory || null,
        fullPath: fullPath,
        price: admin?.price ?? getPrice(mappedCategory, fileName),
        description: resolvedDescription, // LANGKAH 3: Tambahkan description ke return object
        allImages: orderedImages,
        admin: adminObject, // SELALU ADA, tidak opsional
        options: {
          variations: frameVariations,
        },
        shadingOptions: shadingOptions,
        sizeFrameOptions: sizeFrameOptions,
      };
    })
    .filter(Boolean) as Product[];
};

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

// === Helper function untuk menemukan produk berdasarkan kategori dan nama ===
const findProduct = (item: { category: string; name: string }, products: Product[]) =>
  products.find(p => p.category === item.category && p.name === item.name) || null;

// === Function untuk mendapatkan produk dengan custom ordering ===
export const getOrderedProducts = (): Product[] => {
  const allProducts = getAllProducts();
  
  const part1 = baris1.map(item => findProduct(item, allProducts)).filter(Boolean) as Product[];
  const part2 = baris2.map(item => findProduct(item, allProducts)).filter(Boolean) as Product[];
  const part3 = baris3.map(item => findProduct(item, allProducts)).filter(Boolean) as Product[];
  const part4 = baris4.map(item => findProduct(item, allProducts)).filter(Boolean) as Product[];

  let orderedProducts = [...part1, ...part2, ...part3, ...part4];
  const usedIds = new Set(orderedProducts.map(p => p.id));
  const remainingProducts = allProducts.filter(p => !usedIds.has(p.id));
  orderedProducts = [...orderedProducts, ...remainingProducts];

  return orderedProducts;
};

// === Function untuk mendapatkan produk gallery ===
export const getGalleryProducts = (): Product[] => {
  const allProducts = getAllProducts();
return allProducts.filter(p => p.admin.showInGallery !== false);
};

// === Export untuk kompatibilitas backward ===
export {
  getAllProducts,
  getOrderedProducts,
  getGalleryProducts
};