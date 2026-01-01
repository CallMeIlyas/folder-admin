import { Request, Response } from "express"
import { getAllProducts } from "../../../data/productDataLoader"

export const getProductCardContent = (_req: Request, res: Response) => {
  const products = getAllProducts()

  const items = products
    .filter(p => p.admin?.active !== false)
    .map(p => ({
      id: p.id,
      displayName:
        p.admin?.displayNameOverride?.trim()
          ? p.admin.displayNameOverride
          : `${p.category} ${p.displayName}`,
      category: p.category,
      price: p.price,
      imageUrl: p.imageUrl
    }))

  res.json({ items })
}