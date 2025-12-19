import { Router } from "express";
import { getHeroContent } from "../controllers/ContentController";
import { getBestSellingContent } from "../controllers/BestSellingController";
import { getOrderStepsContent } from "../controllers/OrderStepsController";

const router = Router();

router.get("/hero", getHeroContent);
router.get("/bestselling", getBestSellingContent);
router.get("/ordersteps", getOrderStepsContent);

export default router;