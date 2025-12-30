import { Request, Response } from "express";
import { getAllProducts } from "../../../data/productDataLoader";
import { getPrice } from "../../../utils/getPrice";
import { getBackgroundCatalogImages } from "../../../utils/backgroundCatalog";

// Urutan DI SINI menentukan urutan tampil
const ALLOWED_ADDITIONAL_IDS = [
  "prod-additional-biaya-tambahan-wajah-karikatur",
  "prod-additional-background-custom",
  "prod-additional-biaya-tambahan-packing",
];

export const getAdditionalProducts = (req: Request, res: Response) => {
  const { category } = req.query;

  if (!category || typeof category !== "string") {
    return res.status(400).json({ message: "Category is required" });
  }

  // ⬅️ AMBIL PRODUK TERBARU SETIAP REQUEST
  const products = getAllProducts();

  const items = ALLOWED_ADDITIONAL_IDS
    .map(id => products.find(p => p.id === id))
    .filter(p => p && p.admin?.active !== false)
    .map(p => {
      let imageUrl = p!.imageUrl;

      // ===== BACKGROUND CUSTOM =====
      if (p!.id === "prod-additional-background-custom") {
        const images = getBackgroundCatalogImages("goverment-police");
        const selected = images.find(img =>
          img.toLowerCase().includes("ka-may23-01")
        );

        imageUrl = selected || images[0] || imageUrl;
      }

      return {
        id: p!.id,
        name: p!.name,
        displayName: p!.displayName || p!.name,
        category: p!.category,
        imageUrl,
        price: getPrice(p!.category, p!.name),
        targetProduct: category,
      };
    });

  res.json(items);
};