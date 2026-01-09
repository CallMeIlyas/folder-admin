import React, { useEffect, useState } from "react"

type Props = {
  product: any
  onConfirm: (item: any) => void
  onClose: () => void
}

const InvoiceProductOptionModal: React.FC<Props> = ({
  product,
  onConfirm,
  onClose
}) => {
  const API_BASE = "http://localhost:3001"

  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<any[]>([])
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [labelMap, setLabelMap] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/admin/invoice/product-options/${encodeURIComponent(
            product.id
          )}`
        )

        if (!res.ok) throw new Error("Failed to load options")

        const data = await res.json()
        const groupsData = data?.groups ?? []

        setGroups(groupsData)

        const defaults: Record<string, string> = {}
        const labels: Record<string, string> = {}

        groupsData.forEach((g: any) => {
          if (g.defaultValue) {
            defaults[g.id] = g.defaultValue

            const opt = g.options.find(
              (o: any) => o.value === g.defaultValue
            )

            if (opt) {
              labels[g.id] =
                opt.label?.id ||
                opt.label ||
                opt.value
            }
          }
        })

        setSelected(defaults)
        setLabelMap(labels)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOptions()
  }, [product.id])

  const handleSelect = (group: any, opt: any) => {
    setSelected(prev => ({
      ...prev,
      [group.id]: opt.value
    }))

    setLabelMap(prev => ({
      ...prev,
      [group.id]:
        opt.label?.id ||
        opt.label ||
        opt.value
    }))
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          Memuat opsi...
        </div>
      </div>
    )
  }

  if (!groups.length) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg space-y-4">
          <p>Produk ini tidak memiliki opsi</p>

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 border rounded">
              Batal
            </button>

            <button
              onClick={() =>
                onConfirm({
                  id: product.id,
                  name: product.displayName,
                  price: product.price,
                  quantity: 1,
                  imageUrl: product.imageUrl,
                  category: product.category
                })
              }
              className="px-4 py-2 bg-black text-white rounded"
            >
              Tambah
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
        <h2 className="font-poppinsBold">
          Pilih Opsi Produk
        </h2>

        {groups.map(group => (
          <div key={group.id}>
            <p className="text-sm font-poppinsSemiBold mb-2">
              {group.label?.id || group.label || group.id}
            </p>

            <div className="flex flex-wrap gap-2">
              {group.options.map((opt: any) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(group, opt)}
                  className={`px-3 py-2 text-sm rounded border ${
                    selected[group.id] === opt.value
                      ? "bg-black text-white"
                      : "bg-white"
                  }`}
                >
                  {opt.label?.id || opt.label || opt.value}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Batal
          </button>

          <button
            onClick={() =>
              onConfirm({
                id: product.id,
                name: product.displayName,
                price: product.price,
                quantity: 1,
                imageUrl: product.imageUrl,
                category: product.category,
                options: selected,
                optionLabels: labelMap
              })
            }
            className="px-4 py-2 bg-black text-white rounded"
          >
            Tambah
          </button>
        </div>
      </div>
    </div>
  )
}

export default InvoiceProductOptionModal