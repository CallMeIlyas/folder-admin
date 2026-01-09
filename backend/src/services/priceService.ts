import { getAllProducts } from "../../data/productDataLoader"
import { loadProductAdminConfig } from "../config/productConfig"
import { getPrice } from "../../utils/getPrice"

export const priceService = {
  calculate(productId: string, options: Record<string, string>) {
    const product = getAllProducts().find(p => p.id === productId)
    if (!product) return 0

    const adminConfig = loadProductAdminConfig()
    const admin = adminConfig[productId]

    const category = product.category
    const name = product.name

    // ===============================
    // 1. 2D FRAME (LOOKUP ONLY)
    // ===============================
    if (category === "2D Frame") {
      const size = options?.size
      const shading = options?.shading

      if (!size || !shading) {
        return typeof admin?.price === "number"
          ? admin.price
          : product.price
      }

      return getPrice("2D Frame", `${size} ${shading}`)
    }

    // ===============================
    // 2. 3D FRAME (PACKAGING LOOKUP)
    // ===============================
    if (category === "3D Frame") {
      const packaging = options?.packaging

      if (!packaging) {
        return typeof admin?.price === "number"
          ? admin.price
          : getPrice("3D Frame", name)
      }

      return getPrice("3D Frame", packaging)
    }

    // ===============================
    // 3. ACRYLIC STAND (ABSOLUTE OPTION)
    // ===============================
    if (category === "Acrylic Stand") {
      const group = admin?.options?.groups?.find(g => g.id === "stand_type")
      const selected = options?.stand_type
      if (!group || !selected) return 0

      const item = group.items.find(
        i => i.value === selected && i.active !== false
      )

      return typeof item?.price === "number" ? item.price : 0
    }

    // ===============================
    // 4. ADDITIONAL (ABSOLUTE OPTION)
    // ===============================
    if (category === "Additional") {
      const group = admin?.options?.groups?.[0]
      if (!group) {
        return typeof admin?.price === "number"
          ? admin.price
          : product.price
      }

      const selectedValue = Object.values(options || {})[0]
      if (!selectedValue) return 0

      const item = group.items.find(
        i => i.value === selectedValue && i.active !== false
      )

      return typeof item?.price === "number" ? item.price : 0
    }

    // ===============================
    // 5. FALLBACK (NO OPTIONS)
    // ===============================
    if (typeof admin?.price === "number") {
      return admin.price
    }

    return product.price
  }
}