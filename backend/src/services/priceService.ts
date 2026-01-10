import { getAllProducts } from "../../data/productDataLoader"
import { loadProductAdminConfig } from "../config/productConfig"
import { getPrice } from "../../utils/getPrice"
import { resolveProductOptions } from "./productOptionResolver"

export const priceService = {
  calculate(productId: string, options: Record<string, string>) {
    const product = getAllProducts().find(p => p.id === productId)
    if (!product) return 0

    const adminConfig = loadProductAdminConfig()
    const admin = adminConfig[productId]

    const category = product.category
    const name = product.name

    // ✅ RESOLVE OPTIONS DULU
    const resolved = resolveProductOptions(product)

    // ===============================
    // 1. 2D FRAME
    // ===============================
    if (category === "2D Frame") {
  if (!resolved?.groups || resolved.groups.length === 0) {
    return typeof admin?.price === "number"
      ? admin.price
      : product.price
  }

let total =
  typeof resolved?.basePrice === "number"
    ? resolved.basePrice
    : typeof admin?.price === "number"
      ? admin.price
      : product.price
      
      if (Object.keys(options || {}).length === 0) {
  return total
}
      
  for (const group of resolved.groups) {
    const selectedValue = options?.[group.id]
    if (!selectedValue) continue

    const item = group.options.find(
      o => o.value === selectedValue && o.active !== false
    )

    if (!item || typeof item.price !== "number") continue

    if (item.priceMode === "override") {
      total = item.price
    } else {
      total += item.price
    }
  }

  return total
}

    // ===============================
    // 2. 3D FRAME
    // ===============================
    if (category === "3D Frame") {
  if (!resolved?.groups || resolved.groups.length === 0) {
    return typeof admin?.price === "number"
      ? admin.price
      : product.price
  }

  // Ambil option pertama (3D hanya punya 1 group)
  const group = resolved.groups[0]

  const selectedValue = options?.[group.id]
  if (!selectedValue) {
    return typeof admin?.price === "number"
      ? admin.price
      : product.price
  }

  const item = group.options.find(
    o => o.value === selectedValue && o.active !== false
  )

  if (item?.priceMode === "override" && typeof item.price === "number") {
    return item.price
  }

  return typeof admin?.price === "number"
    ? admin.price
    : product.price
}

    // ===============================
    // 3. ACRYLIC STAND
    // ===============================
    if (category === "Acrylic Stand") {
      const selected = options?.stand_type
      if (!selected) return 0

      // ✅ PAKAI RESOLVED
      if (resolved?.groups) {
        const group = resolved.groups.find(g => g.id === "stand_type")
        const item = group?.options?.find(
          o => o.value === selected && o.active !== false
        )

        if (item?.priceMode === "override" && typeof item.price === "number") {
          return item.price
        }
      }

      return 0
    }

    // ===============================
    // 4. ADDITIONAL
    // ===============================
    if (category === "Additional") {
      if (!resolved?.groups || resolved.groups.length === 0) {
        return typeof admin?.price === "number"
          ? admin.price
          : product.price
      }

      const selectedValue = Object.values(options || {})[0]
      if (!selectedValue) return 0

      // ✅ PAKAI RESOLVED
      const group = resolved.groups[0]
      const item = group?.options?.find(
        o => o.value === selectedValue && o.active !== false
      )

      if (item?.priceMode === "override" && typeof item.price === "number") {
        return item.price
      }

      return 0
    }

    // ===============================
    // 5. FALLBACK
    // ===============================
    if (typeof admin?.price === "number") {
      return admin.price
    }

    return product.price
  }
}