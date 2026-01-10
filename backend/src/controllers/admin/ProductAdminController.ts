import { Request, Response } from "express"
import { getAllProducts } from "../../../data/productDataLoader"
import {
  loadProductAdminConfig,
  ProductAdminConfig
} from "../../config/productConfig"
import { getProductDescription } from "../../../data/productDescriptions"
import { resolveProductOptions } from "../../services/productOptionResolver"
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

 const merged = products.map(p => {
  const admin = adminConfig[p.id] || {}

  return {
    ...p,
    displayName:
      admin.displayNameOverride?.trim()
        ? admin.displayNameOverride
        : `${p.category} ${p.displayName}`,

    admin: {
      ...p.admin,
      ...admin
    }
  }
})

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

const mergeOptionGroups = (prevOptions, nextOptions) => {
  const prevGroups = prevOptions?.groups || []
  const nextGroups = nextOptions?.groups || []

  return {
    groups: nextGroups.map(nextGroup => {
      const prevGroup = prevGroups.find(g => g.id === nextGroup.id)

      if (!prevGroup) return nextGroup

      const mergedItems = [
        ...prevGroup.items,
        ...nextGroup.items
      ].reduce((acc, item) => {
        const existing = acc.find(i => i.value === item.value)
        if (!existing) acc.push(item)
        return acc
      }, [])

      return {
        ...prevGroup,
        ...nextGroup,
        items: mergedItems.map(item => {
          const override = nextGroup.items.find(
            i => i.value === item.value
          )
          return override ? { ...item, ...override } : item
        })
      }
    })
  }
}

// ================= UPDATE GENERAL =================
export const updateProductAdminConfig = (req: Request, res: Response) => {
  const { id } = req.params
  const payload = req.body

  const config = loadProductAdminConfig()

  // ✅ NORMALIZE OPTIONS: ENSURE priceMode EXISTS
  const normalizedOptions = payload.options ? {
    groups: payload.options.groups?.map(g => ({
      ...g,
      items: g.items?.map(item => ({
        ...item,
        priceMode: item.priceMode || "override", // ✅ DEFAULT
        active: item.active !== false // ✅ DEFAULT TRUE
      }))
    }))
  } : config[id]?.options

  config[id] = {
    ...(config[id] || {}),
    
    active:
      payload.active ??
      config[id]?.active ??
      true,

    displayNameOverride:
      payload.displayNameOverride ??
      config[id]?.displayNameOverride,
      
    description:
      payload.description ??
      config[id]?.description,

    price:
      payload.price ??
      config[id]?.price,

    shippedFrom:
      payload.shippedFrom ??
      config[id]?.shippedFrom,

    shippedTo:
      payload.shippedTo ??
      config[id]?.shippedTo,

    frames: {
      ...(config[id]?.frames || {}),
      ...(payload.frames || {})
    },
    
    bestSelling: {
      enabled:
        payload.bestSelling?.enabled ??
        config[id]?.bestSelling?.enabled ??
        false,
    
      label: {
        en:
          payload.bestSelling?.label?.en ??
          config[id]?.bestSelling?.label?.en ??
          "",
    
        id:
          payload.bestSelling?.label?.id ??
          config[id]?.bestSelling?.label?.id ??
          ""
      }
    },
    
    mainImageIndex:
      payload.mainImageIndex ??
      config[id]?.mainImageIndex,

    options: normalizedOptions, // ✅ GUNAKAN NORMALIZED
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

const composedDisplayName =
  `${product.category} ${product.displayName}`

const optionsResolved = resolveProductOptions(product)

res.json({
  ...product,

  optionsResolved,

  displayName:
    admin.displayNameOverride?.trim()
      ? admin.displayNameOverride
      : composedDisplayName,

  description: descriptionText,

  admin: {
    active: admin.active ?? true,
    showInGallery: admin.showInGallery ?? true,
    hasOptions: !!optionsResolved,
    frames: admin.frames ?? defaultFrameState,
    mainImageIndex: admin.mainImageIndex ?? 0,
    shippedFrom: admin.shippedFrom ?? product.admin.shippedFrom ?? ["Bogor", "Jakarta"],
    shippedTo: admin.shippedTo ?? product.admin.shippedTo ?? ["Worldwide"],
    displayNameOverride: admin.displayNameOverride ?? "",
    bestSelling: admin.bestSelling ?? {
      enabled: false,
      label: { en: "", id: "" }
    },
    
    options: admin.options ?? null
  }
})
}