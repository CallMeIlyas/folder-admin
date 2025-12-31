import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(
  process.cwd(),
  "content/admin/products.json"
);

export type ProductAdminConfig = {
  active?: boolean;
  showInGallery?: boolean;

  displayName?: string;
  description?: string;
  price?: number;

  frames?: {
    glass?: boolean;
    acrylic?: boolean;
  };

  mainImage?: string | null;
  mainImageIndex?: number;
};

export const loadProductAdminConfig = (): Record<string, ProductAdminConfig> => {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
};