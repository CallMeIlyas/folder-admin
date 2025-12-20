import { Router } from "express";
import { getProductDetail } from "../controllers/ProductDetailController";
import { calculatePrice } from "../controllers/ProductPriceController";
import { getAdditionalProducts } from "../controllers/ProductAdditionalController";

const router = Router();

router.get("/:id", getProductDetail);
router.post("/calculate-price", calculatePrice);
router.get("/additional", getAdditionalProducts);

export default router;