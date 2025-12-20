import { Request, Response } from "express";
import { allProducts } from "../../data/productDataLoader";
import { getPrice } from "../../utils/getPrice";

export const getAdditionalProducts = (req: Request, res: Response) => {
  const { category } = req.query;

  const items = allProducts
    .filter(p => p.category === "Additional")
    .map(p => ({
      id: p.id,
      name: p.name,
      displayName: p.displayName || p.name,
      category: p.category,
      imageUrl: p.imageUrl,
      price: getPrice(p.category, p.name),
      targetProduct: category || ""
    }));

  res.json(items);
};