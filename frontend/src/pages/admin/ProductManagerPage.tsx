import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Product = {
  id: string;
  imageUrl: string;
  displayName: string;
  category: string;
  price: number;
  admin: {
    active: boolean;
    showInGallery: boolean;
  };
};

const ProductManagerPage: React.FC = () => {
  const API_BASE = "http://localhost:3001";
  const token = "admin-token-123";
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/manage-products`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Gagal mengambil data produk:", error);
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    filter === "ALL" ? true : p.category === filter
  );

  if (loading) return (
    <div className="p-6">
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        <p className="mt-2 text-gray-600">Memuat produk...</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Kelola Produk</h1>
        <p className="text-sm text-gray-600">
          Total produk: <span className="font-medium">{filteredProducts.length}</span>
        </p>
      </div>

      {/* Filter Kategori */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          {["ALL", "3D Frame", "2D Frame", "Acrylic Stand", "Additional", "Softcopy Design"].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                filter === cat 
                  ? "bg-black text-white border-black" 
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {cat === "ALL" ? "Semua" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar Produk */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Tidak ada produk ditemukan
          </div>
        ) : (
          filteredProducts.map(p => (
            <div
              key={p.id}
              onClick={() => navigate(`/admin/product/${p.id}`)}
              className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {/* Gambar Produk */}
              <div className="relative">
                <img 
                  src={`${API_BASE}${p.imageUrl}`}
                  alt={p.displayName}
                  className="w-16 h-16 rounded-lg object-cover border"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/64";
                  }}
                />
                {!p.admin.active && (
                  <div className="absolute inset-0 bg-gray-800 bg-opacity-50 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-medium">✕</span>
                  </div>
                )}
              </div>

              {/* Info Produk */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 truncate">
                  {p.displayName}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {p.category}
                </div>
                <div className="text-xs text-gray-400 font-mono truncate mt-1">
                  ID: {p.id}
                </div>
              </div>

              {/* Harga */}
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800">
                  Rp {p.price.toLocaleString("id-ID")}
                </div>
                <div className="text-xs text-gray-500">Harga</div>
              </div>

              {/* Status */}
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  p.admin.active 
                    ? "bg-green-100 text-green-700" 
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {p.admin.active ? "Aktif" : "Nonaktif"}
                </span>
              </div>

              {/* Tombol Edit */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/product/${p.id}`);
                }}
                className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-black transition-colors"
              >
                Edit
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Klik pada produk untuk mengedit detail</p>
      </div>
    </div>
  );
};

export default ProductManagerPage;