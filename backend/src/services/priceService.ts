import { productService } from "./productService";

export const priceService = {
  calculate(productId: string, options: any) {
    return productService.calculatePrice(productId, options);
  }
};