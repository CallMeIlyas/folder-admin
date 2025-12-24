import { Router } from "express";
import { getHeroContent } from "../controllers/home/ContentController";
import { getBestSellingContent } from "../controllers/home/BestSellingController";
import { getOrderStepsContent } from "../controllers/home/OrderStepsController";
import { getGalleryContent } from "../controllers/home/GalleryContentController";
import { getProductCardContent } from "../controllers/ourproduct/ProductCardContentController";
import { getProducts } from "../controllers/ourproduct/ProductsController";
import { getSizeGuideContent } from "../controllers/sizeguide/SizeGuideContentController";
import { getBackgroundCatalog } from "../controllers/background/BackgroundCatalogController";

const router = Router();

// home
router.get("/hero", getHeroContent);
router.get("/bestselling", getBestSellingContent);
router.get("/ordersteps", getOrderStepsContent);
router.get("/gallery", getGalleryContent);

// our product
router.get("/productcard", getProductCardContent);
router.get("/products", getProducts);

// size guide
router.get("/size-guide", getSizeGuideContent);

// background catalog
router.get("/background-catalog", getBackgroundCatalog);

export default router;