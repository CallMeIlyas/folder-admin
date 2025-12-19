import fs from "fs";
import path from "path";

export const readJson = (relativePath: string) => {
  const fullPath = path.join(process.cwd(), relativePath);
  const raw = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(raw);
};