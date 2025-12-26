import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const IMAGE_ROOT = path.join(process.cwd(), "uploads/images");

// list folder & file
export const listImages = (req: Request, res: Response) => {
  const folder = String(req.query.folder || "");
  const targetDir = path.join(IMAGE_ROOT, folder);

  if (!fs.existsSync(targetDir)) {
    return res.json([]);
  }

  const protocol = req.protocol;
  const host = req.get("host");

  const entries = fs.readdirSync(targetDir, { withFileTypes: true });

  const folders = entries
    .filter(e => e.isDirectory())
    .map(e => ({
      id: `folder-${e.name}`,
      name: e.name,
      type: "folder",
      url: null
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const images = entries
    .filter(e => e.isFile())
    .map(e => ({
      id: `image-${e.name}`,
      name: e.name,
      type: "image",
      url: `${protocol}://${host}/api/uploads/images/${folder ? folder + "/" : ""}${e.name}`
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json([...folders, ...images]);
};
// upload 
export const uploadImageFile = (req: Request, res: Response) => {
  if (!req.files || !Array.isArray(req.files)) {
    return res.status(400).json({
      success: false,
      message: "No image uploaded"
    });
  }

  const folder = String(req.body.folder || "");

  const files = req.files.map(file => ({
    name: file.filename,
    url: `/api/uploads/images/${folder ? folder + "/" : ""}${file.filename}`
  }));

  res.json({
    success: true,
    files
  });
};
// delate 
export const deleteImageOrFolder = (req: Request, res: Response) => {
  const { path: targetPath } = req.body;

  if (!targetPath) {
    return res.status(400).json({ message: "Path required" });
  }

  const fullPath = path.join(
    process.cwd(),
    "uploads/images",
    targetPath
  );

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ message: "File not found" });
  }

  try {
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Failed to delete" });
  }
};