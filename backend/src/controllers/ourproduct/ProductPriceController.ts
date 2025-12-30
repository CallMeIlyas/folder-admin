import { Request, Response } from "express";
import { priceService } from "../../services/priceService";
import { getAllProducts } from "../../../data/productDataLoader";

export const calculatePrice = (req: Request, res: Response) => {
  if (!req.body) {
    return res.status(400).json({
      message: "Request body is required. Use POST with JSON."
    });
  }

  const { productId, options } = req.body;

  if (!productId || typeof productId !== "string") {
    return res.status(400).json({
      message: "productId is required"
    });
  }

  // ⬅️ AMBIL DATA TERBARU SETIAP REQUEST
  const products = getAllProducts();
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({
      message: "Product not found"
    });
  }

  // ⛔ BLOCK jika produk nonaktif
  if (product.admin?.active === false) {
    return res.status(403).json({
      message: "Product is not active"
    });
  }

  try {
    const price = priceService.calculate(productId, options || {});
    return res.json({ price });
  } catch (err) {
    console.error("Price calculation error:", err);
    return res.status(500).json({
      message: "Failed to calculate price"
    });
  }
};