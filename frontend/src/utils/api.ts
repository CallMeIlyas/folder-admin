const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiFetch = (path: string, options?: RequestInit) => {
  return fetch(`${API_BASE_URL}${path}`, options);
};

export const apiAsset = (path: string) => {
  return `${API_BASE_URL}${path}`;
};