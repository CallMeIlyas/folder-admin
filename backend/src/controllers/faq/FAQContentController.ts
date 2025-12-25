import fs from "fs";
import path from "path";
import { Request, Response } from "express";

interface RawFAQ {
  id: number;
  question: string;
  answer?: string;
  text?: string;
  listItems?: string[];
  links?: { text: string; url?: string; to?: string }[];
  linkText?: string;
  linkUrl?: string;
  linkTo?: string;
  isCustom?: boolean;
}

export const getFAQContent = (req: Request, res: Response) => {
  try {
    const lang = (req.query.lang as string) || "id";
    const view = (req.query.view as string) || "desktop";

    const filePath = path.join(
      process.cwd(),
      "content",
      "locales",
      "faq.json"
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "FAQ content file not found" });
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    if (!data[lang]) {
      return res.status(404).json({ message: "Language not found" });
    }

    const source = data[lang];

    const normalizeQuestion = (q: RawFAQ) => {
      const blocks: any[] = [];

      if (q.answer) {
        blocks.push({
          type: "html",
          content: q.answer
        });
      }

      if (q.text) {
        blocks.push({
          type: "text",
          content: q.text
        });
      }

      if (Array.isArray(q.listItems)) {
        blocks.push({
          type: "list",
          items: q.listItems
        });
      }

      if (Array.isArray(q.links)) {
        q.links.forEach(link => {
          blocks.push(
            link.url
              ? { type: "external_link", text: link.text, url: link.url }
              : { type: "link", text: link.text, to: link.to }
          );
        });
      }

      if (q.linkText && q.linkUrl) {
        blocks.push({
          type: "external_link",
          text: q.linkText,
          url: q.linkUrl
        });
      }

      if (q.linkText && q.linkTo) {
        blocks.push({
          type: "link",
          text: q.linkText,
          to: q.linkTo
        });
      }

      return {
        id: q.id,
        question: q.question,
        answer: blocks,
        isCustom: q.isCustom || false
      };
    };

    const normalizedQuestions = source.questions.map(normalizeQuestion);

    res.json({
      metadata: {
        title: source.metadata.title,
        description:
          view === "mobile"
            ? source.metadata.mobileDescription
            : source.metadata.desktopDescription
      },
      questions: normalizedQuestions
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load FAQ content" });
  }
};