import React, { useEffect, useState } from "react";
import Footer from "../components/home/Footer";
import LocationSection from "../components/location/LocationSection";
import { apiFetch } from "@/utils/api";
import { useTranslation } from "react-i18next";

interface LocationData {
  city: string;
  gmapsLink?: string;
  description: (string | React.ReactNode)[];
  whatsapp: {
    name: string;
    number: string;
  };
  address: {
    name: string;
    lines: string[];
  };
  shippingMethods: {
    courier: string;
    name: string;
  }[];
}

interface LocationResponse {
  title: string;
  icons: {
    location: string;
    whatsapp: string;
    gmaps: string;
  };
  couriers: Record<string, string>;
  locations: LocationData[];
}

const Location: React.FC = () => {
  const { i18n } = useTranslation();
  const [data, setData] = useState<LocationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await apiFetch(
          `/api/content/location?lang=${i18n.language}`
        );
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load location content", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [i18n.language]);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Title */}
        <div className="relative my-8 mb-10 text-center">
          <h1 className="inline-block px-5 text-4xl md:text-5xl font-nataliecaydence relative z-10">
            {data.title}
          </h1>
          <div className="absolute top-1/2 left-0 w-[20%] border-t-4 border-black -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-[20%] border-t-4 border-black -translate-y-1/2"></div>
        </div>

        {/* Locations */}
        {data.locations.map((location, index) => (
          <LocationSection
            key={`${location.city}-${index}`}
            location={location}
            icons={data.icons}
            couriers={data.couriers}
            isLast={index === data.locations.length - 1}
          />
        ))}
      </main>

      <Footer />
    </div>
  );
};

export default Location;