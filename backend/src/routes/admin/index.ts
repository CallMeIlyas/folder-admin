import { Router } from "express";
import { adminLogin } from "./../../controllers/admin/AuthController";
import mediaRoutes from "./media";
import contentRoutes from "../content";

const router = Router();

/* AUTH */
router.post("/login", adminLogin);

/* MEDIA */
router.use("/media", mediaRoutes);

/* CONTENT */
router.use("/content", contentRoutes);

export default router;