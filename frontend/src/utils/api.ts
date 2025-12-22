const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiFetch = (path: string, options?: RequestInit) => {
  return fetch(`${API_BASE_URL}${path}`, options);
};

export const apiAsset = (path: string) => {
  if (!path) return "";

  const cleanPath = path
    .replace(/^\/+/, "")        // hapus slash depan
    .replace(/^api\/uploads\//, ""); // hapus api/uploads kalau sudah ada

  return `${API_BASE_URL}/api/uploads/${encodeURI(cleanPath)}`;
};