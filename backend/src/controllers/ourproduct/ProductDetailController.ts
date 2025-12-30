import { Request, Response } from "express";
import { getAllProducts } from "../../../data/productDataLoader";
import { productService } from "../../services/productService";
import { productMapper } from "../../services/productMapper";
import { productLocaleService } from "../../services/productLocaleService";

export const getProductDetail = (req: Request, res: Response) => {
  const { id } = req.params;
  const lang = req.query.lang === "en" ? "en" : "id";
  const language: "id" | "en" = lang;

  const products = getAllProducts();
  const product = products.find(p => p.id === id);

  if (!product || product.admin?.active === false) {
    return res.status(404).json({
      message: language === "id"
        ? "Produk tidak tersedia"
        : "Product unavailable"
    });
  }

  const description = productService.getProductDetail(
    product.id,
    language
  );

  const uiText = productLocaleService.getProductLocale(language);

  const response = productMapper.toProductDetail(
    {
      id: product.id,
      category: product.category,
      name: product.name,

      images: {
        main: product.imageUrl,
        gallery: product.allImages || [],
      },

      options: {
        variations: product.options?.variations || [],
        shadingOptions: product.shadingOptions,
        sizeFrameOptions: product.sizeFrameOptions,
      },

      uiText: {
        ...uiText,
        details: description,
      },

      price: productService.getBasePrice(product.id, language),

      isBestSelling: productService.isBestSelling(product.id, language).isBestSelling,
      bestSellingLabel:
        productService.isBestSelling(product.id, language).label || "",
    },
    language
  );

  res.json(response);
};