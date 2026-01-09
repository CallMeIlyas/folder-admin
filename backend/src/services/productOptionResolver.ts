import { priceList } from "../../data/priceList";
import { loadProductAdminConfig } from "../config/productConfig";

// Helper untuk mendapatkan price dengan fallback yang konsisten
const getPriceWithFallback = (value, priceMap, fallbackPrice = 0) => {
  if (priceMap && priceMap[value] !== undefined) {
    return priceMap[value];
  }
  return fallbackPrice;
};

// Helper untuk mendapatkan defaultValue dengan fallback yang konsisten
const getDefaultValueWithFallback = (adminGroup, defaultGroup) => {
  // 1. Cari item aktif pertama di admin
  const firstActive = adminGroup?.items?.find(i => i.active !== false)?.value;
  if (firstActive) return firstActive;

  // 2. Cari defaultValue dari admin group
  const adminDefault = adminGroup?.defaultValue;
  if (adminDefault) return adminDefault;

  // 3. Fallback ke defaultValue default group
  return defaultGroup?.defaultValue;
};

// Fungsi utama untuk merge groups dengan konsistensi logic
const mergeGroupsWithAdmin = (defaultGroups, adminGroups, priceMap = {}) => {
  return defaultGroups.map(defaultGroup => {
    const adminGroup = adminGroups?.find(g => g.id === defaultGroup.id);
    
    // Jika tidak ada admin group, kembalikan default dengan price lookup
    if (!adminGroup) {
      return {
        ...defaultGroup,
        options: defaultGroup.options.map(opt => ({
          ...opt,
          price: getPriceWithFallback(opt.value, priceMap, opt.price)
        }))
      };
    }

    // Jika admin punya items, merge dengan fallback logic
    if (adminGroup.items && adminGroup.items.length > 0) {
      const mergedOptions = adminGroup.items.map(adminItem => {
        // Cari default option yang sesuai
        const defaultOption = defaultGroup.options?.find(
          opt => opt.value === adminItem.value
        );

        // Merge label dengan fallback ke default
        const label = adminItem.label || defaultOption?.label || { 
          id: adminItem.value, 
          en: adminItem.value 
        };

        // Merge image dengan fallback ke default
        const image = adminItem.image || defaultOption?.image;

        // Merge preview
        const preview = adminItem.preview || defaultOption?.preview;

        // Tentukan price: admin price -> priceMap lookup -> default price
        const price = adminItem.price !== undefined 
          ? adminItem.price 
          : getPriceWithFallback(adminItem.value, priceMap, defaultOption?.price);

        // Merge priceMode
        const priceMode = adminItem.priceMode || defaultOption?.priceMode || "override";

        return {
          value: adminItem.value,
          label,
          image,
          preview,
          price,
          priceMode,
          active: adminItem.active
        };
      });

      return {
        ...defaultGroup,
        defaultValue: getDefaultValueWithFallback(adminGroup, defaultGroup),
        options: mergedOptions
      };
    }

    // Jika admin tidak punya items, kembalikan default group
    return {
      ...defaultGroup,
      defaultValue: getDefaultValueWithFallback(adminGroup, defaultGroup),
      options: defaultGroup.options.map(opt => ({
        ...opt,
        price: getPriceWithFallback(opt.value, priceMap, opt.price)
      }))
    };
  });
};

