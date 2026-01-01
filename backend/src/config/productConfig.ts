import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(
  process.cwd(),
  "content/admin/products.json"
);

export type ProductAdminConfig = {
  active?: boolean
  showInGallery?: boolean

  displayNameOverride?: string
  description?: any
  price?: number

  shippedFrom?: string[]
  shippedTo?: string[]

  frames?: {
    glass?: boolean
    acrylic?: boolean
  }

  mainImageIndex?: number
}

export const loadProductAdminConfig = (): Record<string, ProductAdminConfig> => {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
};