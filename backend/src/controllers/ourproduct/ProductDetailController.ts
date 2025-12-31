import { Request, Response } from "express"
import { getAllProducts } from "../../../data/productDataLoader"
import { getProductDescription } from "../../../data/productDescriptions"
import { productService } from "../../services/productService"
import { productMapper } from "../../services/productMapper"
import { productLocaleService } from "../../services/productLocaleService"

export const getProductDetail = (req: Request, res: Response) => {
  const { id } = req.params
  const lang = req.query.lang === "en" ? "en" : "id"
  const language: "id" | "en" = lang

  const products = getAllProducts()
  const product = products.find(p => p.id === id)

  if (!product || product.admin?.active === false) {
    return res.status(404).json({
      message:
        language === "id"
          ? "Produk tidak tersedia"
          : "Product unavailable"
    })
  }

  // ===== DESKRIPSI FINAL =====
let details: Record<string, string> | null = null

if (product.admin?.description) {
  const rawDesc =
    typeof product.admin.description === "string"
      ? product.admin.description
      : product.admin.description[language]

  if (rawDesc) {
    details = Object.fromEntries(
      rawDesc
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
  }
} else {
  const fallback = getProductDescription(
    product.category,
    product.name
  )

  if (fallback) {
    const { title, ...rest } = fallback as any
    details = rest
  }
}
  const uiText = productLocaleService.getProductLocale(language)

  const response = productMapper.toProductDetail(
    {
      id: product.id,
      category: product.category,
      name: product.name,

      images: {
        main: product.imageUrl,
        gallery: product.allImages || []
      },

      options: {
        variations: product.options?.variations || [],
        shadingOptions: product.shadingOptions,
        sizeFrameOptions: product.sizeFrameOptions
      },

      uiText: {
        ...uiText,
        details: details || {}
      },

      price: product.price ?? productService.getBasePrice(product.id, language),

      isBestSelling:
        productService.isBestSelling(product.id, language).isBestSelling,

      bestSellingLabel:
        productService.isBestSelling(product.id, language).label || ""
    },
    language
  )

  res.json(response)
}