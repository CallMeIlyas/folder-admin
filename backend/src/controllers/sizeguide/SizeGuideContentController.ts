import { Request, Response } from "express";
import { readJson } from "../../../utils/readJson";
import { resolveSizeTargetProduct } from "../../services/sizeGuideResolver";

const SUPPORTED_LANGS = ["en", "id"] as const;
type Lang = typeof SUPPORTED_LANGS[number];

export const getSizeGuideContent = (req: Request, res: Response) => {
  const queryLang = req.query.lang as string;
  const lang: Lang = SUPPORTED_LANGS.includes(queryLang as Lang)
    ? (queryLang as Lang)
    : "id";

  let sizeJson;

  try {
    sizeJson = readJson(`content/locales/${lang}/sizeguide/size.json`);
  } catch {
    sizeJson = readJson(`content/locales/id/sizeguide/size.json`);
  }
  
  const LANG_FOLDER_MAP: Record<Lang, string> = {
  en: "ENGLISH",
  id: "INDONESIA"
};

const folder = LANG_FOLDER_MAP[lang];

const sizeItems = [
  { size: "4R", target3D: "4R", image: `/api/uploads/images/size-guide/${folder}/4R.png` },
  { size: "15CM", target3D: "15X15CM", image: `/api/uploads/images/size-guide/${folder}/15CM.png` },
  { size: "6R", target3D: "6R", image: `/api/uploads/images/size-guide/${folder}/6R.png` },
  { size: "20CM", target3D: "20X20CM", image: `/api/uploads/images/size-guide/${folder}/20CM.png` },
  { size: "8R", target3D: "8R", image: `/api/uploads/images/size-guide/${folder}/8R.png` },
  { size: "10R", target3D: "10R", image: `/api/uploads/images/size-guide/${folder}/10R.png` },
  { size: "12R", target3D: "12R", image: `/api/uploads/images/size-guide/${folder}/12R.png` },
  { size: "A2", target3D: "A2-40X55CM", image: `/api/uploads/images/size-guide/${folder}/A2.png` },
  { size: "A1", target3D: "A1-55X80CM", image: `/api/uploads/images/size-guide/${folder}/A1.png` },
  { size: "A0", target3D: "A0-80X110CM", image: `/api/uploads/images/size-guide/${folder}/A0.png` }
].map(item => {
  const target = resolveSizeTargetProduct(item.target3D);
  return {
    ...item,
    productId: target.productId,
    fallbackUrl: target.fallbackUrl
  };
});

  res.json({
    titles: sizeJson,

    images: {
      frame: {
        base: "/api/uploads/images/size-guide/main-image1.png",
        overlay: "/api/uploads/images/size-guide/main-image2.png",
        comparison: "/api/uploads/images/size-guide/main-image3.png"
      },

      onHand: [
        "/api/uploads/images/size-guide/1.png",
        "/api/uploads/images/size-guide/2.png",
        "/api/uploads/images/size-guide/3.png",
        "/api/uploads/images/size-guide/4.png",
        "/api/uploads/images/size-guide/5.png",
        "/api/uploads/images/size-guide/6.png"
      ],

      sizes: sizeItems,

      extra: {
        portofolio: "/api/uploads/images/size-guide/A.png",
        cartoon: "/api/uploads/images/size-guide/B.png",
        faceWithCartoonBody: "/api/uploads/images/size-guide/C.png"
      }
    }
  });
};