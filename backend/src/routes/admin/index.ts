import { Router } from "express";
import { adminLogin } from "../../controllers/admin/AuthController";
import mediaRoutes from "./media";
import contentRoutes from "../content";
import productRoutes from "../products";
import adminProductRoutes from "./products";

const router = Router();

/* AUTH */
router.post("/login", adminLogin);

/* MEDIA */
router.use("/media", mediaRoutes);

/* CONTENT */
router.use("/content", contentRoutes);

/* PUBLIC PRODUCTS (READ) */
router.use("/products", productRoutes);

/* ADMIN PRODUCTS (CRUD) */
router.use("/manage-products", adminProductRoutes);

export default router;