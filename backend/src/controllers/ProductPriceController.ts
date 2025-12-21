import { Request, Response } from "express";
import { priceService } from "../services/priceService";

export const calculatePrice = (req: Request, res: Response) => {
  // ⛔ Guard paling awal
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