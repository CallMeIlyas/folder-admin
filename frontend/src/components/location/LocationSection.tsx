import React from "react";
import { useTranslation } from "react-i18next";
import { apiAsset } from "@/utils/api";

interface LocationSectionProps {
  location: {
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
    shippingMethods: (string | { courier: string; name: string })[];
  };
  icons: {
    location: string;
    whatsapp: string;
    gmaps: string;
  };
  couriers: Record<string, string>;
  isLast: boolean;
}

const logoSizeMap: Record<
  string,
  { width: string; height: string; translate?: string }
> = {
  JNE: { 
    width: "w-[80px] md:w-[110px]", 
    height: "h-auto", 
    translate: "translate-x-[20px] md:translate-x-[41px]" 
  },
  GOJEK: { 
    width: "w-[80px] md:w-[110px]", 
    height: "h-auto", 
    translate: "translate-x-[15px] md:translate-x-[28px]" 
  },
  GRAB: { 
    width: "w-[80px] md:w-[110px]", 
    height: "h-auto", 
    translate: "translate-x-[20px] md:translate-x-[43px]" 
  },
  PAXEL: { 
    width: "w-[80px] md:w-[110px]", 
    height: "h-auto", 
    translate: "translate-x-[15px] md:translate-x-[29px]" 
  },
  RAYSPEED: { 
    width: "w-[120px] md:w-[150px]", 
    height: "h-auto", 
    translate: "translate-x-[5px] md:translate-x-[8px]" 
  },
};

