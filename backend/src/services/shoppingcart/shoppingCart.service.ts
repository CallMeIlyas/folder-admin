import fs from "fs";
import path from "path";
import { ShoppingCartTranslations } from "./shoppingCart.types";

const DATA_PATH = path.resolve("src/data/shoppingcart.i18n.json");

export class ShoppingCartService {

  static getTranslations(lang: string): ShoppingCartTranslations {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);

    if (!parsed[lang]) {
      throw new Error("LANG_NOT_FOUND");
    }

    return parsed[lang];
  }

}