import multer from "multer";
import path from "path";
import fs from "fs";

export const uploadImage = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = String(req.body.folder || "");
      const uploadPath = path.join(
        process.cwd(),
        "uploads/images",
        folder
      );

      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
      const unique =
        Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, unique + ext);
    }
  }),

  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image allowed"));
      return;
    }
    cb(null, true);
  },

  limits: {
    fileSize: 5 * 1024 * 1024
  }
});