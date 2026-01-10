import React, { useState, useEffect } from "react"
import InvoiceProductPicker from "./InvoiceProductPicker"
import InvoiceProductOptionModal from "./InvoiceProductOptionModal"
import { Edit, Trash2 } from "lucide-react"

type InvoiceCartItem = {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
  category?: string
  options?: Record<string, string>
  optionLabels?: Record<string, string>
  variation?: string
}

type ShippingItem = {
  cartId: string
  name: string
  shippingCost: number
  isEditing?: boolean
}

const InvoiceManagerPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    orderVia: "",
    paymentDate: "",
    estimatedArrival: "",
    paymentMethod: ""
  })
  const [cart, setCart] = useState<InvoiceCartItem[]>([])
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [shippingItems, setShippingItems] = useState<ShippingItem[]>([])
  const [editingShippingCost, setEditingShippingCost] = useState<string | null>(null)
  const [tempShippingCost, setTempShippingCost] = useState<string>("")

  // Load cart & shipping from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("invoice_cart")
    const savedShipping = localStorage.getItem("invoice_shipping")
    
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to load cart from localStorage", error)
      }
    }
    
    if (savedShipping) {
      try {
        setShippingItems(JSON.parse(savedShipping))
      } catch (error) {
        console.error("Failed to load shipping from localStorage", error)
      }
    }
  }, [])

  // Save cart & shipping to localStorage whenever they change
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("invoice_cart", JSON.stringify(cart))
    } else {
      localStorage.removeItem("invoice_cart")
    }
    
    if (shippingItems.length > 0) {
      localStorage.setItem("invoice_shipping", JSON.stringify(shippingItems))
    } else {
      localStorage.removeItem("invoice_shipping")
    }
  }, [cart, shippingItems])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const generateUniqueItemKey = (item: InvoiceCartItem) => {
    const optionsStr = item.options ? JSON.stringify(item.options) : ""
    const variationStr = item.variation || ""
    return `${item.id}-${optionsStr}-${variationStr}`
  }

  const addToInvoiceCart = (item: InvoiceCartItem) => {
    setCart(prev => {
      const itemKey = generateUniqueItemKey(item)
      
      // Check if item with same ID and options already exists
      const existingItemIndex = prev.findIndex(p => 
        generateUniqueItemKey(p) === itemKey
      )
      
      if (existingItemIndex > -1) {
        // If exists, update quantity
        return prev.map((p, index) =>
          index === existingItemIndex
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      }
      
      // If doesn't exist, add new item
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQty = (index: number, qty: number) => {
    if (qty < 1) {
      removeItem(index)
      return
    }
    
    setCart(prev =>
      prev.map((item, idx) =>
        idx === index ? { ...item, quantity: qty } : item
      )
    )
  }

  const removeItem = (index: number) => {
    setCart(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleEditOptions = (index: number) => {
    setEditingItemIndex(index)
  }

  const renderOptionLabels = (labels?: Record<string, string>) => {
    if (!labels || Object.keys(labels).length === 0) return null
    return Object.values(labels).join(", ")
  }

  // Function to fetch price with options
  const fetchUpdatedPriceWithOptions = async (productId: string, options: Record<string, string>): Promise<number> => {
    try {
      console.log('Fetching NEW unit price for:', productId, 'with options:', options)
      
      const response = await fetch(
        `http://localhost:3001/api/admin/invoice/product-options/${productId}/calculate-price`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ options })
        }
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      console.log('Unit price update response:', data)
      
      if (data.success === false) {
        throw new Error(data.message || 'Failed to calculate price')
      }
      
      // Return the NEW UNIT PRICE
      return data.unitPrice || data.price
    } catch (error: any) {
      console.error("Error fetching updated price:", error)
      throw error
    }
  }

  // Update handleUpdateOptions function:
  const handleUpdateOptions = async (updatedItem: Omit<InvoiceCartItem, 'quantity'>) => {
    if (editingItemIndex !== null) {
      try {
        // Fetch updated price with options from backend
        const newPrice = await fetchUpdatedPriceWithOptions(
          updatedItem.id, 
          updatedItem.options || {}
        )
        
        console.log('Updating cart item with new unit price:', newPrice)
        
        setCart(prev =>
          prev.map((item, index) =>
            index === editingItemIndex
              ? { 
                  ...updatedItem, 
                  quantity: item.quantity,
                  price: newPrice // Update price dengan harga baru
                }
              : item
          )
        )
        
        // Show price change info if price changed
        const originalPrice = cart[editingItemIndex].price
        if (newPrice !== originalPrice) {
          alert(`Harga unit diupdate: Rp${originalPrice.toLocaleString("id-ID")} → Rp${newPrice.toLocaleString("id-ID")}`)
        }
        
      } catch (error: any) {
        console.error("Failed to fetch updated price:", error)
        // Fallback: keep existing price but update options
        setCart(prev =>
          prev.map((item, index) =>
            index === editingItemIndex
              ? { ...updatedItem, quantity: item.quantity }
              : item
          )
        )
        
        alert(`Warning: Harga tidak bisa diupdate otomatis.`)
      }
    }
    setEditingItemIndex(null)
  }

  // Shipping Cost Functions
  const addShippingItem = () => {
    const newShippingItem: ShippingItem = {
      cartId: `shipping_${Date.now()}`,
      name: "Shipping Cost",
      shippingCost: 0,
      isEditing: true
    }
    setShippingItems(prev => [...prev, newShippingItem])
    setEditingShippingCost(newShippingItem.cartId)
    setTempShippingCost("")
  }

  const updateShippingCost = (cartId: string, cost: number) => {
    setShippingItems(prev =>
      prev.map(item =>
        item.cartId === cartId ? { ...item, shippingCost: cost } : item
      )
    )
  }

  const handleEditShippingClick = (cartId: string, currentCost: number) => {
    setEditingShippingCost(cartId)
    setTempShippingCost(currentCost.toString())
  }

  const handleSaveShippingCost = (cartId: string) => {
    const cost = parseInt(tempShippingCost) || 0
    updateShippingCost(cartId, cost)
    setEditingShippingCost(null)
    setTempShippingCost("")
  }

  const handleCancelShippingEdit = () => {
    setEditingShippingCost(null)
    setTempShippingCost("")
  }

  const handleShippingCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempShippingCost(e.target.value)
  }

  const deleteShippingItem = (cartId: string) => {
    setShippingItems(prev => prev.filter(item => item.cartId !== cartId))
  }

  const calculateProductTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const calculateShippingTotal = () => {
    return shippingItems.reduce((total, item) => total + item.shippingCost, 0)
  }

  const calculateGrandTotal = () => {
    return calculateProductTotal() + calculateShippingTotal()
  }

  const clearCart = () => {
    if (window.confirm("Apakah Anda yakin ingin mengosongkan cart?")) {
      setCart([])
      setShippingItems([])
    }
  }

  const handleGenerateInvoice = async () => {
    if (cart.length === 0) {
      alert("Cart masih kosong")
      return
    }

    // Validate required fields
    const requiredFields = ['companyName', 'contactPerson']
    const missingFields = requiredFields.filter(field => !form[field as keyof typeof form])
    
    if (missingFields.length > 0) {
      alert(`Harap isi field yang diperlukan: ${missingFields.join(', ')}`)
      return
    }

    try {
      setLoading(true)

      const payload = {
        ...form,
        cart: cart.map(item => ({
          ...item,
          optionLabels: item.optionLabels || {}
        })),
        shipping: shippingItems,
        productTotal: calculateProductTotal(),
        shippingTotal: calculateShippingTotal(),
        grandTotal: calculateGrandTotal(),
        createdAt: new Date().toISOString(),
        invoiceNumber: `INV-${Date.now()}`
      }

      console.log('Sending payload:', payload) // Debug log

      const res = await fetch("http://localhost:3001/api/admin/invoice/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Server error: ${res.status} - ${errorText}`)
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `Invoice_LittleAmora_${Date.now()}.pdf`
      a.click()

      window.URL.revokeObjectURL(url)
      
    } catch (error: any) {
      console.error("Generate invoice error:", error)
      alert(`Gagal generate invoice: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Shipping Cost Item Component
  const ShippingCostItemDesktop = ({ item }: { item: ShippingItem }) => (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0 bg-gray-50 rounded-lg mb-2">
      <div className="flex items-center gap-3 flex-1">
        <div>
          <p className="font-poppinsSemiBold text-sm">{item.name}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {editingShippingCost === item.cartId ? (
          <div className="flex items-center gap-2">
            <span className="text-sm">Rp</span>
            <input
              type="number"
              value={tempShippingCost}
              onChange={handleShippingCostChange}
              className="w-32 border rounded px-3 py-1 text-sm text-right"
              autoFocus
            />
            <button
              onClick={() => handleSaveShippingCost(item.cartId)}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={handleCancelShippingEdit}
              className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="font-poppinsSemiBold">
              Rp{item.shippingCost.toLocaleString("id-ID")}
            </span>
            <button
              onClick={() => handleEditShippingClick(item.cartId, item.shippingCost)}
              className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded"
              title="Edit shipping cost"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => deleteShippingItem(item.cartId)}
              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
              title="Delete shipping"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="p-6 font-poppinsRegular space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-poppinsBold mb-1">
            Invoice Management
          </h1>
          <p className="text-gray-600">
            Generate invoice PDF for customer
          </p>
        </div>
        
        {(cart.length > 0 || shippingItems.length > 0) && (
          <button
            onClick={clearCart}
            className="px-4 py-2 text-sm border border-red-500 text-red-500 rounded-lg hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Customer Form & Product Picker */}
        <div className="space-y-8">
          {/* CUSTOMER FORM */}
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-poppinsSemiBold mb-4">Customer Information</h2>
            <Input label="Company Name *" name="companyName" value={form.companyName} onChange={handleChange} required />
            <Input label="Contact Person *" name="contactPerson" value={form.contactPerson} onChange={handleChange} required />
            <Input label="Order Via" name="orderVia" value={form.orderVia} onChange={handleChange} />
            <Input label="Payment Date" name="paymentDate" type="date" value={form.paymentDate} onChange={handleChange} />
            <Input label="Estimated Arrival" name="estimatedArrival" type="date" value={form.estimatedArrival} onChange={handleChange} />
            <Input label="Payment Method" name="paymentMethod" value={form.paymentMethod} onChange={handleChange} />
          </div>

          {/* PRODUCT PICKER */}
          <div>
            <h2 className="text-lg font-poppinsSemiBold mb-4">Product Selection</h2>
            <InvoiceProductPicker onAddToCart={addToInvoiceCart} />
          </div>
        </div>

        {/* Right Column - Cart & Shipping */}
        <div className="space-y-6">
          {/* CART HEADER */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-poppinsSemiBold">
              Invoice Cart ({cart.length} items)
            </h2>
            {cart.length > 0 && (
              <div className="text-lg font-poppinsBold">
                Total: Rp{calculateProductTotal().toLocaleString("id-ID")}
              </div>
            )}
          </div>

          {/* CART ITEMS */}
          <div className="bg-white border rounded-lg p-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Cart masih kosong</p>
                <p className="text-sm mt-2">Tambahkan produk dari panel kiri</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {cart.map((item, index) => (
                  <div
                    key={`${index}-${generateUniqueItemKey(item)}`}
                    className="flex items-start gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50 rounded-lg"
                  >
                    {/* Product Image */}
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border flex-shrink-0"
                      />
                    )}

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="font-poppinsSemiBold text-sm">
                          {item.name}
                        </p>
                        <div className="text-right">
                          <p className="font-poppinsSemiBold text-sm">
                            Rp{(item.price * item.quantity).toLocaleString("id-ID")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} × Rp{item.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>

                      {/* Options or Variation - IMPROVED DESIGN */}
                      {(item.optionLabels || item.variation) && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1">
                            <div className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                              <span className="text-sm text-gray-600">
                                {item.optionLabels ? renderOptionLabels(item.optionLabels) : item.variation}
                              </span>
                              <button
                                onClick={() => handleEditOptions(index)}
                                className="ml-1 text-gray-500 hover:text-black flex items-center"
                                title="Edit options"
                              >
                                <span className="text-xs">▼</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => updateQty(index, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 rounded-l-lg"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={e => updateQty(index, parseInt(e.target.value) || 1)}
                            className="w-12 border-x text-center py-1 text-sm"
                          />
                          <button
                            onClick={() => updateQty(index, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 rounded-r-lg"
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(index)}
                          className="ml-auto p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SHIPPING COST SECTION */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-poppinsSemiBold">Shipping Cost</h3>
              <button
                onClick={addShippingItem}
                className="bg-[#dcbec1] text-black font-poppinsSemiBold text-xs px-4 py-2 rounded-full shadow-sm hover:opacity-90 transition flex items-center gap-2"
              >
                <span>+</span>
                Tambah Ongkir
              </button>
            </div>

            {shippingItems.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-4">
                Belum ada ongkir ditambahkan
              </p>
            ) : (
              <div className="space-y-2">
                {shippingItems.map((item) => (
                  <ShippingCostItemDesktop
                    key={item.cartId}
                    item={item}
                  />
                ))}
              </div>
            )}
          </div>

          {/* TOTALS SECTION */}
          <div className="bg-white border rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal Produk:</span>
              <span>Rp{calculateProductTotal().toLocaleString("id-ID")}</span>
            </div>
            
            {shippingItems.length > 0 && (
              <div className="flex justify-between text-sm">
                <span>Ongkos Kirim:</span>
                <span>Rp{calculateShippingTotal().toLocaleString("id-ID")}</span>
              </div>
            )}
            
            <div className="border-t pt-3 flex justify-between font-poppinsBold text-lg">
              <span>Total:</span>
              <span>Rp{calculateGrandTotal().toLocaleString("id-ID")}</span>
            </div>
          </div>

          {/* GENERATE BUTTON */}
          <div className="sticky bottom-0 bg-white pt-4 border-t">
            <button
              onClick={handleGenerateInvoice}
              disabled={loading || cart.length === 0}
              className="w-full bg-black text-white py-3 rounded-lg font-poppinsSemiBold disabled:opacity-50 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                  Generating Invoice...
                </>
              ) : (
                <>
                  Generate Invoice • Rp{calculateGrandTotal().toLocaleString("id-ID")}
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              PDF akan langsung diunduh setelah proses selesai
            </p>
          </div>
        </div>
      </div>

      {/* EDIT OPTIONS MODAL */}
      {editingItemIndex !== null && cart[editingItemIndex] && (
        <InvoiceProductOptionModal
          product={{
            id: cart[editingItemIndex].id,
            displayName: cart[editingItemIndex].name,
            price: cart[editingItemIndex].price,
            imageUrl: cart[editingItemIndex].imageUrl,
            category: cart[editingItemIndex].category
          }}
          initialOptions={cart[editingItemIndex].options}
          onClose={() => setEditingItemIndex(null)}
          onConfirm={(item) => {
            handleUpdateOptions({
              id: item.id,
              name: item.name,
              price: item.price,
              imageUrl: item.imageUrl,
              category: item.category,
              options: item.options,
              optionLabels: item.optionLabels,
              variation: item.variation
            })
          }}
        />
      )}
    </div>
  )
}

// Input Component
type InputProps = {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false
}) => (
  <div>
    <label className="block text-sm font-poppinsSemiBold mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
    />
  </div>
)

export default InvoiceManagerPage