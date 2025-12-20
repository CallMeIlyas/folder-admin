import { Request, Response } from "express";
import { orderedProducts } from "../../data/productDataLoader";

export const getProducts = (req: Request, res: Response) => {
  const {
    search = "",
    category = "",
    sort = "",
    page = "1",
    limit = "16",
  } = req.query;

  let results = [...orderedProducts];

  // =====================
  // SEARCH
  // =====================
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(p =>
      p.displayName.toLowerCase().includes(q)
    );
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
  switch (sort) {
    case "price-asc":
      results.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      break;

    case "price-desc":
      results.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      break;

    case "best-selling":
      results = results.filter(p => {
        const name = p.displayName.toLowerCase();
        const category = p.category.toLowerCase();

        if (category.includes("3d") && (name.includes("12r") || name.includes("10r")) && !name.includes("by ai")) {
          return true;
        }
        if (category.includes("2d") && name.includes("8r")) {
          return true;
        }
        if (name.includes("acrylic stand") && name.includes("2cm")) {
          return true;
        }
        return false;
      });
      break;
  }

  // =====================
  // PAGINATION
  // =====================
  const pageNum = Math.max(parseInt(page as string, 10), 1);
  const limitNum = Math.max(parseInt(limit as string, 10), 1);

  const totalItems = results.length;
  const totalPages = Math.max(Math.ceil(totalItems / limitNum), 1);

  const start = (pageNum - 1) * limitNum;
  const end = start + limitNum;

  const paginated = results.slice(start, end);

  // =====================
  // RESPONSE SHAPE
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