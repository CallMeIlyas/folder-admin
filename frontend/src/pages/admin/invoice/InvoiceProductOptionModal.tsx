import React, { useEffect, useState } from "react"

type Props = {
  product: {
    id: string
    displayName: string
    price: number
    imageUrl?: string
    category?: string
  }
  onConfirm: (item: any) => void
  onClose: () => void
  initialOptions?: Record<string, string>
}

const getLabel = (labelObj: any, lang: "id" | "en" = "id"): string => {
  if (!labelObj) return ""
  if (typeof labelObj === "string") return labelObj
  if (typeof labelObj === "object") {
    return labelObj[lang] || labelObj.en || labelObj.id || ""
  }
  return String(labelObj)
}

const InvoiceProductOptionModal: React.FC<Props> = ({
  product,
  onConfirm,
  onClose,
  initialOptions
}) => {
  const API_BASE = "http://localhost:3001"

  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<any[]>([])
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [labelMap, setLabelMap] = useState<Record<string, string>>({})
  const [calculatedPrice, setCalculatedPrice] = useState(product.price)

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

        // Auto-select logic
        const defaults: Record<string, string> = {}
        const labels: Record<string, string> = {}

        // Initial options (edit mode)
        if (initialOptions && Object.keys(initialOptions).length > 0) {
          Object.entries(initialOptions).forEach(([groupId, value]) => {
            const group = groupsData.find(g => g.id === groupId)
            if (group) {
              const option = group.options.find(opt => opt.value === value)
              if (option) {
                defaults[groupId] = value
                labels[groupId] = getLabel(option.label)
              }
            }
          })
        }

        // Use defaultValue from API
        groupsData.forEach(group => {
          if (defaults[group.id]) return
          
          if (group.defaultValue) {
            const option = group.options.find(opt => opt.value === group.defaultValue)
            if (option) {
              defaults[group.id] = group.defaultValue
              labels[group.id] = getLabel(option.label)
            } else {
              const firstActive = group.options.find(opt => opt.active !== false)
              if (firstActive) {
                defaults[group.id] = firstActive.value
                labels[group.id] = getLabel(firstActive.label)
              }
            }
          } else {
            const firstActive = group.options.find(opt => opt.active !== false)
            if (firstActive) {
              defaults[group.id] = firstActive.value
              labels[group.id] = getLabel(firstActive.label)
            }
          }
        })

        setSelected(defaults)
        setLabelMap(labels)
        
        // Calculate initial price
        calculatePriceFromSelections(defaults, groupsData)
        
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOptions()
  }, [product.id, initialOptions])

  // Simple price calculation
  const calculatePriceFromSelections = (selections: Record<string, string>, groupsData: any[]) => {
    let finalPrice = product.price
    
    // Find first option with price and use it
    for (const group of groupsData) {
      const selectedValue = selections[group.id]
      if (selectedValue) {
        const option = group.options.find((opt: any) => opt.value === selectedValue)
        if (option && option.price !== undefined && option.price > 0) {
          finalPrice = option.price
          break
        }
      }
    }
    
    setCalculatedPrice(finalPrice)
  }

  const handleSelect = (group: any, opt: any) => {
    const newSelected = {
      ...selected,
      [group.id]: opt.value
    }

    const newLabels = {
      ...labelMap,
      [group.id]: getLabel(opt.label)
    }

    setSelected(newSelected)
    setLabelMap(newLabels)
    
    // Update price
    calculatePriceFromSelections(newSelected, groups)
  }

  const handleConfirm = () => {
    const itemToAdd = {
      id: product.id,
      name: product.displayName,
      price: calculatedPrice,
      quantity: 1,
      imageUrl: product.imageUrl,
      category: product.category
    }

    if (Object.keys(selected).length > 0) {
      Object.assign(itemToAdd, {
        options: selected,
        optionLabels: labelMap
      })
    }

    onConfirm(itemToAdd)
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
          <p className="text-gray-600">Produk ini tidak memiliki opsi</p>
          <div className="flex justify-between items-center">
            <span className="font-medium">{product.displayName}</span>
            <span className="font-bold">Rp{product.price.toLocaleString("id-ID")}</span>
          </div>

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
                  category: product.category
                })
              }
              className="px-4 py-2 bg-black text-white rounded"
            >
              Tambah ke Cart
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-1">Pilih Opsi</h2>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">{product.displayName}</p>
            <p className="font-bold">Rp{calculatedPrice.toLocaleString("id-ID")}</p>
          </div>
        </div>

        {/* Options List */}
        <div className="space-y-4">
          {groups.map(group => {
            const selectedValue = selected[group.id]
            
            return (
              <div key={group.id} className="space-y-2">
                <p className="text-sm font-medium">
                  {getLabel(group.label)}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {group.options
                    .filter((opt: any) => opt.active !== false)
                    .map((opt: any) => (
                      <button
                        key={opt.value}
                        onClick={() => handleSelect(group, opt)}
                        className={`px-3 py-2 text-sm rounded border ${
                          selected[group.id] === opt.value
                            ? "bg-gray-800 text-white"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span>{getLabel(opt.label)}</span>
                          {opt.price !== undefined && opt.price > 0 && (
                            <span className="text-xs mt-0.5 opacity-80">
                              Rp{opt.price.toLocaleString("id-ID")}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Options */}
        {Object.keys(selected).length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <p className="text-sm font-medium mb-2">Opsi dipilih:</p>
            <div className="space-y-1">
              {Object.entries(labelMap).map(([groupId, label]) => {
                const group = groups.find(g => g.id === groupId)
                return (
                  <div key={groupId} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {group ? getLabel(group.label) : ''}:
                    </span>
                    <span>{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
          >
            Tambah ke Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default InvoiceProductOptionModal