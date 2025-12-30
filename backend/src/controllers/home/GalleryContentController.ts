import { Request, Response } from "express"
import { readJson } from "../../../utils/readJson"
import { getAllProducts } from "../../../data/productDataLoader"

const normalizeLang = (lang?: string) => {
  if (!lang) return "en"
  if (lang.startsWith("id")) return "id"
  if (lang.startsWith("en")) return "en"
  return "en"
}

const normalizeSize = (label: string) =>
  label.split(/[\/\s(]/)[0].trim().toUpperCase()

export const getGalleryContent = (req: Request, res: Response) => {
  try {
    const lang = normalizeLang(req.query.lang as string)

    let data
    try {
      data = readJson(`content/locales/${lang}/home/gallery.json`)
    } catch {
      data = readJson(`content/locales/en/home/gallery.json`)
    }

    // ✅ LIVE PRODUCTS
    const products = getAllProducts()

    // ✅ HANYA 3D FRAME + AKTIF
    const frameProducts = products.filter(
      p =>
        p.category === "3D Frame" &&
        p.admin?.active !== false
    )

    const photos = (data.photos || []).map((p: any) => {
      const sizeKey = normalizeSize(p.label)

      const matchedProduct = frameProducts.find(prod => {
        const name = `${prod.name} ${prod.displayName}`.toUpperCase()
        return name.includes(sizeKey)
      })

      return {
        id: p.id,
        imageUrl: p.image || p.imageUrl,
        label: p.label,
        productId: matchedProduct?.id ?? null,
        productName:
          matchedProduct?.displayName ||
          matchedProduct?.name ||
          p.label,
        price: matchedProduct?.price ?? null
      }
    })

    res.json({
      title: data.title || "",
      socialIcons: {
        instagram: "/api/uploads/images/Icons/IG.png",
        tiktok: "/api/uploads/images/Icons/TIKTOD2.png"
      },
      videos: (data.videos || []).map((v: any) => ({
        id: v.id,
        videoUrl: v.src || v.videoUrl
      })),
      photos
    })
  } catch (err) {
    console.error("GalleryContent error:", err)
    res.status(500).json({ message: "Failed to load gallery content" })
  }
}