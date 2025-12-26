import { Router } from "express";
import { adminAuth } from "../../middleware/adminAuth";
import { uploadImage } from "../../middleware/uploadImage";
import {
  listImages,
  uploadImageFile,
  deleteImageOrFolder
} from "../../controllers/admin/media/ImageController";

const router = Router();

router.get("/images", adminAuth, listImages);

router.post(
  "/images/upload",
  adminAuth,
  uploadImage.array("images"),
  uploadImageFile
);

router.delete(
  "/images",
  adminAuth,
  deleteImageOrFolder
);

export default router;