import { Router } from "express";
import { getHeroContent } from "../controllers/ContentController";
import { getBestSellingContent } from "../controllers/BestSellingController";
import { getOrderStepsContent } from "../controllers/OrderStepsController";
import { getGalleryContent } from "../controllers/GalleryContentController";

const router = Router();

router.get("/hero", getHeroContent);
router.get("/bestselling", getBestSellingContent);
router.get("/ordersteps", getOrderStepsContent);
router.get("/gallery", getGalleryContent);

export default router;