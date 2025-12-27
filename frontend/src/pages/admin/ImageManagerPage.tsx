import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/utils/api";

interface ImageItem {
  id: string;
  name: string;
  type: "folder" | "image";
  url: string | null;
}

const ImageManagerPage = () => {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState("");
  const [selectedItems, setSelectedItems] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages(currentFolder);
    setSelectedItems([]);
  }, [currentFolder]);

  const fetchImages = async (folder: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch(
        `/api/admin/media/images?folder=${encodeURIComponent(folder)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`
          }
        }
      );

      if (!res.ok) throw new Error("Gagal mengambil data");

      setItems(await res.json());
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const openFolder = (name: string) => {
    setCurrentFolder(currentFolder ? `${currentFolder}/${name}` : name);
  };

  const goBack = () => {
    setCurrentFolder(currentFolder.split("/").slice(0, -1).join("/"));
  };

  const toggleSelect = (item: ImageItem) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.filter(i => i.id !== item.id);
      return [...prev, item];
    });
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      Array.from(files).forEach(file =>
        formData.append("images", file)
      );
      formData.append("folder", currentFolder);

      const res = await apiFetch(
        "/api/admin/media/images/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`
          },
          body: formData
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Upload gagal");
      }

      fetchImages(currentFolder);
    } catch (err: any) {
      setError(err.message || "Upload gagal");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const confirmDelete = async () => {
    try {
      for (const item of selectedItems) {
        const path = currentFolder
          ? `${currentFolder}/${item.name}`
          : item.name;

        const res = await apiFetch(
          "/api/admin/media/images",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("admin_token")}`
            },
            body: JSON.stringify({ path })
          }
        );

        if (!res.ok) throw new Error("Gagal menghapus");
      }

      setSelectedItems([]);
      fetchImages(currentFolder);
    } catch (err: any) {
      setError(err.message || "Delete gagal");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const confirmRename = async () => {
    if (selectedItems.length !== 1) return;

    const item = selectedItems[0];
    const oldPath = currentFolder
      ? `${currentFolder}/${item.name}`
      : item.name;

    try {
      const res = await apiFetch(
        "/api/admin/media/images/rename",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`
          },
          body: JSON.stringify({
            oldPath,
            newName: renameValue
          })
        }
      );

      if (!res.ok) throw new Error("Rename gagal");

      setShowRename(false);
      setSelectedItems([]);
      fetchImages(currentFolder);
    } catch (err: any) {
      setError(err.message || "Rename gagal");
    }
  };

  const canRename =
    selectedItems.length === 1 &&
    selectedItems[0].type === "image";

  return (
    <div className="p-6 font-poppinsRegular">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-poppinsBold">Image Manager</h1>
          <p className="text-gray-600">
            Upload dan kelola semua gambar website
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={openFilePicker}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            ＋ Upload
          </button>

          <button
            onClick={() => {
              const base = selectedItems[0].name.replace(/\.[^/.]+$/, "");
              setRenameValue(base);
              setShowRename(true);
            }}
            disabled={!canRename}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            ✎ Rename
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={selectedItems.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            🗑 Hapus ({selectedItems.length})
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {currentFolder && (
        <button
          onClick={goBack}
          className="mb-4 text-sm text-blue-600 hover:underline"
        >
          ← Kembali
        </button>
      )}

      {loading && <p>Loading...</p>}
      {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* GRID */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(item => {
            const selected = selectedItems.some(
              i => i.id === item.id
            );

            return (
              <div
                key={item.id}
                className={`relative border rounded-lg p-3 cursor-pointer hover:bg-gray-50 ${
                  selected ? "border-black ring-2 ring-black" : ""
                }`}
                onClick={() => {
                  if (item.type === "folder") {
                    openFolder(item.name);
                  } else {
                    toggleSelect(item);
                  }
                }}
              >
                {selected && (
                  <div className="absolute top-2 right-2 bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}

                {item.type === "folder" ? (
                  <div className="flex flex-col items-center justify-center h-40">
                    <div className="text-5xl">📁</div>
                    <p className="text-sm mt-2 truncate">{item.name}</p>
                  </div>
                ) : (
                  <>
                    <img
                      src={item.url || ""}
                      alt={item.name}
                      className="w-full h-40 object-cover rounded"
                    />
                    <p className="text-xs mt-2 truncate">{item.name}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#dcbec1] flex items-center justify-center mb-4">
              !
            </div>
            <h3 className="font-poppinsBold mb-2">
              Hapus {selectedItems.length} file?
            </h3>
            <p className="text-gray-600 mb-6">
              File akan dihapus permanen
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="w-full py-3 rounded-full bg-[#dcbec1] hover:bg-[#c7a9ac]"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {showRename && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#dcbec1] flex items-center justify-center mb-4">
              ✎
            </div>
            <h3 className="font-poppinsBold mb-2">Ubah Nama File</h3>
            <input
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRename(false)}
                className="w-full py-3 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={confirmRename}
                className="w-full py-3 rounded-full bg-[#dcbec1] hover:bg-[#c7a9ac]"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageManagerPage;