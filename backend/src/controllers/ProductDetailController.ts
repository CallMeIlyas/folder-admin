import { Request, Response } from "express";
import { allProducts } from "../../data/productDataLoader";
import { productService } from "../services/productService";
import { productMapper } from "../services/productMapper";
import { productLocaleService } from "../services/productLocaleService";

export const getProductDetail = (req: Request, res: Response) => {
  const { id } = req.params;
  const lang = (req.query.lang as string) || "id";

  const product = allProducts.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const description = productService.getProductDetail(
    product.category,
    product.name
  );

  const basePrice = productService.getBasePrice(product.id);
  const bestSelling = productService.isBestSelling(product.id);
  const uiText = productLocaleService.getProductLocale(lang);

  const response = productMapper.toProductDetail({
    id: product.id,
    category: product.category,
    name: product.name,
    images: {
      main: product.imageUrl,
      gallery: product.allImages || [],
    },

    // ⛔ JANGAN KIRIM options DARI SINI
    // Mapper yang tentukan options

    uiText: {
      ...uiText,
      details: description,
    },
    price: basePrice,
    isBestSelling: bestSelling.isBestSelling,
    bestSellingLabel: bestSelling.label,
  });

  res.json(response);
};