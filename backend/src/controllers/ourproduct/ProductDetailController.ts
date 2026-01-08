import { Request, Response } from "express"
import { getAllProducts } from "../../../data/productDataLoader"
import { getProductDescription } from "../../../data/productDescriptions"
import { productService } from "../../services/productService"
import { productMapper } from "../../services/productMapper"
import { productLocaleService } from "../../services/productLocaleService"
import { resolveProductOptions } from "../../services/productOptionResolver"
import { loadProductAdminConfig } from "../../config/productConfig"

export const getProductDetail = (req: Request, res: Response) => {
  const { id } = req.params
  const language: "id" | "en" = req.query.lang === "en" ? "en" : "id"

  const products = getAllProducts()
  const product = products.find(p => p.id === id)

  if (!product) {
    return res.status(404).json({
      message:
        language === "id"
          ? "Produk tidak tersedia"
          : "Product unavailable"
    })
  }

  // =====================
  // ADMIN CONFIG (SOURCE OF TRUTH)
  // =====================
  const adminConfig = loadProductAdminConfig()
  const admin = adminConfig[id]

  if (admin && admin.active === false) {
    return res.status(404).json({
      message:
        language === "id"
          ? "Produk tidak tersedia"
          : "Product unavailable"
    })
  }

  // =====================
  // DESKRIPSI PRODUK
  // =====================
  let details: Record<string, string> = {}

  const rawDescription =
    typeof product.description === "string"
      ? product.description
      : product.description?.[language]

  if (rawDescription) {
    details = Object.fromEntries(
      rawDescription
        .split("\n")
        .map(line => {
          const idx = line.indexOf(":")
          if (idx === -1) return null
          return [
            line.slice(0, idx).trim(),
            line.slice(idx + 1).trim()
          ]
        })
        .filter(Boolean) as [string, string][]
    )
  } else {
    const fallback = getProductDescription(
      product.category,
      product.name
    )

    if (fallback && typeof fallback === "object") {
      const { title, ...rest } = fallback as any
      details = rest
    }
  }

  // =====================
  // UI TEXT
  // =====================
  const uiText = productLocaleService.getProductLocale(language)

  // =====================
  // OPTIONS (SINGLE SOURCE OF TRUTH)
  // =====================
  const optionsResolved = resolveProductOptions(product)

  // =====================
  // RESPONSE FINAL
  // =====================
  const response = productMapper.toProductDetail(
  {
    id: product.id,
    category: product.category,
    name: product.displayName || product.name,

    frames: admin?.frames ?? {
      glass: false,
      acrylic: false
    },

    bestSelling: admin?.bestSelling ?? {
      enabled: false,
      label: { id: "", en: "" }
    },

    images: {
      main: product.imageUrl,
      gallery: product.allImages || []
    },

    optionsResolved,

    uiText: {
      ...uiText,
      details
    },

    price:
      admin?.price ??
      product.price ??
      productService.getBasePrice(product.id, language)
  },
  language
)

  res.json(response)
}