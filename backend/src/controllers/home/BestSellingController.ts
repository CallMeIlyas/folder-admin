import { Request, Response } from "express";
import { readJson } from "../../../utils/readJson";

const SUPPORTED_LANGS = ["en", "id"] as const;
type Lang = typeof SUPPORTED_LANGS[number];

export const getBestSellingContent = (req: Request, res: Response) => {
  const queryLang = req.query.lang as string;

  const lang: Lang = SUPPORTED_LANGS.includes(queryLang as Lang)
    ? (queryLang as Lang)
    : "en";

  let data;

  try {
    data = readJson(`content/locales/${lang}/home/bestSelling.json`);
  } catch {
    data = readJson(`content/locales/en/home/bestSelling.json`);
  }

  res.json({
    title: data.title || "",
    items: data.items || []
  });
};