export const resolveProductOptions = (product) => {
  const adminConfig = loadProductAdminConfig();
  const admin = adminConfig[product.id];
  const adminGroups = admin?.options?.groups || [];

// ===============================
// CATEGORY: 2D FRAME
// ===============================
if (product.category === "2D Frame") {
  const sizeOptions = product.sizeFrameOptions || [];
  const prices = priceList["2D frame"] || {}; // Tambahkan priceList untuk 2D
  
  const defaultGroups = [
    {
      id: "size",
      type: "image",
      label: { id: "Ukuran Frame", en: "Frame Size" },
      defaultValue: sizeOptions[0]?.label,
      options: sizeOptions.map(o => ({
        value: o.label,
        label: { id: o.label, en: o.label },
        image: o.image,
        // Tambahkan price dari priceList jika ada
        price: prices[o.label] || 0,
        priceMode: "override"
      }))
    },
    {
      id: "shading",
      type: "image",
      label: { id: "Gaya Shading", en: "Shading Style" },
      defaultValue: "simple shading",
      options: [
        {
          value: "simple shading",
          label: { id: "Simple Shading", en: "Simple Shading" },
          image: "/api/uploads/images/list-products/2D/variation/shading/2D SIMPLE SHADING/2D SIMPLE SHADING.jpg",
          price: 0, // Shading tidak ada biaya tambahan
          priceMode: "override"
        },
        {
          value: "background catalog",
          label: { id: "Background Catalog", en: "Background Catalog" },
          image: "/api/uploads/images/list-products/2D/variation/shading/2D BACKGROUND CATALOG/1.jpg",
          price: 0,
          priceMode: "override"
        },
        {
          value: "bold shading",
          label: { id: "Bold Shading", en: "Bold Shading" },
          image: "/api/uploads/images/list-products/2D/variation/shading/2D BOLD SHADING/2D BOLD SHADING.jpg",
          price: 0,
          priceMode: "override"
        },
        {
          value: "ai",
          label: { id: "AI", en: "AI" },
          image: "/api/uploads/images/list-products/2D/variation/shading/2D BY AI/1.jpg",
          price: 0,
          priceMode: "override"
        }
      ]
    }
  ];

  const mergedGroups = mergeGroupsWithAdmin(defaultGroups, adminGroups, prices);

  // Hitung basePrice: product.price + harga size pertama yang aktif
  const sizeGroup = mergedGroups.find(g => g.id === "size");
  const activeSizePrice = sizeGroup?.options?.find(opt => 
    opt.value === sizeGroup.defaultValue
  )?.price || 0;

  return {
    basePrice: product.price + activeSizePrice,
    groups: mergedGroups
  };
}

  // ===============================
  // CATEGORY: ADDITIONAL
  // ===============================
  if (product.category === "Additional") {
    const prices = priceList["Additional"] || {};
    const name = product.name.toLowerCase();

    // 1. WAJAH KARIKATUR
    if (name.includes("wajah")) {
      const defaultGroups = [
        {
          id: "face_count",
          type: "text",
          label: { id: "Jumlah Wajah", en: "Face Count" },
          defaultValue: "Biaya Tambahan Wajah Banyak 1-9 wajah",
          options: [
            {
              value: "Biaya Tambahan Wajah Banyak 1-9 wajah",
              label: { id: "Wajah Banyak 1–9", en: "Multiple Faces 1–9" },
              priceMode: "override"
            },
            {
              value: "Biaya Tambahan Wajah Banyak diatas 10 wajah",
              label: { id: "Wajah Banyak >10", en: "Multiple Faces Above 10" },
              priceMode: "override"
            }
          ]
        }
      ];

      const mergedGroups = mergeGroupsWithAdmin(defaultGroups, adminGroups, prices);

      return {
        basePrice: 0,
        groups: mergedGroups
      };
    }

    // 2. GANTI FRAME KACA KE ACRYLIC
    if (name.includes("ganti frame") || name.includes("acrylic")) {
      const defaultGroups = [
        {
          id: "acrylic_size",
          type: "text",
          label: { id: "Ukuran Acrylic", en: "Acrylic Size" },
          defaultValue: "Biaya Tambahan Ganti Frame Kaca ke Acrylic A2",
          options: [
            {
              value: "Biaya Tambahan Ganti Frame Kaca ke Acrylic A2",
              label: { id: "A2", en: "A2" },
              priceMode: "override"
            },
            {
              value: "Biaya Tambahan Ganti Frame Kaca ke Acrylic A1",
              label: { id: "A1", en: "A1" },
              priceMode: "override"
            },
            {
              value: "Biaya Tambahan Ganti Frame Kaca ke Acrylic A0",
              label: { id: "A0", en: "A0" },
              priceMode: "override"
            }
          ]
        }
      ];

      const mergedGroups = mergeGroupsWithAdmin(defaultGroups, adminGroups, prices);

      return {
        basePrice: 0,
        groups: mergedGroups
      };
    }

    // 3. EKSPRESS GENERAL
    if (name.includes("biaya ekspress general") || name.includes("biaya express general")) {
      const defaultGroups = [
        {
          id: "express_level",
          type: "text",
          label: { id: "Jenis Express", en: "Express Type" },
          defaultValue: "Biaya Ekspress General",
          options: [
            {
              value: "Biaya Ekspress General",
              label: { id: "Express 1", en: "Express 1" },
              priceMode: "override"
            },
            {
              value: "Biaya Ekspress General 2",
              label: { id: "Express 2", en: "Express 2" },
              priceMode: "override"
            },
            {
              value: "Biaya Ekspress General 3",
              label: { id: "Express 3", en: "Express 3" },
              priceMode: "override"
            }
          ]
        }
      ];

      const mergedGroups = mergeGroupsWithAdmin(defaultGroups, adminGroups, prices);

      return {
        basePrice: 0,
        groups: mergedGroups
      };
    }

    return null;
  }

  // ===============================
  // CATEGORY: 3D FRAME
  // ===============================
  if (product.category === "3D Frame") {
    const prices = priceList["3D frame"] || {};
    const name = product.name.toLowerCase();

    if (name.includes("8r")) {
      const defaultGroups = [
        {
          id: "packaging",
          type: "image",
          label: { id: "Packaging", en: "Packaging" },
          defaultValue: "8R duskraft",
          options: [
            {
              value: "8R duskraft",
              label: { id: "Dus Kraft + Paperbag", en: "Dus Kraft + Paperbag" },
              image: "/api/uploads/images/3d-package-photo/8R/PACKING DUS KRAFT.jpg"
            },
            {
              value: "8R hardbox",
              label: { id: "Black Hardbox + Paperbag", en: "Black Hardbox + Paperbag" },
              image: "/api/uploads/images/3d-package-photo/8R/PACKING HARDBOX.jpg"
            }
          ]
        }
      ];

      const mergedGroups = mergeGroupsWithAdmin(defaultGroups, adminGroups, prices);
      
      // Base price diambil dari harga pertama yang aktif
      const basePriceOption = mergedGroups[0]?.options?.[0];
      const basePrice = basePriceOption?.price || prices["8R duskraft"] || 0;

      return {
        basePrice,
        groups: mergedGroups
      };
    }

    return null;
  }

  // ===============================
  // CATEGORY: ACRYLIC STAND
  // ===============================
  if (product.category === "Acrylic Stand") {
    const prices = priceList["Acrylic Stand"] || {};
    const name = product.name.toLowerCase();

    if (name.includes("3mm")) {
      const defaultGroups = [
        {
          id: "stand_type",
          type: "text",
          label: { id: "Ukuran & Sisi", en: "Size & Side" },
          defaultValue: "Acrylic Stand 3mm size 15x15cm 1 sisi",
          options: [
            {
              value: "Acrylic Stand 3mm size 15x15cm 1 sisi",
              label: { id: "15x15cm 1 sisi", en: "15x15cm 1 side" },
              priceMode: "override"
            },
            {
              value: "Acrylic Stand 3mm size A4 2 sisi",
              label: { id: "A4 2 sisi", en: "A4 2 sides" },
              priceMode: "override"
            },
            {
              value: "Acrylic Stand 3mm size A3 2 sisi",
              label: { id: "A3 2 sisi", en: "A3 2 sides" },
              priceMode: "override"
            }
          ]
        }
      ];

      const mergedGroups = mergeGroupsWithAdmin(defaultGroups, adminGroups, prices);

      return {
        basePrice: 0,
        groups: mergedGroups
      };
    }

    return null;
  }

  return null;
};