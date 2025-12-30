import { Router } from "express";
import {
  getAllProductsAdmin,
  getProductAdminById,
  updateProductActive,
  updateProductGallery,
  updateProductFrames,
  updateProductMainImage,
  updateProductAdminConfig
} from "../../controllers/admin/ProductAdminController";

const router = Router();

router.get("/", getAllProductsAdmin);
router.get("/:id", getProductAdminById);
router.put("/:id", updateProductAdminConfig);
router.put("/:id/active", updateProductActive);
router.put("/:id/gallery", updateProductGallery);
router.put("/:id/frames", updateProductFrames);
router.put("/:id/main-image", updateProductMainImage);

export default router;