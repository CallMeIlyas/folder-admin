export interface ProductSize {
  label: string;
  value: string;
}

export interface ProductVariation {
  label: string;
  value: string;
}

export interface CategoryOption {
  sizes?: ProductSize[];
  variations?: ProductVariation[];
  types?: string[];
  specialCases?: {
    [key: string]: ProductVariation[];
  };
}

export const productOptions: Record<string, CategoryOption> = {
  "3D Frame": {
    sizes: [
      { label: "4R / 10x15cm", value: "4R_10x15cm" },
      { label: "15x15cm", value: "15x15cm" },
      { label: "6R / 15x20cm", value: "6R_15x20cm" },
      { label: "20x20cm", value: "20x20cm" },
      { label: "8R / 20x25cm", value: "8R_20x25cm" },
      { label: "10R / 25x30cm", value: "10R_25x30cm" },
      { label: "12R / 30x40cm", value: "12R_30x40cm" },
      { label: "A2 / 40x55cm", value: "A2_40x55cm" },
      { label: "A1 / 55x80cm", value: "A1_55x80cm" },
      { label: "A0 / 80x110cm", value: "A0_80x110cm" },
    ],
    specialCases: {
      "8R_20x25cm": [
        { label: "Dus kraft + paperbag", value: "dus_kraft_paperbag" },
        { label: "Black Hardbox + paperbag", value: "black_hardbox_paperbag" },
      ],
    },
  },
  
  "2D Frame": {
    sizes: [
      { label: "4R / 10x15cm", value: "4R_10x15cm" },
      { label: "15x15cm", value: "15x15cm" },
      { label: "6R / 15x20cm", value: "6R_15x20cm" },
      { label: "8R / 20x25cm", value: "8R_20x25cm" },
      { label: "12R / 30x40cm", value: "12R_30x40cm" },
    ],
    variations: [
      { label: "Simple shading", value: "simple_shading" },
      { label: "Background katalog", value: "background_katalog" },
      { label: "Bold shading", value: "bold_shading" },
      { label: "AI face + background", value: "ai_face_background" },
    ],
  },
  
  "Additional": {
    types: [
      "Additional Faces Caricature",
      "Background Custom",
      "Biaya tambahan (opsional)",
      "Custom Caricature Pose with Gradation",
      "Caricature 3D by AI",
    ],
  },
  
  "Acrylic Stand": {
    types: [
      "Acrylic Stand 2cm",
      "Acrylic Stand 3mm",
    ],
    sizes: [
      { label: "15cm (1 sisi) - Packing dus kraft + paperbag", value: "15cm_1side" },
      { label: "A4 (2 sisi) - Packing dus lembar + bubblewrap", value: "A4_2side" },
      { label: "A3 (2 sisi) - Packing dus lembar + bubblewrap", value: "A3_2side" },
    ],
  },
  
  "Softcopy Design": {
    types: [
      "Without Background",
      "With Background Catalog",
      "With Background Custom",
    ],
  },
};

export default productOptions;