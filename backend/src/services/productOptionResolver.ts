import { priceList } from "../../data/priceList"
import { loadProductAdminConfig } from "../config/productConfig"

export const resolveProductOptions = (product) => {
  const adminConfig = loadProductAdminConfig()
  const admin = adminConfig[product.id]

  // ===============================
  // ADMIN OVERRIDE (SOURCE OF TRUTH)
  // ===============================
  if (admin?.options?.groups?.length) {
    return {
      groups: admin.options.groups.map(group => {
        const activeItems = group.items.filter(i => i.active !== false)

        const defaultValue =
          group.defaultValue && activeItems.some(i => i.value === group.defaultValue)
            ? group.defaultValue
            : activeItems[0]?.value

        return {
          id: group.id,
          type: group.type,
          label: group.label,
          defaultValue,
          options: activeItems.map(i => ({
            value: i.value,
            label: i.label,
            image: i.image,
            preview: i.preview,
            price: i.price
          }))
        }
      })
    }
  }

  // ===============================
  // 2D FRAME
  // ===============================
  if (product.category === "2D Frame") {
    const sizes = ["4R", "15cm", "6R", "8R", "12R"]

    const shadings = [
      { key: "simple shading", label: "Simple Shading", image: "/api/uploads/images/list-products/2D/variation/shading/2D SIMPLE SHADING/2D SIMPLE SHADING.jpg" },
      { key: "background catalog", label: "Background Catalog", image: "/api/uploads/images/list-products/2D/variation/shading/2D BACKGROUND CATALOG/1.jpg" },
      { key: "bold shading", label: "Bold Shading", image: "/api/uploads/images/list-products/2D/variation/shading/2D BOLD SHADING/2D BOLD SHADING.jpg" },
      { key: "ai", label: "AI", image: "/api/uploads/images/list-products/2D/variation/shading/2D BY AI/1.jpg" }
    ]

    return {
      basePrice: product.price,
      groups: [
        {
          id: "size",
          type: "image",
          label: { id: "Ukuran Frame", en: "Frame Size" },
          defaultValue: sizes[0],
          options: sizes.map(size => ({
            value: size,
            label: { id: size, en: size },
            image: product.sizeFrameOptions?.find(o => o.label === size)?.image
          }))
        },
        {
          id: "shading",
          type: "image",
          label: { id: "Gaya Shading", en: "Shading Style" },
          defaultValue: "simple shading",
          options: shadings.map(s => {
            const key = `${sizes[0]} ${s.key}`
            return {
              value: s.key,
              label: { id: s.label, en: s.label },
              image: s.image,
              price: priceList["2D frame"]?.[key]
            }
          })
        }
      ]
    }
  }

  // ===============================
  // ADDITIONAL
  // ===============================
  if (product.category === "Additional") {
    const prices = priceList["Additional"]
    const name = product.name.toLowerCase()

    if (name.includes("wajah karikatur")) {
      return {
        basePrice: product.price,
        groups: [
          {
            id: "face_count",
            type: "text",
            label: { id: "Jumlah Wajah", en: "Face Count" },
            options: [
              {
                value: "Tambahan Wajah Karikatur 1-9 wajah",
                label: { id: "1–9 Wajah", en: "1–9 Faces" },
                price: prices["Tambahan Wajah Karikatur 1-9 wajah"]
              },
              {
                value: "Tambahan Wajah Karikatur diatas 10 wajah",
                label: { id: "Di atas 10 Wajah", en: "Above 10 Faces" },
                price: prices["Tambahan Wajah Karikatur diatas 10 wajah"]
              }
            ]
          }
        ]
      }
    }

    if (name.includes("wajah banyak")) {
      return {
        basePrice: product.price,
        groups: [
          {
            id: "face_count",
            type: "text",
            label: { id: "Jumlah Wajah", en: "Face Count" },
            options: [
              {
                value: "Biaya Tambahan Wajah Banyak 1-9 wajah",
                label: { id: "1–9 Wajah", en: "1–9 Faces" },
                price: prices["Biaya Tambahan Wajah Banyak 1-9 wajah"]
              },
              {
                value: "Biaya Tambahan Wajah Banyak diatas 10 wajah",
                label: { id: "Di atas 10 Wajah", en: "Above 10 Faces" },
                price: prices["Biaya Tambahan Wajah Banyak diatas 10 wajah"]
              }
            ]
          }
        ]
      }
    }

    if (name.includes("ekspress general")) {
      return {
        basePrice: product.price,
        groups: [
          {
            id: "express_level",
            type: "text",
            label: { id: "Jenis Express", en: "Express Type" },
            options: [
              { value: "Biaya Ekspress General", label: { id: "Express 1", en: "Express 1" }, price: prices["Biaya Ekspress General"] },
              { value: "Biaya Ekspress General 2", label: { id: "Express 2", en: "Express 2" }, price: prices["Biaya Ekspress General 2"] },
              { value: "Biaya Ekspress General 3", label: { id: "Express 3", en: "Express 3" }, price: prices["Biaya Ekspress General 3"] }
            ]
          }
        ]
      }
    }

    if (name.includes("ganti frame kaca ke acrylic")) {
      return {
        basePrice: prices["Biaya Tambahan Ganti Frame Kaca ke Acrylic"],
        groups: [
          {
            id: "acrylic_size",
            type: "text",
            label: { id: "Ukuran Acrylic", en: "Acrylic Size" },
            options: [
              { value: "Biaya Tambahan Ganti Frame Kaca ke Acrylic A2", label: { id: "A2", en: "A2" }, price: prices["Biaya Tambahan Ganti Frame Kaca ke Acrylic A2"] },
              { value: "Biaya Tambahan Ganti Frame Kaca ke Acrylic A1", label: { id: "A1", en: "A1" }, price: prices["Biaya Tambahan Ganti Frame Kaca ke Acrylic A1"] },
              { value: "Biaya Tambahan Ganti Frame Kaca ke Acrylic A0", label: { id: "A0", en: "A0" }, price: prices["Biaya Tambahan Ganti Frame Kaca ke Acrylic A0"] }
            ]
          }
        ]
      }
    }

    return null
  }

  // ===============================
  // 3D FRAME
  // ===============================
  if (product.category === "3D Frame") {
    if (product.name.toLowerCase().includes("8r")) {
      const prices = priceList["3D frame"]

      return {
        basePrice: prices["8R duskraft"],
        groups: [
          {
            id: "packaging",
            type: "image",
            label: { id: "Packaging", en: "Packaging" },
            options: [
              {
                value: "8R duskraft",
                label: { id: "Dus Kraft + Paperbag", en: "Dus Kraft + Paperbag" },
                image: "/api/uploads/images/3d-package-photo/8R/PACKING DUS KRAFT.jpg",
                price: prices["8R duskraft"]
              },
              {
                value: "8R hardbox",
                label: { id: "Black Hardbox + Paperbag", en: "Black Hardbox + Paperbag" },
                image: "/api/uploads/images/3d-package-photo/8R/PACKING HARDBOX.jpg",
                price: prices["8R hardbox"]
              }
            ]
          }
        ]
      }
    }

    return null
  }

  // ===============================
  // ACRYLIC STAND
  // ===============================
  if (product.category === "Acrylic Stand") {
  const name = product.name.toLowerCase()
  const prices = priceList["Acrylic Stand"]

  if (name.includes("3mm")) {
    return {
      basePrice: 0,
      groups: [
        {
          id: "stand_type",
          type: "text",
          label: { id: "Ukuran & Sisi", en: "Size & Side" },
          defaultValue: "Acrylic Stand 3mm size 15x15cm 1 sisi",
          options: [
            {
              value: "Acrylic Stand 3mm size 15x15cm 1 sisi",
              label: { id: "15x15cm 1 sisi", en: "15x15cm 1 side" },
              price: prices["Acrylic Stand 3mm size 15x15cm 1 sisi"]
            },
            {
              value: "Acrylic Stand 3mm size A4 2 sisi",
              label: { id: "A4 2 sisi", en: "A4 2 sides" },
              price: prices["Acrylic Stand 3mm size A4 2 sisi"]
            },
            {
              value: "Acrylic Stand 3mm size A3 2 sisi",
              label: { id: "A3 2 sisi", en: "A3 2 sides" },
              price: prices["Acrylic Stand 3mm size A3 2 sisi"]
            }
          ]
        }
      ]
    }
  }

  return null
}

  return null
}