import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Footer from "../components/home/Footer";
import { apiFetch } from "@/utils/api";

interface TOSHtmlItem {
  type: "html";
  content: string;
}

type TOSItem = string | TOSHtmlItem;

interface TOSSection {
  id: number;
  title: string;
  subtitle: string;
  items: TOSItem[];
}

interface TOSResponse {
  metadata: {
    title: string;
    description: string[];
  };
  sections: TOSSection[];
}

export default function TermsOfService() {
  const { i18n } = useTranslation();
  const lang = i18n.language || "id";

  const [tosData, setTosData] = useState<TOSResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/content/tos?lang=${lang}`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.sections)) {
          setTosData(data);
        } else {
          setTosData(null);
        }
      })
      .catch(() => setTosData(null))
      .finally(() => setLoading(false));
  }, [lang]);

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (!tosData) {
    return <div className="text-center py-20">Content not available</div>;
  }

  const { metadata, sections } = tosData;

  const renderItem = (item: TOSItem, index: number) => {
    if (typeof item === "string") {
      return (
        <li
          key={index}
          className="leading-relaxed text-sm md:text-[16px] text-justify mb-3 md:mb-2"
        >
          {item}
        </li>
      );
    }

    return (
      <li
        key={index}
        className="leading-relaxed text-sm md:text-[16px] text-justify mb-3 md:mb-2"
      >
        <div dangerouslySetInnerHTML={{ __html: item.content }} />
      </li>
    );
  };

  const renderSection = (section: TOSSection, mobile: boolean) => (
    <section key={section.id} className="-mb-2 md:-mb-[60px] last:mb-0">
      <div className="relative h-px my-6 md:my-10">
        <div
          className={`absolute top-2 ${
            mobile ? "left-4 translate-y-4" : "left-9 translate-y-7"
          } h-full w-[20%] md:w-[15%] border-t-2 border-black`}
        />
      </div>

      <div
        className={`flex flex-col gap-4 pb-4 ${
          mobile ? "" : "md:grid md:grid-cols-[250px,1fr] md:gap-6 md:pb-6"
        }`}
      >
        <div className={`font-semibold ${mobile ? "pl-4" : "pl-16"} mb-2`}>
          <p
            className={`font-poppinsSemiBold text-xs md:text-[13px] m-0 text-black ${
              mobile ? "" : "-ml-7"
            }`}
          >
            {section.subtitle}
          </p>
          <h3
            className={`font-poppinsBold m-0 text-sm md:text-[16px] ${
              mobile ? "" : "-ml-7"
            }`}
          >
            {section.title}
          </h3>
        </div>

        <ul
          className={`font-poppinsRegular m-0 list-disc pl-5 ${
            mobile ? "" : "md:-ml-[3%]"
          }`}
        >
          {section.items.map(renderItem)}
        </ul>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* MOBILE */}
      <div className="block md:hidden">
        <div className="relative my-6 -mb-2 text-center">
          <h1 className="inline-block px-4 text-xl font-nataliecaydence relative z-10">
            {metadata.title}
          </h1>
          <div className="absolute top-1/2 left-0 w-[15%] border-t-2 border-black -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-[15%] border-t-2 border-black -translate-y-1/2" />
        </div>

        <main className="container mx-auto px-4 flex-grow">
          <section className="flex flex-col gap-0">
            {sections.map(section => renderSection(section, true))}
          </section>
        </main>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block">
        <div className="relative my-8 -mb-1 text-center">
          <h1 className="inline-block px-5 text-4xl md:text-5xl font-nataliecaydence relative z-10">
            {metadata.title}
          </h1>
          <div className="absolute top-1/2 left-0 w-[20%] border-t-4 border-black -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-[20%] border-t-4 border-black -translate-y-1/2" />
        </div>

        <main className="container mx-auto px-4 py-8 flex-grow">
          <section className="flex flex-col gap-0">
            {sections.map(section => renderSection(section, false))}
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}