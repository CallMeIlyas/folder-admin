import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Footer from "../components/home/Footer";
import { apiFetch, apiAsset } from "@/utils/api";

interface DescriptionItem {
  type: string;
  content: string;
}

interface ContactItem {
  id: number;
  type: string;
  name: string;
  value: string;
  url: string;
  icon: string;
}

interface ContactResponse {
  metadata: {
    title: string;
    description: DescriptionItem[];
  };
  contacts: ContactItem[];
}

export default function ContactUs() {
  const { i18n } = useTranslation();
  const lang = i18n.language || "id";

  const [data, setData] = useState<ContactResponse | null>(null);

  useEffect(() => {
    apiFetch(`/api/content/contact?lang=${lang}`)
      .then(res => res.json())
      .then(setData)
      .catch(() => setData(null));
  }, [lang]);

  if (!data || !Array.isArray(data.contacts)) {
    return <div className="py-20 text-center">Loading...</div>;
  }

  const { metadata, contacts } = data;

  return (
    <div className="min-h-screen flex flex-col">
      {/* TITLE */}
      <div className="relative my-6 md:my-8 text-center">
        <h1 className="inline-block px-4 md:px-5 text-xl md:text-5xl font-nataliecaydence relative z-10">
          {metadata.title}
        </h1>
        <div className="absolute top-1/2 left-0 w-[15%] md:w-[20%] border-t-2 md:border-t-4 border-black -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-0 w-[15%] md:w-[20%] border-t-2 md:border-t-4 border-black -translate-y-1/2"></div>
      </div>

      {/* CONTACT LIST */}
      <main className="flex flex-col items-center gap-3 md:gap-4 px-4 pb-6">
        {contacts.map(item => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full max-w-[320px] md:max-w-[420px] px-4 md:px-5 py-2 border border-black rounded-full bg-white shadow-sm transition-transform hover:scale-105"
          >
            <img
              src={apiAsset(item.icon)}
              alt={item.name}
              className="w-[55px] md:w-[80px] mr-3 md:mr-4"
            />
            <div className="flex flex-col">
              <span className="font-poppinsBold text-xs md:text-[13px]">
                {item.name}
              </span>
              <span className="font-poppinsRegular text-xs md:text-sm">
                {item.value}
              </span>
            </div>
          </a>
        ))}
      </main>

      {/* DESCRIPTION */}
      <div className="font-poppinsRegular text-sm md:text-[15px] text-center leading-relaxed px-6 max-w-[700px] mx-auto mb-20">
        {Array.isArray(metadata.description) &&
          metadata.description.map((item, i) => (
            <p
              key={i}
              className="mb-4"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          ))}
      </div>

      <Footer />
    </div>
  );
}