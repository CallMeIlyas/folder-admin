import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "../components/home/Footer";
import FAQItem from "../components/faq/FAQItem";
import { apiFetch } from "@/utils/api";

interface FAQBlock {
  type?: string;
  content?: string;
  items?: string[];
  text?: string;
  to?: string;
  url?: string;
}

interface FAQItemData {
  id: number;
  question: string;
  answer: string | FAQBlock | (string | FAQBlock)[];
  isCustom?: boolean;
}

interface FAQResponse {
  metadata: {
    title: string;
    description: string[];
  };
  questions: FAQItemData[];
}

export default function FAQPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language || "id";

  const [faqData, setFaqData] = useState<FAQResponse | null>(null);

  useEffect(() => {
    apiFetch(`/api/content/faq?lang=${lang}`)
      .then(res => res.json())
      .then(setFaqData)
      .catch(() => setFaqData(null));
  }, [lang]);

  if (!faqData) return null;

  const { metadata, questions } = faqData;

  const renderAnswer = (answer: FAQItemData["answer"]) => {
    const blocks = Array.isArray(answer) ? answer : [answer];

    return blocks.map((block, i) => {
      if (typeof block === "string") {
        return <p key={i} className="mb-1">{block}</p>;
      }

      if (block.type === "html") {
        return (
          <p
            key={i}
            className="mb-1"
            dangerouslySetInnerHTML={{ __html: block.content || "" }}
          />
        );
      }

      if (block.type === "list") {
        return (
          <ul key={i} className="list-disc pl-4 text-xs md:text-[13px] mb-3">
            {block.items?.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        );
      }

      if (block.type === "link") {
        return (
          <Link
            key={i}
            to={block.to || "#"}
            className="block mx-auto mt-3 w-fit px-6 md:px-10 py-2 md:py-2.5 bg-[#f5d7d6] text-[#333] rounded-full font-bold text-xs md:text-sm text-center transition-all hover:bg-[#e8b9b8] hover:scale-105"
          >
            {block.text}
          </Link>
        );
      }

      if (block.type === "external_link") {
        const isWhatsapp = block.url?.includes("wa.me");

        return (
          <a
            key={i}
            href={block.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              block mx-auto mt-3 w-fit px-6 md:px-10 py-2 md:py-2.5
              rounded-full font-bold text-xs md:text-sm text-center
              transition-all hover:scale-105
              ${isWhatsapp 
                ? "bg-[#d69ca0] text-white hover:bg-[#9b4a51]" 
                : "bg-[#f5d7d6] text-[#333] hover:bg-[#e8b9b8]"
              }
            `}
          >
            {block.text}
          </a>
        );
      }

      return null;
    });
  };

  const normalFaq = questions.filter(q => !q.isCustom);
  const customFaq = questions.find(q => q.isCustom);

  return (
    <div className="min-h-screen flex flex-col">
      {/* TITLE */}
      <div className="relative my-6 md:my-8 text-center">
        <h1 className="inline-block font-nataliecaydence relative z-10 px-5 text-lg md:text-5xl max-w-[800px]">
          {metadata.title}
        </h1>
        <div className="absolute top-1/2 left-0 w-[20%] border-t-2 md:border-t-4 border-black -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-0 w-[20%] border-t-2 md:border-t-4 border-black -translate-y-1/2"></div>
      </div>

      {/* DESCRIPTION */}
      <div className="font-poppinsRegular text-sm md:text-[15px] max-w-[680px] mx-auto mb-4 md:mb-3 px-4 md:px-5 leading-relaxed md:leading-[1.5] whitespace-nowrap md:overflow-hidden md:text-ellipsis">
        {metadata.description.map((line, i) => (
          <p key={i} className={i < metadata.description.length - 1 ? "mb-1" : ""}>
            {line}
          </p>
        ))}
      </div>

      {/* FAQ GRID */}
      <main className="max-w-[700px] mx-auto py-6 md:py-12 px-4 md:px-5 font-sans flex-1">
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 font-poppinsRegular">
          {normalFaq.map(faq => (
            <div 
              key={faq.id} 
              className="faq-item-wrapper min-h-[90px] md:min-h-[110px] flex flex-col"
            >
              <div className="flex-1 flex flex-col">
                <FAQItem
                  question={faq.question}
                  answer={renderAnswer(faq.answer)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* CUSTOM FAQ */}
        {customFaq && (
          <div className="max-w-[430px] mx-auto my-6 md:my-8 p-4 md:p-5 font-sans">
            <FAQItem
              question={customFaq.question}
              answer={renderAnswer(customFaq.answer)}
              isCustom
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}