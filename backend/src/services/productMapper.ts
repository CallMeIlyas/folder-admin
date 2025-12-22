export const productMapper = {
  toProductDetail(data: ProductDetailInput) {
    const { uiText, category, name } = data;
    const categoryLower = category.toLowerCase();
    const nameLower = name.toLowerCase();

    let options: any = {};

// =========================
// 2D FRAME (FINAL FIX)
// =========================
if (categoryLower.includes("2d")) {
  options = {};
}

    // =========================
    // 3D FRAME 8R (PACKAGING)
    // =========================
    if (categoryLower.includes("3d") && nameLower.includes("8r")) {
      options = {
        packagingOptions: [
          { value: "duskraft", label: "Dus Kraft + Paperbag" },
          { value: "hardbox", label: "Black Hardbox + Paperbag" },
        ],
      };
    }

    // =========================
    // ACRYLIC STAND (PRODUCT)
    // =========================
    if (categoryLower.includes("acrylic stand")) {
      if (nameLower.includes("3mm")) {
        options = {
          acrylicStandOptions: [
            "15x15cm 1 sisi",
            "A4 2 sisi",
            "A3 2 sisi",
          ],
        };
      }
    }

    // =========================
    // ADDITIONAL
    // =========================
    if (categoryLower.includes("additional")) {

  // =========================
  // WAJAH KARIKATUR
  // =========================
  if (
    nameLower.includes("wajah karikatur") ||
    nameLower.includes("biaya tambahan wajah karikatur")
  ) {
    options = {
      faceCountOptions: ["1–9 Wajah", "Di atas 10 Wajah"],
    };
  }

  // =========================
  // WAJAH BANYAK (DESIGN CUSTOMER)
  // =========================
  else if (
    nameLower.includes("wajah banyak") ||
    nameLower.includes("biaya tambahan wajah banyak")
  ) {
    options = {
      faceCountOptions: ["1–9 Wajah", "Di atas 10 Wajah"],
    };
  }

  // =========================
  // EKSPRESS
  // =========================
  else if (nameLower.includes("ekspress")) {
    options = {
      expressOptions: ["Option 1", "Option 2", "Option 3"],
    };
  }

  // =========================
  // GANTI FRAME KE ACRYLIC
  // =========================
  else if (nameLower.includes("ganti frame kaca ke acrylic")) {
    options = {
      acrylicSizes: ["A2", "A1", "A0"],
    };
  }

  // =========================
  // DEFAULT ADDITIONAL
  // =========================
  else {
    options = {};
  }
}

    return {
      id: data.id,
      title: uiText.details?.title || data.name,
      category: data.category,

      images: data.images,
      options,

      uiText: {
        ...uiText,
        details: (() => {
          if (!uiText.details) return null;
          const { title, ...rest } = uiText.details;
          return rest;
        })(),
      },

      price: data.price,
      isBestSelling: data.isBestSelling ?? false,
      bestSellingLabel: data.bestSellingLabel,
    };
  },
};