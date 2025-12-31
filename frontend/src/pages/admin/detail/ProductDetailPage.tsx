import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
admin: {
  active: boolean;
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

  useEffect(() => {
    fetchProduct();
  }, [id]);

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
setFormData({
  displayName: data.displayName,

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
});
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
  displayName: formData.displayName,
  description: formData.description,
  price: formData.price,
  shippedFrom: formData.shippedFrom,
  shippedTo: formData.shippedTo,
  active: formData.active,
  showInGallery: formData.showInGallery,
  frames: formData.frames
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
                    value={formData.price || 0}
                    onChange={(e) => handleChange("price", parseInt(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Frame Options */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Pilihan Frame</h3>
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