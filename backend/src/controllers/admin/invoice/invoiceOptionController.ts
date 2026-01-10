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

// ✅ NEW FUNCTION: Calculate NEW UNIT PRICE with selected options
export const calculateProductPriceWithOptions = (req, res) => {
  try {
    const productId = req.params.id
    const { options } = req.body

    const products = getAllProducts()
    const product = products.find(p => p.id === productId)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const resolved = resolveProductOptions(product)
    
    // Start with the PRODUCT'S PRICE (not basePrice from resolved)
    let newUnitPrice = product.price

    console.log(`Product original price: ${newUnitPrice}`)

    // If there are options selected, REPLACE the price
    if (options && resolved?.groups) {
      resolved.groups.forEach(group => {
        const selectedValue = options[group.id]
        if (selectedValue) {
          const selectedOption = group.options.find(
            opt => opt.value === selectedValue
          )
          
          // Jika option punya price property, GUNAKAN itu sebagai harga baru
          if (selectedOption && selectedOption.price !== undefined) {
            console.log(`Found option with price override: ${selectedOption.price}`)
            newUnitPrice = selectedOption.price // REPLACE, not add
          }
        }
      })
    }

    console.log(`Final unit price: ${newUnitPrice}`)

    return res.json({
      success: true,
      productId,
      productName: product.displayName || product.name,
      unitPrice: newUnitPrice, // Harga per unit setelah pilih option
      originalPrice: product.price, // Harga asli produk
      options,
      message: "Unit price calculated successfully"
    })
  } catch (error) {
    console.error("Error calculating price:", error)
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    })
  }
}