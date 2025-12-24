import { Request, Response } from "express";
import { readJson } from "../../../utils/readJson";

const SUPPORTED_LANGS = ["en", "id"] as const;
type Lang = typeof SUPPORTED_LANGS[number];

export const getGalleryContent = (req: Request, res: Response) => {
  const queryLang = req.query.lang as string;
  
  const lang: Lang = SUPPORTED_LANGS.includes(queryLang as Lang) 
    ? (queryLang as Lang) 
    : "en";

  let data;
  
  try {
    data = readJson(`content/locales/${lang}/home/gallery.json`);
  } catch {
    data = readJson("content/locales/en/home/gallery.json");
  }

  const response = {
    title: data.title,
    social: {
      instagram: {
        label: data.social.instagram.label,
        icon: "/api/uploads/images/icons/ig.png",
        url: data.social.instagram.url
      },
      tiktok: {
        label: data.social.tiktok.label,
        icon: "/api/uploads/images/icons/tiktok.png",
        url: data.social.tiktok.url
      }
    },
    videos: data.videos.map((v: any) => ({
      id: v.id,
      src: v.src
    })),
    photos: data.photos.map((p: any) => ({
      id: p.id,
      image: p.image,
      label: p.label
    }))
  };

  res.json(response);
};