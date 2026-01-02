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
  const tOption = (id: string, en: string) =>
  language === "id" ? id : en

  const products = getAllProducts()
  const product = products.find(p => p.id === id)

  if (!product || product.admin.active === false) {
    return res.status(404).json({
      message:
        language === "id"
          ? "Produk tidak tersedia"
          : "Product unavailable"
    })
  }

  // =====================
  // DESKRIPSI FINAL
  // =====================
  let details: Record<string, string> = {}

  if (product.description) {
    const rawDesc =
      typeof product.description === "string"
        ? product.description
        : product.description[language]

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

  // =====================
  // UI TEXT
  // =====================
  const uiText = productLocaleService.getProductLocale(language)



// variations

const frameVariationLabelMap: Record<
  string,
  { id: string; en: string }
> = {
  frameGlass: {
    id: "Frame Kaca",
    en: "Glass Frame",
  },
  frameAcrylic: {
    id: "Frame Acrylic",
    en: "Acrylic Frame",
  },
}
  // =====================
  // RESPONSE
  // =====================
  const response = productMapper.toProductDetail(
    {
      id: product.id,

      category: product.category,

      // NAMA PRODUK FINAL
      name: product.displayName || product.name,

      images: {
        main: product.imageUrl,
        gallery: product.allImages || []
      },

options: {
variations:
  product.options?.variations?.map(v => ({
    value: v,
    label: frameVariationLabelMap[v]?.[language] ?? v,
  })) || [],
  
  faceCountOptions:
    product.category.toLowerCase().includes("additional") &&
    product.name.toLowerCase().includes("wajah")
      ? [
          { value: "1-9", label: tOption("1–9 Wajah", "1–9 Faces") },
          { value: "10+", label: tOption("Di atas 10 Wajah", "Above 10 Faces") }
        ]
      : [],

expressOptions:
  product.category.toLowerCase().includes("additional") &&
  product.name.toLowerCase().includes("ekspress")
    ? [
        {
          value: "option-1",
          label: "Option 1"
        },
        {
          value: "option-2",
          label: "Option 2"
        },
        {
          value: "option-3",
          label: "Option 3"
        }
      ]
    : [],
    
  acrylicSizes:
    product.category.toLowerCase().includes("additional") &&
    product.name.toLowerCase().includes("acrylic")
      ? [
          { value: "a2", label: "A2" },
          { value: "a1", label: "A1" },
          { value: "a0", label: "A0" }
        ]
      : [],
},

      uiText: {
        ...uiText,
        details
      },

      price:
        product.price ??
        productService.getBasePrice(product.id, language),

      isBestSelling:
        productService.isBestSelling(product.id, language).isBestSelling,

      bestSellingLabel:
        productService.isBestSelling(product.id, language).label || ""
    },
    language
  )

  res.json(response)
}