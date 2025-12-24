import { Request, Response } from "express";
import { readJson } from "../../../utils/readJson";

const SUPPORTED_LANGS = ["en", "id"] as const;
type Lang = typeof SUPPORTED_LANGS[number];

export const getOrderStepsContent = (req: Request, res: Response) => {
  const queryLang = req.query.lang as string;

  const lang: Lang = SUPPORTED_LANGS.includes(queryLang as Lang)
    ? (queryLang as Lang)
    : "en";

  let data;

  try {
    data = readJson(`content/locales/${lang}/home/orderSteps.json`);
  } catch {
    data = readJson(`content/locales/en/home/orderSteps.json`);
  }

  res.json({
    title: data.title,
    steps: {
      faces: {
        text: data.steps.faces,
        icon: "/api/uploads/images/Icons/people.png"
      },
      frames: {
        text: data.steps.frames,
        icon: "/api/uploads/images/Icons/frame.png"
      },
      size: {
        text: data.steps.size,
        icon: "/api/uploads/images/Icons/size.png"
      },
      city: {
        text: data.steps.city,
        icon: "/api/uploads/images/Icons/location.png"
      },
      deadline: {
        text: data.steps.deadline,
        icon: "/api/uploads/images/Icons/calendar.png"
      },
      admin: {
        text: data.steps.admin,
        icon: "/api/uploads/images/Icons/whatsapp.png"
      }
    },
    modal: data.modal
  });
};