import { Request, Response } from "express";
import { priceService } from "../services/priceService";

export const calculatePrice = (req: Request, res: Response) => {
  const { productId, options } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "productId required" });
  }

  const price = priceService.calculate(productId, options || {});
  res.json({ price });
};