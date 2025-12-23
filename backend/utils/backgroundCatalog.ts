import fs from "fs";
import path from "path";

export const getBackgroundCatalogImages = (catalog: string) => {
  const baseDir = path.join(
    process.cwd(),
    "uploads/images/bg-catalog",
    catalog
  );

  if (!fs.existsSync(baseDir)) return [];

  return fs
    .readdirSync(baseDir)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .map(file => `images/bg-catalog/${catalog}/${file}`);
};