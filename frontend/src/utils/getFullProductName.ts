export const getFullProductName = (category: string, size?: string, name?: string): string => {
  const sizeMap: Record<string, string> = {
    "4R": "10x15cm",
    "6R": "15x20cm",
    "8R": "20x25cm",
    "10R": "25x30cm",
    "12R": "30x40cm",
    "15CM": "15x15cm",
    "20CM": "20x20cm",
    "A2": "40x55cm",
    "A1": "55x80cm",
    "A0": "80x110cm",
  };

  // Jika size kosong atau "Custom", coba ambil dari nama produk
  if (!size || size.toLowerCase() === "custom") {
    const detected = name?.match(/\b(\d{1,2}R|A\d|CM)\b/i)?.[0];
    size = detected || "";
  }

  // Kalau tetap kosong → tampilkan hanya kategori
  if (!size) return category;

  const formattedSize = size.toUpperCase();
  const dimension = sizeMap[formattedSize];

  return dimension
    ? `${category} ${formattedSize} / ${dimension}`
    : `${category} ${formattedSize}`;
};