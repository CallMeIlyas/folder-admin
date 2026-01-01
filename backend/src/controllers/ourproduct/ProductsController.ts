import { Request, Response } from "express"
import { getOrderedProducts } from "../../../data/productDataLoader"
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

  tambahan: ["Additional"],
  additional: ["Additional"],

  kado: ["2D Frame", "3D Frame", "Acrylic Stand"],
  hadiah: ["2D Frame", "3D Frame", "Acrylic Stand"],
  hampers: ["2D Frame", "3D Frame", "Acrylic Stand"]
}

const LOCATION_EXCLUDED_CATEGORIES = [
  "Additional",
  "Softcopy Design"
]

export const getProducts = (req: Request, res: Response) => {
  const {
    search = "",
    category = "",
    shippedFrom = "",
    shippedTo = "",
    sort = "",
    page = "1",
    limit = "16"
  } = req.query

  // =====================
  // LOAD DATA
  // =====================
  let results = [...getOrderedProducts()]

  // =====================
  // ACTIVE PRODUCT ONLY
  // =====================
  results = results.filter(p => p.admin.active !== false)

  // =====================
  // SHIPPED FROM FILTER
  // =====================
if (shippedFrom) {
  const fromList = String(shippedFrom)
    .split(",")
    .map(v => v.trim())

  results = results.filter(p => {
    if (LOCATION_EXCLUDED_CATEGORIES.includes(p.category)) {
      return false
    }

    return p.admin.shippedFrom.some(loc =>
      fromList.includes(loc)
    )
  })
}

  // =====================
  // SHIPPED TO FILTER
  // =====================
if (shippedTo) {
  const toList = String(shippedTo)
    .split(",")
    .map(v => v.trim())

  results = results.filter(p => {
    if (LOCATION_EXCLUDED_CATEGORIES.includes(p.category)) {
      return false
    }

    return p.admin.shippedTo.some(dest =>
      toList.includes(dest)
    )
  })
}

  // =====================
  // SEARCH
  // =====================
  if (search) {
    const q = String(search).toLowerCase().trim()

    let semanticMatch: string[] | null = null

    for (const key in SEMANTIC_KEYWORDS) {
      if (q.includes(key)) {
        semanticMatch = SEMANTIC_KEYWORDS[key]
        break
      }
    }

    if (semanticMatch) {
      results = results.filter(p =>
        semanticMatch!.some(cat =>
          p.category.toLowerCase() === cat.toLowerCase()
        )
      )
    } else {
      results = results.filter(p =>
        p.displayName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    }
  }

  // =====================
  // CATEGORY + SUBCATEGORY
  // =====================
  if (category) {
    const categories = String(category)
      .split(",")
      .map(c => c.toLowerCase().trim())

    results = results.filter(p =>
      categories.some(c =>
        p.category.toLowerCase() === c ||
        `${p.category}/${p.name}`.toLowerCase() === c
      )
    )
  }

  // =====================
  // SORT
  // =====================
  if (sort === "price-asc") {
    results.sort((a, b) => a.price - b.price)
  }

  if (sort === "price-desc") {
    results.sort((a, b) => b.price - a.price)
  }

  if (sort === "best-selling") {
    results = results.filter(p =>
      productService.isBestSelling(p.id, "id").isBestSelling === true
    )
  }

  // =====================
  // PAGINATION
  // =====================
  const pageNum = Math.max(parseInt(page as string), 1)
  const limitNum = Math.max(parseInt(limit as string), 1)

  const totalItems = results.length
  const totalPages = Math.max(Math.ceil(totalItems / limitNum), 1)

  const start = (pageNum - 1) * limitNum
  const paginated = results.slice(start, start + limitNum)

  // =====================
  // RESPONSE
  // =====================
  res.json({
    items: paginated.map(p => ({
      id: p.id,
displayName:
  p.admin?.displayNameOverride?.trim()
    ? p.admin.displayNameOverride
    : `${p.category} ${p.displayName}`,
      category: p.category,
      price: p.price,
      imageUrl: p.imageUrl,
      shippedFrom: p.admin.shippedFrom,
      shippedTo: p.admin.shippedTo
    })),
    page: pageNum,
    totalPages,
    totalItems
  })
}