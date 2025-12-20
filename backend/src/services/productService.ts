import { allProducts } from "../../data/productDataLoader";
import { getProductDescription } from "../../data/productDescriptions";
import { getPrice } from "../../utils/getPrice";

export const productService = {
  getProductDetail(category: string, name: string) {
    return getProductDescription(category, name);
  },

  getBasePrice(productId: string) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return 0;
    return getPrice(product.category, product.name);
  },

  isBestSelling(productId: string) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) {
    return { isBestSelling: false };
  }

  const name = product.name.toLowerCase();
  const category = product.category.toLowerCase();

  // === RULE LAMA YANG SAH ===
  if (
    (category.includes("3d") && (name.includes("12r") || name.includes("10r"))) ||
    (category.includes("2d") && name.includes("8r"))
  ) {
    return {
      isBestSelling: true,
      label: "Paling populer untuk ukuran"
    };
  }

  return { isBestSelling: false };
},

  calculatePrice(productId: string, options: any) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return 0;

    let price = getPrice(product.category, product.name, options.frameSize);

    if (options.shading) price += getPrice("Additional", options.shading);
    if (options.faceCount) price += getPrice("Additional", options.faceCount);
    if (options.expressOption) price += getPrice("Additional", options.expressOption);
    if (options.packagingOption) price += getPrice("Additional", options.packagingOption);

    return price;
  },
};