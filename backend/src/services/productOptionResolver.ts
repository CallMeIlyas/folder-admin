import { priceList } from "../../data/priceList"

export const resolveProductOptions = (product) => {
  if (product.category === "2D Frame") {
    return {
      basePrice: product.price,
      groups: [
        {
          id: "size",
          label: { id: "Ukuran Frame", en: "Frame Size" },
          type: "image",
          defaultValue: product.name,
          options: (product.sizeFrameOptions || []).map(o => ({
            value: o.label,
            label: { id: o.label, en: o.label },
            image: o.image
          }))
        },
        {
  id: "shading",
  label: { id: "Gaya Shading", en: "Shading Style" },
  type: "image",
  defaultValue: "simple shading",
  options: [
    {
      value: "simple shading",
      label: { id: "Simple Shading", en: "Simple Shading" },
      image: "/api/uploads/images/list-products/2D/variation/shading/2D SIMPLE SHADING/2D SIMPLE SHADING.jpg"
    },
    {
      value: "background catalog",
      label: { id: "Background Catalog", en: "Background Catalog" },
      image: "/api/uploads/images/list-products/2D/variation/shading/2D BACKGROUND CATALOG/1.jpg"
    },
    {
      value: "bold shading",
      label: { id: "Bold Shading", en: "Bold Shading" },
      image: "/api/uploads/images/list-products/2D/variation/shading/2D BOLD SHADING/2D BOLD SHADING.jpg"
    },
    {
      value: "ai",
      label: { id: "AI", en: "AI" },
      image: "/api/uploads/images/list-products/2D/variation/shading/2D BY AI/1.jpg"
    }
  ]
}
      ]
    }
  }

  if (product.category === "Additional") {
  const name = product.name.toLowerCase()

  // 1. Wajah Karikatur
  if (name.includes("wajah karikatur")) {
    return {
      basePrice: product.price,
      groups: [
        {
          id: "face_count",
          label: { id: "Jumlah Wajah", en: "Face Count" },
          type: "text",
          options: [
            {
              value: "1-9",
              label: { id: "1–9 Wajah", en: "1–9 Faces" }
            },
            {
              value: "10+",
              label: { id: "Di atas 10 Wajah", en: "Above 10 Faces" }
            }
          ]
        }
      ]
    }
  }

  // 2. Wajah Banyak
  if (name.includes("wajah banyak")) {
    return {
      basePrice: product.price,
      groups: [
        {
          id: "face_count",
          label: { id: "Jumlah Wajah", en: "Face Count" },
          type: "text",
          options: [
            {
              value: "1-9",
              label: { id: "1–9 Wajah", en: "1–9 Faces" }
            },
            {
              value: "10+",
              label: { id: "Di atas 10 Wajah", en: "Above 10 Faces" }
            }
          ]
        }
      ]
    }
  }

  // 3. Express General
  if (name.includes("ekspress general")) {
    return {
      basePrice: product.price,
      groups: [
        {
          id: "express_level",
          label: { id: "Jenis Express", en: "Express Type" },
          type: "text",
          options: [
            { value: "opt1", label: { id: "Option 1", en: "Option 1" } },
            { value: "opt2", label: { id: "Option 2", en: "Option 2" } },
            { value: "opt3", label: { id: "Option 3", en: "Option 3" } }
          ]
        }
      ]
    }
  }

  // 4. Ganti Frame Acrylic
  if (name.includes("ganti frame kaca ke acrylic")) {
    return {
      basePrice: product.price,
      groups: [
        {
          id: "acrylic_size",
          label: { id: "Ukuran Acrylic", en: "Acrylic Size" },
          type: "text",
          options: ["A2", "A1", "A0"].map(s => ({
            value: s,
            label: { id: s, en: s }
          }))
        }
      ]
    }
  }

  // 5. Acrylic Stand 3mm
  if (name.includes("acrylic") && name.includes("3mm")) {
    return {
      basePrice: product.price,
      groups: [
        {
          id: "stand_type",
          label: { id: "Ukuran & Sisi", en: "Size & Side" },
          type: "text",
          options: [
            "15x15cm 1 sisi",
            "A4 2 sisi",
            "A3 2 sisi"
          ].map(o => ({
            value: `Acrylic Stand 3mm size ${o}`,
            label: { id: o, en: o }
          }))
        }
      ]
    }
  }

  // selain itu, Additional TANPA OPTIONS
  return null
}
if (product.category === "3D Frame") {
  const name = product.name.toLowerCase()

  if (name.includes("8r")) {
    return {
      basePrice: product.price,
      groups: [
        {
          id: "packaging",
          label: { id: "Packaging", en: "Packaging" },
          type: "image",
          options: [
            {
              value: "Dus Kraft + Paperbag",
              label: {
                id: "Dus Kraft + Paperbag",
                en: "Dus Kraft + Paperbag"
              },
              image: "/api/uploads/images/3d-package-photo/8R/PACKING DUS KRAFT.jpg"
            },
            {
              value: "Black Hardbox + Paperbag",
              label: {
                id: "Black Hardbox + Paperbag",
                en: "Black Hardbox + Paperbag"
              },
              image: "/api/uploads/images/3d-package-photo/8R/PACKING HARDBOX.jpg"
            }
          ]
        }
      ]
    }
  }
}

if (product.category === "Acrylic Stand") {
  const name = product.name.toLowerCase()

  if (name.includes("3mm")) {
    return {
      basePrice: product.price,
      groups: [
        {
          id: "stand_type",
          label: { id: "Ukuran & Sisi", en: "Size & Side" },
          type: "text",
          options: [
            "15x15cm 1 sisi",
            "A4 2 sisi",
            "A3 2 sisi"
          ].map(o => ({
            value: o,
            label: { id: o, en: o }
          }))
        }
      ]
    }
  }

  return null
}

  return null
}