// Mobile Layout Component
const MobileLayout: React.FC<{
  location: LocationSectionProps['location'];
  icons: LocationSectionProps['icons'];
  couriers: LocationSectionProps['couriers'];
  isLast: boolean;
}> = ({ location, icons, couriers, isLast }) => {
  const { t } = useTranslation();

  return (
    <div className={`mx-4 ${!isLast ? "mb-12 pb-6" : "mb-6"}`}>
      {/*  Location Info - Mobile */}
      <div className="flex items-start gap-2">
        <img
          src={apiAsset(icons.location)}
          alt="Location"
          className="w-[50px] h-auto -mt-2 translate-x-1"
        />
        <div className="mt-0 flex-1">
          {/* Dynamic Language */}
          <div className="font-poppinsRegular text-base">
            {t("location.shippingFrom")}{" "}
            <span className="font-poppinsRegular font-semibold">
              {location.city}
            </span>
          </div>

          {/*  Descriptions */}
          {location.description.map((line, index) => (
            <p key={index} className="text-[13px] w-[260px] font-poppinsRegular my-[1px] leading-snug">
              {line}
            </p>
          ))}
        </div>
      </div>

      {/*  Contact & Address - Mobile */}
      <div className="mt-3 w-full">
        <div className="text-left">
          {/* WhatsApp Contact */}
          <div className="font-poppinsRegular flex items-center gap-2 translate-x-1.5 mb-3">
            <img
              src={apiAsset(icons.whatsapp)}
              alt="WhatsApp"
              className="w-[43px] h-auto"
            />
            <span className="text-[14px]">
              {location.whatsapp.name} {location.whatsapp.number}
            </span>
          </div>

          {/* Address Block */}
          <div className="flex flex-col items-start gap-2 translate-x-10">
            <a
              href={location.gmapsLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start"
            >
              <img
                src={apiAsset(icons.gmaps)}
                alt="Google Maps"
                className="w-28 h-auto cursor-pointer transition-transform duration-200 hover:scale-105"
              />
            </a>

            <div className="mt-1 translate-x-5">
              <span className="font-poppinsSemiBold text-xs">{location.address.name}</span>
              {location.address.lines.map((line, index) => (
                <p key={index} className="font-poppinsRegular text-[13px]">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/*  Shipping Methods - Mobile */}
      <div className="border border-gray-600 rounded-xl p-2 mt-4 mx-auto">
        {location.shippingMethods.map((method, index) => {
          const courierName =
            typeof method === "string"
              ? method.split(" ")[0].toUpperCase()
              : method.courier.toUpperCase();

          const logoSrc = couriers[courierName];
          const logoSize = {
            JNE: { width: "w-[70px]", translate: "translate-x-[30px]" },
            GOJEK: { width: "w-[70px]", translate: "translate-x-[21px]" },
            GRAB: { width: "w-[70px]", translate: "translate-x-[29px]" },
            PAXEL: { width: "w-[70px]", translate: "translate-x-[18px]" },
            RAYSPEED: { width: "w-[100px]", translate: "translate-x-[3px]" }
          }[courierName] || { width: "w-16", translate: "" };

          return (
            <div
              key={index}
              className="flex items-center gap-1 mb-1 last:mb-0 min-h-[30px]"
            >
              <div className="flex items-center justify-center min-w-[80px] h-[30px]">
                {logoSrc && (
                  <img
                    src={apiAsset(logoSrc)}
                    alt={courierName}
                    className={`${logoSize.width} h-auto ${logoSize.translate}`}
                  />
                )}
              </div>
              <span
                className={`font-poppinsRegular text-[11.5px] leading-[1] block flex-1 ${
                  typeof method === "object" && method.name.includes("Regular, Express")
                    ? "-translate-x-1"
                    : "translate-x-4"
                }`}
              >
                {typeof method === "object" ? method.name : method}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Desktop Layout Component
const DesktopLayout: React.FC<{
  location: LocationSectionProps['location'];
  icons: LocationSectionProps['icons'];
  couriers: LocationSectionProps['couriers'];
  isLast: boolean;
}> = ({ location, icons, couriers, isLast }) => {
  const { t } = useTranslation();

  return (
    <div className={`mx-16 ${!isLast ? "pb-10" : "mb-8"}`}>
      {/*  Location Info */}
      <div className="flex items-start gap-3">
        <img
          src={apiAsset(icons.location)}
          alt="Location"
          className="w-[80px] h-auto -mt-5 translate-x-4"
        />
        <div className="mt-1">
          {/*  Dynamic Language */}
          <div className="font-poppinsRegular text-2xl">
            {t("location.shippingFrom")}{" "}
            <span className="font-poppinsRegular font-semibold">
              {location.city}
            </span>
          </div>

          {/*  Descriptions */}
          {location.description.map((line, index) => (
            <p key={index} className="text-lg my-[1px] leading-snug">
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Contact & Address */}
      <div className="mt-3 mx-auto w-full max-w-2xl">
        <div className="text-left">
          {/* WhatsApp Contact */}
          <div className="font-poppinsRegular flex items-center gap-2 translate-y-6 translate-x-4 mb-5 ml-32">
            <img
              src={apiAsset(icons.whatsapp)}
              alt="WhatsApp"
              className="w-[50px] h-auto translate-x-3"
            />
            <span className="text-lg">
              {location.whatsapp.name} {location.whatsapp.number}
            </span>
          </div>

          {/* Address Block */}
          <div className="flex flex-row items-start gap-3">
            <a
              href={location.gmapsLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="self-auto"
            >
              <img
                src={apiAsset(icons.gmaps)}
                alt="Google Maps"
                className="w-40 h-auto cursor-pointer transition-transform duration-200 hover:scale-105"
              />
            </a>

            <div className="mt-0">
              <span className="font-poppinsSemiBold text-base">{location.address.name}</span>
              {location.address.lines.map((line, index) => (
                <p key={index} className="font-poppinsRegular text-lg">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/*  Shipping Methods */}
      <div
        className={`border border-gray-600 rounded-[30px] p-4 max-w-xl mt-8 mx-auto 
          ${isLast ? "mb-32" : ""}
        `}
      >
        {location.shippingMethods.map((method, index) => {
          const courierName =
            typeof method === "string"
              ? method.split(" ")[0].toUpperCase()
              : method.courier.toUpperCase();

          const logoSrc = couriers[courierName];
          const logoSize = logoSizeMap[courierName] || {
            width: "w-20 md:w-24",
            height: "h-auto",
            translate: "",
          };

          return (
            <div
              key={index}
              className="flex items-center gap-3 mb-[6px] last:mb-0 min-h-[45px]"
            >
              <div className="flex items-center justify-center min-w-[130px] h-[45px]">
                {logoSrc && (
                  <img
                    src={apiAsset(logoSrc)}
                    alt={courierName}
                    className={`${logoSize.width} ${logoSize.height} ${logoSize.translate || ""}`}
                  />
                )}
              </div>
              <span
                className={`font-poppinsRegular text-sm leading-[1] block ${
                  typeof method === "object" && method.name.includes("Regular, Express")
                    ? "translate-x-5"
                    : "translate-x-10"
                }`}
              >
                {typeof method === "object" ? method.name : method}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Component
const LocationSection: React.FC<LocationSectionProps> = ({ 
  location, 
  icons, 
  couriers, 
  isLast 
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  return isMobile ? 
    <MobileLayout 
      location={location} 
      icons={icons} 
      couriers={couriers} 
      isLast={isLast} 
    /> : 
    <DesktopLayout 
      location={location} 
      icons={icons} 
      couriers={couriers} 
      isLast={isLast} 
    />;
};

export default LocationSection;