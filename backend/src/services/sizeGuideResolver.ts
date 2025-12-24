import { allProducts } from "../../data/productDataLoader";

export const resolveSizeTargetProduct = (target3D: string) => {
  const normalized = target3D.trim().toLowerCase();

  const product = allProducts.find(
    p =>
      p.category === "3D Frame" &&
      p.name.trim().toLowerCase() === normalized
  );

  if (!product) {
    return {
      productId: null,
      fallbackUrl: "/products?category=3D+Frame"
    };
  }

  return {
    productId: product.id,
    fallbackUrl: null
  };
};