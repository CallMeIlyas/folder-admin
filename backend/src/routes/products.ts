import { Router } from "express";
import { getProductDetail } from "../controllers/ProductDetailController";
import { calculatePrice } from "../controllers/ProductPriceController";
import { getAdditionalProducts } from "../controllers/ProductAdditionalController";

const router = Router();

// === ADDITIONAL HARUS DI ATAS ===
router.get("/additional", getAdditionalProducts);

// === PRICE (POST + GET) ===
router.post("/calculate-price", calculatePrice);
router.get("/calculate-price", calculatePrice);

// === DETAIL PRODUCT PALING BAWAH ===
router.get("/:id", getProductDetail);

export default router;