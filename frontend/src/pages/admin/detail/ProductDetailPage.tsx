import React, { useEffect, useState } from "react";  
import { useParams, useNavigate } from "react-router-dom";  
  
type OptionItem = {  
  value: string  
  label: {  
    en?: string  
    id?: string  
  }  
  image?: string
}  
  
type OptionGroup = {  
  id: string  
  type: "image" | "text"  
  label: {  
    en?: string  
    id?: string  
  }  
  items: {
  value: string
  label: {
    en?: string
    id?: string
  }
  image?: string
  preview?: string
  active?: boolean
  systemPrice?: number
  price?: number
}[]
}  
  
type ProductDetail = {  
  id: string;  
  imageUrl: string;  
  displayName: string;  
  category: string;  
  subcategory: string | null;  
  price: number;  
  description: {  
    en?: string  
    id?: string  
  }  
  shippedFrom: string[];  
  shippedTo: string[];  
  allImages: string[];  
  
  optionsResolved?: {  
    basePrice: number  
    groups: {  
      id: string  
      label: { en?: string; id?: string }  
      type: "image" | "text"  
      options: {  
        value: string  
        label: { en?: string; id?: string }  
        image?: string  
      }[]  
    }[]  
  }  
  
  admin: {  
  active: boolean;  
  hasOptions: boolean;  
  showInGallery: boolean;  
  shippedFrom: string[];  
  shippedTo: string[];  
  frames: {  
    glass: boolean;  
    acrylic: boolean;  
  };  
  mainImageIndex: number;  
};  
};  
  
const ProductDetailPage: React.FC = () => {  
  const API_BASE = "http://localhost:3001";  
  const token = "admin-token-123";  
  const SHIPPED_FROM_OPTIONS = ["Bogor", "Jakarta"]  
    
  const { id } = useParams<{ id: string }>();  
  const navigate = useNavigate();  
  const [adminOptions, setAdminOptions] = useState<OptionGroup[]>([])  
  const [priceOverride, setPriceOverride] = useState<number | null>(null)  
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null)  
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})  
  const [product, setProduct] = useState<ProductDetail | null>(null);  
  const [loading, setLoading] = useState(true);  
  const [saving, setSaving] = useState(false);  
  const [langTab, setLangTab] = useState<"en" | "id">("en")  
const [formData, setFormData] = useState({  
  displayName: "",  
  description: {  
    en: "",  
    id: ""  
  },  
  price: 0,  
  shippedFrom: [] as string[],  
  shippedTo: [] as string[],  
  active: true,  
  showInGallery: true,  
  frames: {  
    glass: false,  
    acrylic: false  
  }  
});  

  const [bestSelling, setBestSelling] = useState({
  enabled: false,
  label: {
    en: "",
    id: ""
  }
})
  
