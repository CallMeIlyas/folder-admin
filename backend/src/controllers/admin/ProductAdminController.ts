import { Request, Response } from "express"
import { getAllProducts } from "../../../data/productDataLoader"
import {
  loadProductAdminConfig,
  ProductAdminConfig
} from "../../config/productConfig"
import { getProductDescription } from "../../../data/productDescriptions"
import fs from "fs"
import path from "path"

const CONFIG_PATH = path.join(
  process.cwd(),
  "content/admin/products.json"
)

const saveConfig = (config: Record<string, ProductAdminConfig>) => {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
}

// ================= LIST =================
export const getAllProductsAdmin = (_req: Request, res: Response) => {
  const adminConfig = loadProductAdminConfig()
  const products = getAllProducts()

  const merged = products.map(p => ({
    ...p,
    admin: {
      active: adminConfig[p.id]?.active ?? true,
      showInGallery: adminConfig[p.id]?.showInGallery ?? true
    }
  }))

  res.json(merged)
}

// ================= UPDATE ACTIVE =================
export const updateProductActive = (req: Request, res: Response) => {
  const { id } = req.params
  const { active } = req.body

  const config = loadProductAdminConfig()
  config[id] = { ...(config[id] || {}), active }

  saveConfig(config)
  res.json({ success: true })
}

// ================= UPDATE GALLERY =================
export const updateProductGallery = (req: Request, res: Response) => {
  const { id } = req.params
  const { showInGallery } = req.body

  const config = loadProductAdminConfig()
  config[id] = { ...(config[id] || {}), showInGallery }

  saveConfig(config)
  res.json({ success: true })
}

// ================= UPDATE FRAMES =================
export const updateProductFrames = (req: Request, res: Response) => {
  const { id } = req.params
  const { glass, acrylic } = req.body

  const config = loadProductAdminConfig()
  config[id] = {
    ...(config[id] || {}),
    frames: { glass, acrylic }
  }

  saveConfig(config)
  res.json({ success: true })
}

// ================= UPDATE MAIN IMAGE =================
export const updateProductMainImage = (req: Request, res: Response) => {
  const { id } = req.params
  const { mainImageIndex } = req.body

  const config = loadProductAdminConfig()
  config[id] = { ...(config[id] || {}), mainImageIndex }

  saveConfig(config)
  res.json({ success: true })
}

// ================= UPDATE GENERAL =================
export const updateProductAdminConfig = (req: Request, res: Response) => {
  const { id } = req.params
  const payload = req.body

  const config = loadProductAdminConfig()

  config[id] = {
    ...(config[id] || {}),
    ...payload,
    frames: {
      ...(config[id]?.frames || {}),
      ...(payload.frames || {})
    }
  }

  saveConfig(config)
  res.json({ success: true })
}

// ================= DETAIL =================
export const getProductAdminById = (req: Request, res: Response) => {
  const { id } = req.params

  const adminConfig = loadProductAdminConfig()
  const products = getAllProducts()
  const product = products.find(p => p.id === id)

  if (!product) {
    return res.status(404).json({ message: "Product not found" })
  }

  const admin = adminConfig[id] || {}

const descriptionText =
  admin.description ??
  (() => {
    const descriptionObject = getProductDescription(
      product.category,
      product.name
    )

    return descriptionObject
      ? Object.entries(descriptionObject)
          .filter(([key]) => key !== "title")
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n")
      : ""
  })()


const frameVariations = product.options?.variations || []

const defaultFrameState = {
  glass: frameVariations.includes("frameGlass"),
  acrylic: frameVariations.includes("frameAcrylic")
}

res.json({
  ...product,
  description: descriptionText,
  admin: {
    active: admin.active ?? true,
    showInGallery: admin.showInGallery ?? true,
    frames: admin.frames ?? defaultFrameState,
    mainImageIndex: admin.mainImageIndex ?? product.admin.mainImageIndex ?? 0
  }
})
}