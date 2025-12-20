import { Router } from "express";
import { getHeroContent } from "../controllers/ContentController";
import { getBestSellingContent } from "../controllers/BestSellingController";
import { getOrderStepsContent } from "../controllers/OrderStepsController";
import { getGalleryContent } from "../controllers/GalleryContentController";
import { getProductCardContent } from "../controllers/ProductCardContentController";
import { getProducts } from "../controllers/ProductsController";

const router = Router();
// home
router.get("/hero", getHeroContent);
router.get("/bestselling", getBestSellingContent);
router.get("/ordersteps", getOrderStepsContent);
router.get("/gallery", getGalleryContent);

// our product
router.get("/productcard", getProductCardContent);
router.get("/products", getProducts);


export default router;