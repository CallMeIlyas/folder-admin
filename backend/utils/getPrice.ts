import { priceList } from "../data/priceList";

export function getPrice(
  category: string,
  name: string,
  size?: string
): number {
  if (!category || !name) return 0;

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const normalizedCategory = normalize(category);
  const normalizedName = normalize(name);
  const normalizedSize = size ? normalize(size) : "";

  const matchedCategory = Object.keys(priceList).find(
    key => normalize(key) === normalizedCategory
  );

  if (!matchedCategory) {
    console.warn("Category not found:", category);
    return 0;
  }

  const categoryData = priceList[matchedCategory as keyof typeof priceList];
  let matchedKey: string | undefined;

  // =========================
  // ADDITIONAL (SMART RESOLVE)
  // =========================
  if (normalizedCategory === "additional") {
  matchedKey = Object.keys(categoryData).find(key => {
    const k = normalize(key);

    // ===== KARIKATUR =====
    if (normalizedName.includes("karikatur")) {
      if (normalizedName.includes("1 9")) {
        return k.includes("karikatur") && k.includes("1 9");
      }
      if (normalizedName.includes("diatas") || normalizedName.includes("10")) {
        return k.includes("karikatur") && k.includes("diatas");
      }
      return k.includes("karikatur");
    }

    // ===== WAJAH BANYAK =====
    if (normalizedName.includes("wajah banyak")) {
      if (normalizedName.includes("1 9")) {
        return k.includes("wajah banyak") && k.includes("1 9");
      }
      if (normalizedName.includes("diatas") || normalizedName.includes("10")) {
        return k.includes("wajah banyak") && k.includes("diatas");
      }
      return k.includes("wajah banyak");
    }

    // ===== BOLD SHADING =====
    if (normalizedName.includes("bold")) {
      return k.includes("bold shading");
    }

    // ===== FOTO ASLI =====
    if (normalizedName.includes("foto")) {
      return k.includes("foto");
    }

    // ===== AI =====
    if (normalizedName.includes("ai")) {
      return k.includes("ai");
    }

    // ===== EXPRESS =====
    if (normalizedName.includes("ekspress") || normalizedName.includes("express")) {
      return k.includes("ekspress");
    }

    return k === normalizedName;
  });
}

  // =========================
  // OTHER PRODUCTS
  // =========================
  else {
    matchedKey = Object.keys(categoryData).find(key => {
      const k = normalize(key);
      return (
        k.includes(normalizedName) &&
        (!normalizedSize || k.includes(normalizedSize))
      );
    });
  }

  if (!matchedKey) {
    console.warn("Price key not found:", name);
    return 0;
  }

  const price = categoryData[matchedKey as keyof typeof categoryData];
  return typeof price === "number" ? price : 0;
}