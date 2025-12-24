import { Request, Response } from "express";
import { allProducts } from "../../../data/productDataLoader";

export const getProductCardContent = (_req: Request, res: Response) => {
  const items = allProducts.map(product => ({
    id: product.id,
    displayName: product.displayName || product.name,
    category: product.category,
    price: product.price,
    imageUrl: product.imageUrl,
  }));

  res.json({ items });
};