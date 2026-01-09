import React, { useEffect, useState } from "react"
import InvoiceProductOptionModal from "./InvoiceProductOptionModal"

type Product = {
  id: string
  imageUrl: string
  displayName: string
  category: string
  price: number
  admin: {
    active: boolean
  }
}

type Props = {
  onAddToCart: (item: any) => void
}

const InvoiceProductPicker: React.FC<Props> = ({ onAddToCart }) => {
  const API_BASE = "http://localhost:3001"
  const token = "admin-token-123"

  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState("ALL")
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/manage-products`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      setProducts(data)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p =>
    filter === "ALL" ? true : p.category === filter
  )

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">
        Memuat produk...
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex gap-2 flex-wrap">
          {[
            "ALL",
            "3D Frame",
            "2D Frame",
            "Acrylic Stand",
            "Additional",
            "Softcopy Design"
          ].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 text-sm rounded-lg border ${
                filter === cat
                  ? "bg-black text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {cat === "ALL" ? "Semua" : cat}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="p-6 text-center text-sm text-gray-500">
          Tidak ada produk
        </div>
      )}

      {filteredProducts.map(p => (
        <div
          key={p.id}
          className="flex items-center gap-4 p-4 border-b hover:bg-gray-50"
        >
          <img
            src={`${API_BASE}${p.imageUrl}`}
            alt={p.displayName}
            className="w-16 h-16 rounded-lg border object-cover"
          />

          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">
              {p.displayName}
            </div>
            <div className="text-xs text-gray-500">
              {p.category}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium">
              Rp {p.price.toLocaleString("id-ID")}
            </div>
          </div>

          <button
            disabled={!p.admin.active}
            onClick={() => setSelectedProduct(p)}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm disabled:opacity-50"
          >
            Add
          </button>
        </div>
      ))}

      {selectedProduct && (
        <InvoiceProductOptionModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={(item) => {
            onAddToCart(item)
            setSelectedProduct(null)
          }}
        />
      )}
    </div>
  )
}

export default InvoiceProductPicker