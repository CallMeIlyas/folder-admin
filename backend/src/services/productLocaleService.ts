import { readJson } from "../../utils/readJson";

export const productLocaleService = {
  getProductLocale(lang: string = "id") {
    return readJson(
      `content/locales/${lang}/product/product.json`
    );
  }
};