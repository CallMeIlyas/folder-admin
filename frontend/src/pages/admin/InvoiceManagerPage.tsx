import React, { useState } from "react"

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleGenerateInvoice = async () => {
  try {
    setLoading(true)

    const payload = {
      ...form,
      cart: [
        {
          name: "Test Product",
          price: 100000,
          quantity: 1
        }
      ]
    }

    const res = await fetch("/api/admin/invoice/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    if (!res.ok) throw new Error("Failed to generate invoice")

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "Invoice_LittleAmora.pdf"
    a.click()

    window.URL.revokeObjectURL(url)
  } catch (err) {
    alert("Gagal generate invoice")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="p-6 font-poppinsRegular">
      <h1 className="text-2xl font-poppinsBold mb-2">
        Invoice Management
      </h1>

      <p className="text-gray-600 mb-6">
        Generate invoice PDF for customer
      </p>

      <div className="bg-white border rounded-lg p-6 max-w-xl space-y-4">
        <Input label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} />
        <Input label="Contact Person" name="contactPerson" value={form.contactPerson} onChange={handleChange} />
        <Input label="Order Via" name="orderVia" value={form.orderVia} onChange={handleChange} />
        <Input label="Payment Date" name="paymentDate" type="date" value={form.paymentDate} onChange={handleChange} />
        <Input label="Estimated Arrival" name="estimatedArrival" type="date" value={form.estimatedArrival} onChange={handleChange} />
        <Input label="Payment Method" name="paymentMethod" value={form.paymentMethod} onChange={handleChange} />

        <button
          onClick={handleGenerateInvoice}
          disabled={loading}
          className="w-full mt-4 bg-black text-white py-3 rounded-lg font-poppinsSemiBold disabled:opacity-50"
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