// useEffect  
useEffect(() => {
  setPriceOverride(null)
}, [JSON.stringify(selectedOptions)])

  useEffect(() => {  
    fetchProduct();  
  }, [id]);  
    
  useEffect(() => {  
  setSelectedOptions({})  
}, [product?.id])  
  
  useEffect(() => {  
  setPriceOverride(null)  
}, [product?.id, selectedOptions])  
  
  useEffect(() => {  
    if (!product) {  
      setCalculatedPrice(null)  
      return  
    }  
    
    if (Object.keys(selectedOptions).length === 0) {  
      setCalculatedPrice(null)  
      return  
    }  
    
    const fetchPrice = async () => {  
      try {  
        const res = await fetch(  
          `${API_BASE}/api/products/calculate-price`,  
          {  
            method: "POST",  
            headers: {  
              "Content-Type": "application/json"  
            },  
            body: JSON.stringify({  
              productId: product.id,  
              options: selectedOptions  
            })  
          }  
        )  
    
        if (!res.ok) {  
          setCalculatedPrice(null)  
          return  
        }  
    
        const data = await res.json()  
        setCalculatedPrice(  
          typeof data.price === "number" ? data.price : null  
        )  
      } catch {  
        setCalculatedPrice(null)  
      }  
    }  
    
    fetchPrice()  
  }, [selectedOptions, product?.id])  
    
  const finalPrice =  
  priceOverride !== null  
    ? priceOverride  
    : calculatedPrice ?? formData.price  
  
  const fetchProduct = async () => {  
    try {  
      // ✅ PERBAIKAN: /api/admin/manage-products/${id}  
      const res = await fetch(`${API_BASE}/api/admin/manage-products/${id}`, {  
        headers: {  
          Authorization: `Bearer ${token}`  
        }  
      });  
      const data = await res.json();  
      setProduct(data);  
      
      const normalizeAdminOptions = (groups) =>
  groups.map(g => ({
    ...g,
    items: g.items.map(i => ({
      ...i,
    }))
  }))
        
const syncOptions = (resolvedGroups, adminGroups = []) => {
  return resolvedGroups.map(rg => {
    const ag = adminGroups.find(g => g.id === rg.id)

    return {
      id: rg.id,
      type: rg.type,
      label: rg.label,
      items: rg.options.map(opt => {
        const saved = ag?.items?.find(i => i.value === opt.value)

        return {
          value: opt.value,
          label: opt.label,
          image: opt.image,
          systemPrice: opt.price,
          price: saved?.price,
          active:
            saved?.active ??
            opt.active ??
            true
        }
      })
    }
  })
}

setAdminOptions(
  syncOptions(
    data.optionsResolved?.groups || [],
    data.admin?.options?.groups || []
  )
)
  
  
setFormData({  
displayName:  
  data.admin?.displayNameOverride?.trim()  
    ? data.admin.displayNameOverride  
    : data.displayName,  
  
  description:  
    typeof data.description === "string"  
      ? { en: data.description, id: "" }  
      : {  
          en: data.description?.en || "",  
          id: data.description?.id || ""  
        },  
  
  price: data.price,  
  
  shippedFrom: data.admin.shippedFrom || [],  
  shippedTo: data.admin.shippedTo || [],  
  
  active: data.admin.active,  
  showInGallery: data.admin.showInGallery,  
  
  frames: {  
    glass: data.admin.frames.glass,  
    acrylic: data.admin.frames.acrylic  
  }  
})  

setBestSelling({
  enabled: data.admin?.bestSelling?.enabled ?? false,
  label: {
    en: data.admin?.bestSelling?.label?.en || "",
    id: data.admin?.bestSelling?.label?.id || ""
  }
})
setLoading(false);  
      
      
    } catch (error) {  
      console.error("Gagal mengambil data produk:", error);  
      setLoading(false);  
    }  
  };  
  
  const handleChange = (field: string, value: any) => {  
    setFormData({  
      ...formData,  
      [field]: value  
    });  
  };  
  
  const handleFrameChange = (frameType: "glass" | "acrylic", checked: boolean) => {  
    setFormData({  
      ...formData,  
      frames: {  
        ...formData.frames,  
        [frameType]: checked  
      }  
    });  
  };  
  
  const handleSave = async () => {  
    if (!product) return;  
      
    setSaving(true);  
    try {  
      // ✅ PERBAIKAN: /api/admin/manage-products/${id}  
      await fetch(`${API_BASE}/api/admin/manage-products/${id}`, {  
        method: "PUT",  
        headers: {  
          "Content-Type": "application/json",  
          Authorization: `Bearer ${token}`  
        },  
body: JSON.stringify({  
  displayNameOverride: formData.displayName,  
  description: formData.description,  
  price: finalPrice,  
  shippedFrom: formData.shippedFrom,  
  shippedTo: formData.shippedTo,  
  active: formData.active,  
  showInGallery: formData.showInGallery,  
  frames: formData.frames,  
  bestSelling,
  options: {  
  groups: adminOptions
  }  
})  
      });  
        
      // Refresh data setelah simpan  
      await fetchProduct();  
      alert("Perubahan berhasil disimpan!");  
    } catch (error) {  
      console.error("Gagal menyimpan perubahan:", error);  
      alert("Gagal menyimpan perubahan. Coba lagi.");  
    } finally {  
      setSaving(false);  
    }  
  };  
  
  const handleSetMainImage = async (imageIndex: number) => {  
    try {  
      // ✅ PERBAIKAN: /api/admin/manage-products/${id}/main-image  
      await fetch(`${API_BASE}/api/admin/manage-products/${id}/main-image`, {  
        method: "PUT",  
        headers: {  
          "Content-Type": "application/json",  
          Authorization: `Bearer ${token}`  
        },  
        body: JSON.stringify({ mainImageIndex: imageIndex })  
      });  
      await fetchProduct();  
      alert("Gambar utama berhasil diubah!");  
    } catch (error) {  
      console.error("Gagal mengubah gambar utama:", error);  
    }  
  };  
  
  if (loading) return (  
    <div className="p-6">  
      <div className="text-center py-10">  
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>  
        <p className="mt-2 text-gray-600">Memuat detail produk...</p>  
      </div>  
    </div>  
  );  
  
  if (!product) return (  
    <div className="p-6">  
      <div className="text-center py-10">  
        <p className="text-gray-600">Produk tidak ditemukan</p>  
        <button  
          // ✅ PERBAIKAN: /admin/product  
          onClick={() => navigate("/admin/product")}  
          className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors"  
        >  
          Kembali ke Daftar  
        </button>  
      </div>  
    </div>  
  );  
  
  const mainImageUrl = `${API_BASE}${product.allImages?.[product.admin.mainImageIndex || 0] || product.imageUrl}`;  
  
  return (  
    <div className="p-4 md:p-6 max-w-5xl mx-auto">  
      {/* Header */}  
      <div className="mb-6">  
        <button  
          // ✅ PERBAIKAN: /admin/product  
          onClick={() => navigate("/admin/product")}  
          className="inline-flex items-center text-sm text-gray-600 hover:text-black mb-4"  
        >  
          <span className="mr-1">←</span> Kembali ke Daftar  
        </button>  
        <h1 className="text-2xl font-bold text-gray-800">Edit Produk</h1>  
        <p className="text-sm text-gray-500 mt-1">  
          ID: {product.id} | Kategori: {product.category}  
        </p>  
      </div>  
  
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">  
        {/* Bagian Kiri - Gambar */}  
        <div className="lg:col-span-1">  
          <div className="sticky top-6">  
            <div className="bg-white rounded-xl border p-4 shadow-sm">  
              <h2 className="font-medium text-gray-700 mb-4">Gambar Produk</h2>  
                
              {/* Gambar Utama */}  
              <div className="mb-6">  
                <div className="text-xs text-gray-500 mb-2">Gambar Utama</div>  
                <div className="border rounded-lg overflow-hidden">  
                  <img  
                    src={mainImageUrl}  
                    alt={product.displayName}  
                    className="w-full h-64 object-cover"  
                    onError={(e) => {  
                      e.currentTarget.src = "https://via.placeholder.com/400x300";  
                    }}  
                  />  
                </div>  
              </div>  
  
              {/* Daftar Semua Gambar */}  
              <div>  
                <div className="text-xs text-gray-500 mb-2">Semua Gambar</div>  
                <div className="grid grid-cols-3 gap-2">  
                  {product.allImages?.map((img, index) => (  
                    <div  
                      key={index}  
                      className={`relative cursor-pointer border rounded overflow-hidden ${  
                        product.admin.mainImageIndex === index ? "ring-2 ring-blue-500" : ""  
                      }`}  
                      onClick={() => handleSetMainImage(index)}  
                    >  
                      <img  
                        src={`${API_BASE}${img}`}  
                        alt={`Produk ${index + 1}`}  
                        className="w-full h-20 object-cover"  
                        onError={(e) => {  
                          e.currentTarget.src = "https://via.placeholder.com/80";  
                        }}  
                      />  
                      {product.admin.mainImageIndex === index && (  
                        <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 rounded">  
                          Utama  
                        </div>  
                      )}  
                    </div>  
                  ))}  
                </div>  
              </div>  
            </div>  
          </div>  
        </div>  
  
        {/* Bagian Kanan - Form Edit */}  
        <div className="lg:col-span-2">  
          <div className="bg-white rounded-xl border shadow-sm">  
            <div className="p-6 space-y-6">  
              {/* Nama Produk */}  
              <div>  
                <label className="block text-sm font-medium text-gray-700 mb-2">  
                  Nama Produk  
                </label>  
                <input  
                  type="text"  
                  value={formData.displayName || ""}  
                  onChange={(e) => handleChange("displayName", e.target.value)}  
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"  
                  placeholder="Masukkan nama produk"  
                />  
              </div>  
  
              {/* Deskripsi */}  
              <div>  
                <label className="block text-sm font-medium text-gray-700 mb-2">  
                  Deskripsi Produk  
                </label>  
<div className="flex gap-2 mb-2">  
  <button  
    onClick={() => setLangTab("en")}  
    className={langTab === "en" ? "font-bold" : ""}  
  >  
    EN  
  </button>  
  <button  
    onClick={() => setLangTab("id")}  
    className={langTab === "id" ? "font-bold" : ""}  
  >  
    ID  
  </button>  
</div>  
  
<textarea  
  value={formData.description[langTab]}  
  onChange={(e) =>  
    setFormData({  
      ...formData,  
      description: {  
        ...formData.description,  
        [langTab]: e.target.value  
      }  
    })  
  }  
  rows={6}  
  className="w-full px-4 py-2 border rounded-lg"  
/>  
              </div>  
              
{/* Best Selling */}
<div className="border-t pt-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Best Selling Label
  </label>
  
  <label className="flex items-center gap-2 mb-3 text-sm">
    <input
      type="checkbox"
      checked={bestSelling.enabled}
      onChange={(e) => 
        setBestSelling({
          ...bestSelling,
          enabled: e.target.checked
        })
      }
      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
    />
    Aktifkan Best Selling
  </label>
  
  {bestSelling.enabled && (
    <>
      <input
        type="text"
        placeholder="Best Selling text (EN)"
        value={bestSelling.label.en}
        onChange={(e) =>
          setBestSelling({
            ...bestSelling,
            label: {
              ...bestSelling.label,
              en: e.target.value
            }
          })
        }
        className="w-full mb-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <input
        type="text"
        placeholder="Best Selling text (ID)"
        value={bestSelling.label.id}
        onChange={(e) =>
          setBestSelling({
            ...bestSelling,
            label: {
              ...bestSelling.label,
              id: e.target.value
            }
          })
        }
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <div className="mt-2 text-xs text-gray-500">
        Label ini akan ditampilkan di halaman utama sebagai badge "Best Selling"
      </div>
    </>
  )}
</div>


  
{/* Harga */}  
<div>  
  <label className="block text-sm font-medium text-gray-700 mb-2">  
    Harga (IDR)  
  </label>  
  
  <div className="relative">  
    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">  
      Rp  
    </span>  
  
    <input  
      type="number"  
      value={finalPrice || 0}  
      onChange={(e) => {  
        const v = parseInt(e.target.value)  
        setPriceOverride(isNaN(v) ? null : v)  
      }}  
      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"  
    />  
  </div>  
  
  {calculatedPrice !== null && (  
    <div className="mt-2 text-sm text-gray-600">  
      Harga sistem:  
      <span className="font-semibold ml-1">  
        Rp {calculatedPrice.toLocaleString("id-ID")}  
      </span>  
    </div>  
  )}  
  
  {priceOverride !== null && (  
    <div className="mt-1 text-xs text-blue-600">  
      Harga diubah manual oleh admin  
    </div>  
  )}  
</div>  
                
{/* Product Options Preview (CRUD source: adminOptions) */}
{adminOptions.length > 0 && (
  <div className="border-t pt-6 space-y-6">
    {adminOptions.map(group => (
      <div key={group.id}>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {group.label[langTab] || group.label.en}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {group.items.map(item => {
            const isSelected =
              selectedOptions[group.id] === item.value

            const showImage =
              group.type === "image" && !!item.image

            return (
              <div
                key={item.value}
onClick={() => {
  if (item.active === false) return

  setSelectedOptions(prev => ({
    ...prev,
    [group.id]: item.value
  }))
}}
                className={`border rounded-lg p-2 cursor-pointer transition
                  ${item.active === false && "opacity-50"}
                  ${isSelected
                    ? "border-black ring-2 ring-black"
                    : "hover:border-black"}
                `}
              >
                {showImage && (
                  <img
                    src={`${API_BASE}${item.image}`}
                    alt={item.label[langTab] || item.label.en || item.value}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}

                <div className="text-xs text-center">
                  {item.label[langTab] || item.label.en || item.value}
                </div>

                {item.active === false && (
                  <div className="text-[11px] text-red-500 text-center mt-1">
                    Nonaktif
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    ))}
  </div>
)}
              {/* Frame Options */}  
{product.category.includes("Frame") &&
 (product.admin.frames.glass || product.admin.frames.acrylic) && (
  <div className="border-t pt-6">  
    <h3 className="text-sm font-medium text-gray-700 mb-4">  
      Pilihan Frame  
    </h3>  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
                  <label className="flex items-center space-x-3 cursor-pointer">  
                    <input  
                      type="checkbox"  
                      checked={formData.frames?.glass || false}  
                      onChange={(e) => handleFrameChange("glass", e.target.checked)}  
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"  
                    />  
                    <div>  
                      <div className="font-medium">Frame Kaca</div>  
                      <div className="text-xs text-gray-500">Kaca standar</div>  
                    </div>  
                  </label>  
                    
                  <label className="flex items-center space-x-3 cursor-pointer">  
                    <input  
                      type="checkbox"  
                      checked={formData.frames?.acrylic || false}  
                      onChange={(e) => handleFrameChange("acrylic", e.target.checked)}  
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"  
                    />  
                    <div>  
                      <div className="font-medium">Frame Acrylic</div>  
                      <div className="text-xs text-gray-500">Acrylic transparan</div>  
                    </div>  
                  </label>  
                </div>  
              </div>  
              )}  
                
{/* Option Groups Editor */}  
<div className="border-t pt-6 space-y-6">  
  <h3 className="text-sm font-medium text-gray-700">  
    Product Options  
  </h3>  
  
  {adminOptions.map((group, gIndex) => (  
    <div key={group.id} className="border rounded-lg p-4 space-y-4">  
      {/* Group header */}  
      <div className="flex gap-2">  
        <input  
          value={group.label[langTab] || ""}  
          onChange={(e) => {  
            const next = [...adminOptions]  
            next[gIndex].label[langTab] = e.target.value  
            setAdminOptions(next)  
          }}  
          className="border px-2 py-1 rounded w-full"  
          placeholder="Group label"  
        />  
  
        <button  
          onClick={() =>  
            setAdminOptions(adminOptions.filter((_, i) => i !== gIndex))  
          }  
          className="text-red-600 text-sm"  
        >  
          Hapus  
        </button>  
      </div>  
  
      {/* Items */}  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">  
{group.items.map((item, iIndex) => {
  const finalOptionPrice =
    item.price !== undefined
      ? item.price
      : item.systemPrice ?? 0

  return (
    <div key={iIndex} className="border rounded p-2 space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {/* Value key */}
        <input
          value={item.value}
          onChange={(e) => {
            const next = [...adminOptions]
            next[gIndex].items[iIndex].value = e.target.value
            setAdminOptions(next)
          }}
          className="border px-2 py-1 rounded col-span-2"
          placeholder="Value key"
        />

        <p className="col-span-3 text-xs text-gray-500">
          ID internal untuk sistem. Dipakai saat hitung harga dan order.
        </p>

        {/* Harga Option */}
        <div className="col-span-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Harga Option (IDR)
          </label>

          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              Rp
            </span>

            <input
              type="number"
              value={finalOptionPrice || ""}
              onChange={(e) => {
                const v = parseInt(e.target.value)
                const next = [...adminOptions]

                next[gIndex].items[iIndex].price =
                  isNaN(v) ? undefined : v

                setAdminOptions(next)
              }}
              className="border px-2 py-1 pl-8 rounded w-full text-right"
              placeholder="Harga option"
            />
          </div>

          {item.systemPrice !== undefined && (
            <div className="mt-1 text-xs text-gray-600">
              Harga sistem:
              <span className="font-semibold ml-1">
                Rp {item.systemPrice.toLocaleString("id-ID")}
              </span>
            </div>
          )}

          {item.price !== undefined && (
            <div className="mt-1 text-[11px] text-blue-600">
              Harga diubah manual oleh admin
            </div>
          )}
        </div>
      </div>

      {/* Label */}
      <input
        value={item.label[langTab] || ""}
        onChange={(e) => {
          const next = [...adminOptions]
          next[gIndex].items[iIndex].label[langTab] = e.target.value
          setAdminOptions(next)
        }}
        className="border px-2 py-1 rounded w-full"
        placeholder="Label"
      />

      {/* Active */}
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={item.active === true}
          onChange={(e) => {
            const next = [...adminOptions]
            next[gIndex].items[iIndex].active = e.target.checked
            setAdminOptions(next)
          }}
        />
        Aktif
      </label>

      {/* Delete */}
      <button
        onClick={() => {
          const next = [...adminOptions]
          next[gIndex].items.splice(iIndex, 1)
          setAdminOptions(next)
        }}
        className="text-xs text-red-500"
      >
        Hapus option
      </button>
    </div>
  )
})}
      </div>  
  
      {/* Add item */}  
      <button  
        onClick={() => {  
          const next = [...adminOptions]  
          next[gIndex].items.push({  
            value: "",  
            label: { en: "", id: "" },  
            active: true  
          })  
          setAdminOptions(next)  
        }}  
        className="text-sm text-blue-600"  
      >  
        + Tambah Option  
      </button>  
    </div>  
  ))}  
  
  {/* Add group */}  
  <button  
    onClick={() =>  
      setAdminOptions([  
        ...adminOptions,  
        {  
          id: `group_${Date.now()}`,  
          type: "text",  
          label: { en: "", id: "" },  
          items: []  
        }  
      ])  
    }  
    className="text-sm text-blue-600"  
  >  
    + Tambah Group  
  </button>  
</div>  
  
              {/* Pengaturan */}  
              <div className="border-t pt-6">  
                <h3 className="text-sm font-medium text-gray-700 mb-4">Pengaturan</h3>  
                <div className="space-y-4">  
                  {/* Aktif/Nonaktif */}  
                  <div className="flex items-center justify-between">  
                    <div>  
                      <div className="font-medium">Produk Aktif</div>  
                      <div className="text-xs text-gray-500">Produk dapat dilihat pelanggan</div>  
                    </div>  
                    <label className="relative inline-flex items-center cursor-pointer">  
                      <input  
                        type="checkbox"  
                        checked={formData.active || false}  
                        onChange={(e) => handleChange("active", e.target.checked)}  
                        className="sr-only peer"  
                      />  
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>  
                    </label>  
                  </div>  
  
                </div>  
              </div>  
  
              {/* Info Produk */}  
              <div className="border-t pt-6">  
                <h3 className="text-sm font-medium text-gray-700 mb-4">Info Produk</h3>  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">  
<div>  
  <div className="text-gray-500 mb-2">Dikirim Dari</div>  
  
  <div className="space-y-2">  
    {SHIPPED_FROM_OPTIONS.map(city => (  
      <label key={city} className="flex items-center gap-2 cursor-pointer">  
        <input  
          type="checkbox"  
          checked={formData.shippedFrom.includes(city)}  
          onChange={(e) => {  
            const next = e.target.checked  
              ? [...formData.shippedFrom, city]  
              : formData.shippedFrom.filter(c => c !== city)  
  
            setFormData({  
              ...formData,  
              shippedFrom: next  
            })  
          }}  
          className="w-4 h-4"  
        />  
        <span className="text-sm">{city}</span>  
      </label>  
    ))}  
  </div>  
</div>  
<div>  
  <div className="text-gray-500 mb-2">Dikirim Ke</div>  
  
  <label className="relative inline-flex items-center cursor-pointer">  
    <input  
      type="checkbox"  
      className="sr-only peer"  
      checked={formData.shippedTo.includes("Worldwide")}  
      onChange={(e) =>  
        setFormData({  
          ...formData,  
          shippedTo: e.target.checked ? ["Worldwide"] : []  
        })  
      }  
    />  
    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>  
    <span className="ml-3 text-sm font-medium">Worldwide</span>  
  </label>  
</div>  
                  <div>  
                    <div className="text-gray-500">Kategori</div>  
                    <div className="font-medium">{product.category}</div>  
                  </div>  
                  <div>  
                    <div className="text-gray-500">Subkategori</div>  
                    <div className="font-medium">{product.subcategory || "-"}</div>  
                  </div>  
                </div>  
              </div>  
  
              {/* Tombol Aksi */}  
              <div className="border-t pt-6">  
                <div className="flex gap-3">  
                  <button  
                    onClick={handleSave}  
                    disabled={saving}  
                    className="flex-1 px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"  
                  >  
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}  
                  </button>  
                  <button  
                    // ✅ PERBAIKAN: /admin/product  
                    onClick={() => navigate("/admin/product")}  
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"  
                  >  
                    Batal  
                  </button>  
                </div>  
              </div>  
            </div>  
          </div>  
        </div>  
      </div>  
    </div>  
  );  
};  
  
export default ProductDetailPage;