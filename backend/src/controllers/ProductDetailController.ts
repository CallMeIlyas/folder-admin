import { Request, Response } from "express";
import { allProducts } from "../../data/productDataLoader";
import { productService } from "../services/productService";
import { productMapper } from "../services/productMapper";
import { productLocaleService } from "../services/productLocaleService";

export const getProductDetail = (req: Request, res: Response) => {
  const { id } = req.params;
  const lang = (req.query.lang as string) || "id";

  // Validate language parameter
  const validLanguages = ['id', 'en'];
  const language = validLanguages.includes(lang.toLowerCase()) ? lang.toLowerCase() as 'id' | 'en' : 'id';

  const product = allProducts.find(p => p.id === id);
  if (!product) {
    const errorMessages = {
      id: "Produk tidak ditemukan",
      en: "Product not found"
    };
    return res.status(404).json({ 
      message: errorMessages[language]
    });
  }

  // Get description based on language
  const description = productService.getProductDetail(
    product.category,
    product.name,
    language // Pass language parameter
  );

  const basePrice = productService.getBasePrice(product.id, language);
  const bestSelling = productService.isBestSelling(product.id, language);
  
  // Get UI text for the specific language
  const uiText = productLocaleService.getProductLocale(language);

  // Pass language parameter to mapper
  const response = productMapper.toProductDetail({
    id: product.id,
    category: product.category,
    name: product.name,
    images: {
      main: product.imageUrl,
      gallery: product.allImages || [],
    },
    options: product.options || {},
    uiText: {
      ...uiText,
      details: description,
    },
    price: basePrice,
    isBestSelling: bestSelling.isBestSelling,
    bestSellingLabel: bestSelling.label,
  }, language); // ← Pass language here

  res.json(response);
};