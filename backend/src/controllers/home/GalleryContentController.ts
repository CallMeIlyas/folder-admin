import { Request, Response } from "express";
import { readJson } from "../../../utils/readJson";
import { getAllProducts } from "../../services/productService";

export const getGalleryContent = async (req: Request, res: Response) => {
  try {
    const lang = (req.query.lang as string) || "en";
    const data = readJson(`content/locales/${lang}/home/gallery.json`);

    const products = await getAllProducts(lang);

    const frameProducts = products.filter(
      (p: any) => p.category?.toLowerCase() === "3d frame"
    );

    const normalizeSize = (label: string) =>
      label.split(/[\/\s(]/)[0].trim().toUpperCase();

    const photos = (data.photos || []).map((p: any) => {
      const sizeKey = normalizeSize(p.label);

      const matchedProduct = frameProducts.find((prod: any) =>
        prod.name.toUpperCase().includes(sizeKey)
      );

      return {
        id: p.id,
        imageUrl: p.image,
        label: p.label,
        productId: matchedProduct?.id ?? null,
        productName: matchedProduct?.name ?? p.label,
        price: matchedProduct?.price ?? null
      };
    });

    res.json({
      title: data.title,
      socialIcons: {
        instagram: "/api/uploads/images/Icons/IG.png",
        tiktok: "/api/uploads/images/Icons/TIKTOD2.png"
      },
      videos: (data.videos || []).map((v: any) => ({
        id: v.id,
        videoUrl: v.src
      })),
      photos
    });
  } catch (err) {
    console.error("GalleryContent error:", err);
    res.status(500).json({ message: "Failed to load gallery content" });
  }
};