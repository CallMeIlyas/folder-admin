import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const BASE_DIR = path.join(process.cwd(), "uploads/images/bg-catalog");

const folderToCategory: Record<string, string> = {
  "company-office-brand": "Company/Office/Brand", 
  "goverment-police": "Goverment/Police",
  "government-police": "Goverment/Police",
  "oil-construction-ship": "Oil/Construction/Ship",
  "hospital-medical": "Hospital/Medical",
  "graduation-school-children": "Graduation/School/Children",
  "couple-wedding-birthday": "Couple/Wedding/Birthday",
  "travel-place-country-culture": "Travel/Place/Country/Culture",
  "indoor-cafe-kitchen": "Indoor/Cafe/Kitchen",
  "sport": "Sport",
  "others": "Others",
  "pop-up-photos": "Pop Up Photos",
  "plakat": "Acrylic Stand",
};

const BACKGROUND_KEYWORDS: Record<string, string | null> = {
  pns: "company-office-brand",
  bos: "company-office-brand",
  kantor: "company-office-brand",
  kantoran: "company-office-brand",
  gedung: "company-office-brand",
  office: "company-office-brand",
  company: "company-office-brand",
  perusahaan: "company-office-brand",
  karyawan: "company-office-brand",
  staff: "company-office-brand",
  direktur: "company-office-brand",
  manager: "company-office-brand",
  ceo: "company-office-brand",
  brand: "company-office-brand",

  pemerintah: "goverment-police",
  polisi: "goverment-police",
  police: "goverment-police",
  government: "goverment-police",
  goverment: "goverment-police",
  tni: "goverment-police",
  militer: "goverment-police",
  army: "goverment-police",
  tentara: "goverment-police",
  prajurit: "goverment-police",

  kapal: "oil-construction-ship",
  ship: "oil-construction-ship",
  oil: "oil-construction-ship",
  konstruksi: "oil-construction-ship",
  construction: "oil-construction-ship",
  proyek: "oil-construction-ship",
  engineer: "oil-construction-ship",

  dokter: "hospital-medical",
  hospital: "hospital-medical",
  medis: "hospital-medical",
  perawat: "hospital-medical",
  suster: "hospital-medical",
  klinik: "hospital-medical",

  wisuda: "graduation-school-children",
  sekolah: "graduation-school-children",
  anak: "graduation-school-children",
  siswa: "graduation-school-children",
  mahasiswa: "graduation-school-children",

  ultah: "couple-wedding-birthday",
  birthday: "couple-wedding-birthday",
  nikah: "couple-wedding-birthday",
  wedding: "couple-wedding-birthday",
  couple: "couple-wedding-birthday",

  travel: "travel-place-country-culture",
  liburan: "travel-place-country-culture",
  wisata: "travel-place-country-culture",

  cafe: "indoor-cafe-kitchen",
  restoran: "indoor-cafe-kitchen",
  dapur: "indoor-cafe-kitchen",

  gym: "sport",
  olahraga: "sport",

  popup: "pop-up-photos",
  "pop up": "pop-up-photos",

  plakat: "plakat",

  background: null,
  bg: null,
  katalog: null,
};

export const getBackgroundCatalog = (req: Request, res: Response) => {
  const {
    search = "",
    categories = "",
    sort = "all",
    page = "1",
    limit = "16",
  } = req.query;

  let items: any[] = [];

  const folders = fs.readdirSync(BASE_DIR);

  for (const folder of folders) {
    const folderPath = path.join(BASE_DIR, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      if (!/\.(jpg|jpeg|png)$/i.test(file)) continue;

      const name = file.replace(/\.(jpg|jpeg|png)$/i, "");

      items.push({
        id: `${folder}-${name}`,
        name,
        folder,
        category: folderToCategory[folder] || "Others",
        imageUrl: `/api/uploads/images/bg-catalog/${folder}/${file}`,
      });
    }
  }

  // SEARCH
  if (search) {
  const q = decodeURIComponent(String(search))
    .toLowerCase()
    .trim();

  const matchedFolder =
    Object.entries(BACKGROUND_KEYWORDS).find(
      ([key]) => q === key || q.includes(key)
    )?.[1] ?? null;

  items = items.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(q);
    const folderMatch = item.folder.toLowerCase().includes(q);
    const categoryMatch = item.category.toLowerCase().includes(q);

    if (matchedFolder) {
      return item.folder === matchedFolder;
    }

    return nameMatch || folderMatch || categoryMatch;
  });
}

  // CATEGORY FILTER
  if (categories) {
    const cats = String(categories)
      .split(",")
      .map(c => c.toLowerCase());

    items = items.filter(item =>
      cats.some(c =>
        item.category.toLowerCase().includes(c)
      )
    );
  }

  // SORT
  if (sort === "name-asc") {
    items.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sort === "name-desc") {
    items.sort((a, b) => b.name.localeCompare(a.name));
  }

  // PAGINATION
  const pageNum = Math.max(parseInt(page as string), 1);
  const limitNum = Math.max(parseInt(limit as string), 1);

  const totalItems = items.length;
  const totalPages = Math.max(Math.ceil(totalItems / limitNum), 1);

  const start = (pageNum - 1) * limitNum;
  const paginated = items.slice(start, start + limitNum);

  res.json({
    items: paginated,
    totalItems,
    totalPages,
  });
};