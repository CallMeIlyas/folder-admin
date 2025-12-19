import { Request, Response } from "express";
import { readJson } from "../../utils/readJson";

const SUPPORTED_LANGS = ["en", "id"] as const;
type Lang = typeof SUPPORTED_LANGS[number];

export const getHeroContent = (req: Request, res: Response) => {
  const queryLang = req.query.lang as string;
  const lang: Lang = SUPPORTED_LANGS.includes(queryLang as Lang)
    ? (queryLang as Lang)
    : "en";

  let heroJson;

  try {
    heroJson = readJson(
      `content/locales/${lang}/home/hero.json`
    );
  } catch {
    heroJson = readJson(
      `content/locales/en/home/hero.json`
    );
  }

  res.json({
    logoUrl: "/api/uploads/images/logo/caricature-3d.png",
    imageUrl: "/api/uploads/images/karya/pak-andre.jpg",
    description: heroJson.description
  });
};