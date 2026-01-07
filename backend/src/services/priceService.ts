import { getAllProducts } from "../../data/productDataLoader"
import { loadProductAdminConfig } from "../config/productConfig"
import { getPrice } from "../../utils/getPrice"

export const priceService = {
  calculate(productId: string, options: Record<string, string>) {
    const product = getAllProducts().find(p => p.id === productId)
    if (!product) return 0

    const adminConfig = loadProductAdminConfig()
    const admin = adminConfig[productId]

    // ============================================
    // ADMIN OPTION OVERRIDE (SOURCE OF TRUTH)
    // ============================================
    if (admin?.options?.groups?.length && Object.keys(options).length > 0) {
      let total =
        typeof admin.price === "number"
          ? admin.price
          : product.price

      admin.options.groups.forEach(group => {
        const selected = options[group.id]
        if (!selected) return

        const item = group.items.find(
          i => i.value === selected && i.active !== false
        )

        if (typeof item?.price === "number") {
          total += item.price
        }
      })

      return total
    }

    const category = product.category
    const name = product.name

    // ================= 2D FRAME =================
    if (category === "2D Frame") {
      const size = options.size
      const shading = options.shading

      if (!size || !shading) {
        return getPrice(category, name)
      }

      return getPrice(category, `${size} ${shading}`)
    }

    // ================= 3D FRAME =================
    if (category === "3D Frame") {
      const opt = options.packaging
      if (!opt) return getPrice(category, name)

      return getPrice(category, opt)
    }

    // ================= ACRYLIC STAND =================
    if (category === "Acrylic Stand") {
      const opt = options.stand_type
      if (!opt) return getPrice(category, name)

      return getPrice(category, opt)
    }

    // ================= ADDITIONAL =================
    if (category === "Additional") {
      const opt = Object.values(options)[0]
      if (!opt) return getPrice(category, name)

      return getPrice(category, opt)
    }

    // ================= SOFTCOPY =================
    if (category === "Softcopy Design") {
      return getPrice(category, name)
    }

    // ================= FALLBACK =================
    return getPrice(category, name)
  }
}