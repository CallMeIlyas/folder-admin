import { Request, Response } from "express";
import { getOrderedProducts } from "../../../data/productDataLoader";
import { productService } from "../../services/productService"

// =====================
// SEMANTIC KEYWORDS
// =====================
const SEMANTIC_KEYWORDS: Record<string, string[]> = {
  karikatur: ["2D Frame", "3D Frame"],
  caricature: ["2D Frame", "3D Frame"],
  foto: ["2D Frame", "3D Frame"],
  frame: ["2D Frame", "3D Frame"],
  bingkai: ["2D Frame", "3D Frame"],

  acrylic: ["Acrylic Stand", "3D Frame"],
  standee: ["Acrylic Stand"],
  plakat: ["Acrylic Stand"],

  softcopy: ["Softcopy Design"],
  desain: ["Softcopy Design"],
  "desain aja": ["Softcopy Design"],

  tambahan: ["Additional"],
  additional: ["Additional"],

  kado: ["2D Frame", "3D Frame", "Acrylic Stand"],
  hadiah: ["2D Frame", "3D Frame", "Acrylic Stand"],
  hampers: ["2D Frame", "3D Frame", "Acrylic Stand"],
};

export const getProducts = (req: Request, res: Response) => {
  const {
    search = "",
    category = "",
    sort = "",
    page = "1",
    limit = "16",
  } = req.query;

  // =====================
  // LOAD DATA REALTIME
  // =====================
  let results = [...getOrderedProducts()];

  // =====================
  // ADMIN ACTIVE FILTER
  // =====================
  results = results.filter(p => p.admin?.active !== false);

  // =====================
  // SEARCH
  // =====================
  if (search) {
    const q = String(search).toLowerCase().trim();

    // HARD RULE A3
    if (q.includes("a3")) {
      results = results.filter(p => {
        const name = p.displayName.toLowerCase();
        const cat = p.category.toLowerCase();

        if (
          cat.includes("3d") &&
          name.includes("12r") &&
          !name.includes("by ai")
        ) return true;

        if (
          cat === "additional" &&
          name.includes("ekspress") &&
          name.includes("12r")
        ) return true;

        return false;
      });
    } else {
      let matchedCategories: string[] | null = null;

      for (const key in SEMANTIC_KEYWORDS) {
        if (q.includes(key)) {
          matchedCategories = SEMANTIC_KEYWORDS[key];
          break;
        }
      }

      if (matchedCategories) {
        results = results.filter(p =>
          matchedCategories!.some(cat =>
            p.category.toLowerCase().includes(cat.toLowerCase())
          )
        );
      } else {
        results = results.filter(p =>
          p.displayName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
    }
  }

  // =====================
  // CATEGORY FILTER
  // =====================
  if (category) {
    const categories = String(category)
      .split(",")
      .map(c => c.toLowerCase().trim());

    results = results.filter(p =>
      categories.includes(p.category.toLowerCase())
    );
  }

  // =====================
  // SORT
  // =====================
  if (sort === "price-asc") {
    results.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  }

  if (sort === "price-desc") {
    results.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  }

if (sort === "best-selling") {
  results = results.filter(p =>
    productService.isBestSelling(p.id, "id").isBestSelling === true
  );
}

  // =====================
  // PAGINATION
  // =====================
  const pageNum = Math.max(parseInt(page as string), 1);
  const limitNum = Math.max(parseInt(limit as string), 1);

  const totalItems = results.length;
  const totalPages = Math.max(Math.ceil(totalItems / limitNum), 1);

  const start = (pageNum - 1) * limitNum;
  const paginated = results.slice(start, start + limitNum);

  // =====================
  // RESPONSE
  // =====================
  res.json({
    items: paginated.map(p => ({
      id: p.id,
      displayName: p.displayName,
      category: p.category,
      price: p.price,
      imageUrl: p.imageUrl,
      shippedFrom: p.shippedFrom,
      shippedTo: p.shippedTo,
    })),
    page: pageNum,
    totalPages,
    totalItems,
  });
};