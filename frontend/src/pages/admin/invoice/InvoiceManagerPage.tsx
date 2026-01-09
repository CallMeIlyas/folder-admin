import React, { useState } from "react"
import InvoiceProductPicker from "./InvoiceProductPicker"

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const addToInvoiceCart = (item: InvoiceCartItem) => {
    setCart(prev => {
      const exist = prev.find(p => p.id === item.id)
      if (exist) {
        return prev.map(p =>
          p.id === item.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }
  
  const renderOptionLabels = (labels?: Record<string, string>) => {
  if (!labels) return null
  return Object.values(labels).join(", ")
}

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) return
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: qty } : item
      )
    )
  }

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const handleGenerateInvoice = async () => {
    if (cart.length === 0) {
      alert("Cart masih kosong")
      return
    }

    try {
      setLoading(true)

      const payload = {
        ...form,
        cart
      }

      const res = await fetch("http://localhost:3001/api/admin/invoice/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error()

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = "Invoice_LittleAmora.pdf"
      a.click()

      window.URL.revokeObjectURL(url)
    } catch {
      alert("Gagal generate invoice")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 font-poppinsRegular space-y-8">
      <div>
        <h1 className="text-2xl font-poppinsBold mb-1">
          Invoice Management
        </h1>
        <p className="text-gray-600">
          Generate invoice PDF for customer
        </p>
      </div>

      {/* CUSTOMER FORM */}
      <div className="bg-white border rounded-lg p-6 max-w-xl space-y-4">
        <Input label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} />
        <Input label="Contact Person" name="contactPerson" value={form.contactPerson} onChange={handleChange} />
        <Input label="Order Via" name="orderVia" value={form.orderVia} onChange={handleChange} />
        <Input label="Payment Date" name="paymentDate" type="date" value={form.paymentDate} onChange={handleChange} />
        <Input label="Estimated Arrival" name="estimatedArrival" type="date" value={form.estimatedArrival} onChange={handleChange} />
        <Input label="Payment Method" name="paymentMethod" value={form.paymentMethod} onChange={handleChange} />
      </div>

      {/* PRODUCT PICKER */}
      <div className="max-w-3xl">
        <InvoiceProductPicker onAddToCart={addToInvoiceCart} />
      </div>

      {/* CART */}
      {cart.map(item => (
  <div
    key={item.id}
    className="flex items-center justify-between border-b pb-3 gap-4"
  >
    <div className="flex items-center gap-3 min-w-0">
      <img
        src={item.imageUrl}
        alt={item.name}
        className="w-14 h-14 object-cover rounded border"
      />

      <div className="min-w-0">
        <p className="font-poppinsSemiBold truncate">
          {item.name}
        </p>

        {item.variation && (
          <p className="text-xs text-gray-500 truncate">
            {item.variation}
          </p>
        )}

{!item.variation && item.optionLabels && (
  <p className="text-xs text-gray-500 truncate">
    {renderOptionLabels(item.optionLabels)}
  </p>
)}

        <p className="text-sm text-gray-600">
          Rp{item.price.toLocaleString("id-ID")}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3 shrink-0">
      <input
        type="number"
        min={1}
        value={item.quantity}
        onChange={e =>
          updateQty(item.id, Number(e.target.value))
        }
        className="w-16 border rounded px-2 py-1 text-sm"
      />

      <button
        onClick={() => removeItem(item.id)}
        className="text-red-600 text-sm"
      >
        Hapus
      </button>
    </div>
  </div>
))}

      {/* GENERATE */}
      <div className="max-w-xl">
        <button
          onClick={handleGenerateInvoice}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-poppinsSemiBold disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Invoice"}
        </button>
      </div>
    </div>
  )
}

type InputProps = {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text"
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
      className="w-full border rounded-lg px-4 py-2"
    />
  </div>
)

export default InvoiceManagerPage