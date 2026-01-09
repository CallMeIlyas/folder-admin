import { getAllProducts } from "../../../../data/productDataLoader"
import { resolveProductOptions } from "../../../services/productOptionResolver"

export const getInvoiceProductOptions = (req, res) => {
  const productId = req.params.id

  const products = getAllProducts()
  const product = products.find(p => p.id === productId)

  if (!product) {
    return res.status(404).json({ message: "Product not found" })
  }

  const resolved = resolveProductOptions(product)

  return res.json({
    basePrice: resolved?.basePrice ?? product.price,
    groups: resolved?.groups ?? []
  })
}