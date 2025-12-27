import fs from "fs";
import path from "path";
import { Request, Response } from "express";

export const getShoppingCartContent = (req: Request, res: Response) => {
  try {
    const lang = (req.query.lang as string) || "id";

    const filePath = path.join(
      process.cwd(),
      "content",
      "locales",
      "shoppingcart.json"
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Shopping cart content file not found"
      });
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    if (!data[lang]) {
      return res.status(404).json({
        success: false,
        message: "Language not found"
      });
    }

    const source = data[lang];

    res.json({
      success: true,
      data: {
        shoppingCart: source.shoppingCart,
        shipping: source.shipping,
        paymentMethods: source.paymentMethods,
        assets: source.assets
      }
    });
  } catch (err) {
    console.error("ShoppingCartController error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to load shopping cart data"
    });
  }
};