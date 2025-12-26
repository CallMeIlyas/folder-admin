import fs from "fs";
import path from "path";
import { Request, Response } from "express";

export const getContactContent = (req: Request, res: Response) => {
  try {
    const lang = (req.query.lang as string) || "id";

    const filePath = path.join(
      process.cwd(),
      "content",
      "locales",
      "contact.json"
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Contact content not found" });
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    if (!data[lang]) {
      return res.status(404).json({ message: "Language not found" });
    }

    res.json(data[lang]);
  } catch {
    res.status(500).json({ message: "Failed to load contact content" });
  }
};