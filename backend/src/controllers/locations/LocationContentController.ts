import { Request, Response } from "express";
import { readJson } from "../../../utils/readJson";

const SUPPORTED_LANGS = ["id", "en"] as const;
type Lang = typeof SUPPORTED_LANGS[number];

export const getLocationContent = (req: Request, res: Response) => {
  const queryLang = req.query.lang as string;
  const lang: Lang = SUPPORTED_LANGS.includes(queryLang as Lang)
    ? (queryLang as Lang)
    : "id";

  let json;

  try {
    json = readJson(`content/locales/${lang}/location/location.json`);
  } catch {
    json = readJson(`content/locales/id/location/location.json`);
  }

  res.json({
    title: json.title,

    labels: {
      shippingFrom: json.shippingFrom,
      courierMethods: json.courierMethods
    },

    icons: {
      location: "/api/uploads/images/Icons/location.png",
      whatsapp: "/api/uploads/images/Icons/whatsapp.png",
      gmaps: "/api/uploads/images/Icons/GMAPS.png"
    },

    couriers: {
      JNE: "/api/uploads/images/Icons/address/JNE.png",
      GOJEK: "/api/uploads/images/Icons/address/GOJEK.png",
      GRAB: "/api/uploads/images/Icons/address/GRAB.png",
      PAXEL: "/api/uploads/images/Icons/address/PAXEL.png",
      RAYSPEED: "/api/uploads/images/Icons/address/RAYSPEED.png"
    },

    locations: [
      {
        city: "Bogor",
        shippingLabel: json.fromBogor,
        gmapsLink: "https://share.google/3NK3xtA32ThyT5hxH",
        description: [
          json.bogor.desc1,
          json.bogor.desc2,
          json.bogor.desc3
        ],
        whatsapp: {
          name: "Claresta",
          number: "6281380340307"
        },
        address: {
          name: "Little Amora Karikatur Pop Up Frame",
          lines: [
            "Bogor Park Residence no. D27",
            "Jl. R. E. Soemintadiredja, Pamoyanan",
            "Bogor Selatan, Kota Bogor, 16136"
          ]
        },
        shippingMethods: [
          { courier: "JNE", name: "Regular, YES (Yakin Esok Sampai), Kargo" },
          { courier: "GOJEK", name: "Go-send Instant, Bike/Car" },
          { courier: "GRAB", name: "Grabbike Instant, Bike/Car" },
          { courier: "PAXEL", name: "Sameday, Instant" },
          { courier: "RAYSPEED", name: "Regular, Express" }
        ]
      },
      {
        city: "Jakarta",
        shippingLabel: json.fromJakarta,
        gmapsLink: "https://share.google/12ERghjGjZ2vg6dbK",
        description: [
          json.jakarta.desc1,
          json.jakarta.desc2,
          json.jakarta.desc3
        ],
        whatsapp: {
          name: "Benyamin",
          number: "62895601416518"
        },
        address: {
          name: "WTC Mangga Dua, Sapphire Auto",
          lines: [
            "Bursa Mobil, floor 3A block 63-65",
            "Jl. Mangga Dua Raya No.8",
            "Pademangan, Jakarta Utara, 14430"
          ]
        },
        shippingMethods: [
          { courier: "GOJEK", name: "Go-send Instant, Bike" },
          { courier: "GRAB", name: "Grabbike Instant, Bike" }
        ]
      }
    ]
  });
};