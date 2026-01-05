import { getAllProducts } from "../../data/productDataLoader"
import { getPrice } from "../../utils/getPrice"

export const priceService = {
  calculate(productId: string, options: Record<string, string>) {
    const product = getAllProducts().find(p => p.id === productId)
    if (!product) return 0

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
      if (options.packaging === "Dus Kraft + Paperbag") {
        return getPrice(category, "8R duskraft")
      }

      if (options.packaging === "Black Hardbox + Paperbag") {
        return getPrice(category, "8R hardbox")
      }

      return getPrice(category, name)
    }

    // ================= ACRYLIC STAND =================
    if (category === "Acrylic Stand") {
      if (name.toLowerCase().includes("3mm") && options.stand_type) {
        return getPrice(
          category,
          `Acrylic Stand 3mm size ${options.stand_type}`
        )
      }

      return getPrice(category, name)
    }

    // ================= ADDITIONAL =================
    if (category === "Additional") {
      const opt = Object.values(options)[0]
      if (!opt) return getPrice(category, name)

      // EXPRESS GENERAL
      if (name.toLowerCase().includes("ekspress general")) {
        if (opt === "opt1") return getPrice(category, "Biaya Ekspress General")
        if (opt === "opt2") return getPrice(category, "Biaya Ekspress General 2")
        if (opt === "opt3") return getPrice(category, "Biaya Ekspress General 3")
      }

      // GANTI FRAME ACRYLIC
      if (name.toLowerCase().includes("ganti frame kaca")) {
        return getPrice(
          category,
          `Biaya Tambahan Ganti Frame Kaca ke Acrylic ${opt}`
        )
      }

      // WAJAH KARIKATUR / WAJAH BANYAK
      if (name.toLowerCase().includes("wajah")) {
        return getPrice(category, `${name} ${opt}`)
      }

      // DEFAULT ADDITIONAL
      return getPrice(category, name)
    }

    // ================= SOFTCOPY =================
    if (category === "Softcopy Design") {
      return getPrice(category, name)
    }

    // ================= FALLBACK =================
    return getPrice(category, name)
  }
}