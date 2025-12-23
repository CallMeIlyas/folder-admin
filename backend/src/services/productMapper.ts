export const productMapper = {
  toProductDetail(data: ProductDetailInput, language: 'id' | 'en' = 'id') {
    const { uiText, category, name } = data;
    const categoryLower = category.toLowerCase();
    const nameLower = name.toLowerCase();

    let options: any = {};

    // Text translations for options based on language
    const optionTranslations = {
      packaging: {
        id: {
          duskraft: "Dus Kraft + Paperbag",
          hardbox: "Black Hardbox + Paperbag"
        },
        en: {
          duskraft: "Kraft Box + Paperbag",
          hardbox: "Black Hardbox + Paperbag"
        }
      },
      acrylicStand: {
        id: ["15x15cm 1 sisi", "A4 2 sisi", "A3 2 sisi"],
        en: ["15x15cm 1 side", "A4 2 sides", "A3 2 sides"]
      },
      faceCount: {
        id: ["1–9 Wajah", "Di atas 10 Wajah"],
        en: ["1–9 Faces", "Above 10 Faces"]
      },
      express: {
        id: ["Ekspress 24 jam", "Ekspress 12 jam", "Ekspress 6 jam"],
        en: ["Express 24 hours", "Express 12 hours", "Express 6 hours"]
      },
      acrylicSizes: {
        id: ["A2", "A1", "A0"],
        en: ["A2", "A1", "A0"]
      }
    };

    const t = optionTranslations;

    // =========================
    // 2D FRAME (FINAL FIX)
    // =========================
    if (categoryLower.includes("2d")) {
      options = {};
    }

    // =========================
    // 3D FRAME 8R (PACKAGING)
    // =========================
    if (categoryLower.includes("3d") && nameLower.includes("8r")) {
      options = {
        packagingOptions: [
          { 
            value: "duskraft", 
            label: t.packaging[language].duskraft 
          },
          { 
            value: "hardbox", 
            label: t.packaging[language].hardbox 
          },
        ],
      };
    }

    // =========================
    // ACRYLIC STAND (PRODUCT)
    // =========================
    if (categoryLower.includes("acrylic stand")) {
      if (nameLower.includes("3mm")) {
        options = {
          acrylicStandOptions: t.acrylicStand[language],
        };
      }
    }

    // =========================
    // ADDITIONAL
    // =========================
    if (categoryLower.includes("additional")) {
      // =========================
      // WAJAH KARIKATUR / CARICATURE FACE
      // =========================
      if (
        nameLower.includes("wajah karikatur") ||
        nameLower.includes("biaya tambahan wajah karikatur") ||
        (language === 'en' && (
          nameLower.includes("caricature face") ||
          nameLower.includes("additional cost caricature face")
        ))
      ) {
        options = {
          faceCountOptions: t.faceCount[language],
        };
      }

      // =========================
      // WAJAH BANYAK / MANY FACES (DESIGN CUSTOMER)
      // =========================
      else if (
        nameLower.includes("wajah banyak") ||
        nameLower.includes("biaya tambahan wajah banyak") ||
        (language === 'en' && (
          nameLower.includes("many faces") ||
          nameLower.includes("additional cost many faces")
        ))
      ) {
        options = {
          faceCountOptions: t.faceCount[language],
        };
      }

      // =========================
      // EKSPRESS / EXPRESS
      // =========================
      else if (
        nameLower.includes("ekspress") ||
        (language === 'en' && nameLower.includes("express"))
      ) {
        options = {
          expressOptions: t.express[language],
        };
      }

      // =========================
      // GANTI FRAME KE ACRYLIC / CHANGE FRAME TO ACRYLIC
      // =========================
      else if (
        nameLower.includes("ganti frame kaca ke acrylic") ||
        (language === 'en' && nameLower.includes("change glass frame to acrylic"))
      ) {
        options = {
          acrylicSizes: t.acrylicSizes[language],
        };
      }

      // =========================
      // DEFAULT ADDITIONAL
      // =========================
      else {
        options = {};
      }
    }

    // Handle existing options that might already be in the data
    // If data already has options, we need to translate them too
    const translateExistingOptions = (existingOptions: any) => {
      if (!existingOptions || typeof existingOptions !== 'object') {
        return existingOptions;
      }

      const translatedOptions: any = {};
      
      for (const [key, value] of Object.entries(existingOptions)) {
        if (Array.isArray(value)) {
          // Translate array options if they match our known patterns
          if (key === 'faceCountOptions' || key === 'faceCount') {
            translatedOptions[key] = t.faceCount[language];
          } else if (key === 'expressOptions' || key === 'express') {
            translatedOptions[key] = t.express[language];
          } else if (key === 'acrylicStandOptions' || key === 'acrylicStand') {
            translatedOptions[key] = t.acrylicStand[language];
          } else if (key === 'acrylicSizes') {
            translatedOptions[key] = t.acrylicSizes[language];
          } else if (key === 'packagingOptions') {
            translatedOptions[key] = [
              { value: "duskraft", label: t.packaging[language].duskraft },
              { value: "hardbox", label: t.packaging[language].hardbox }
            ];
          } else {
            translatedOptions[key] = value;
          }
        } else if (typeof value === 'string') {
          // Translate string values
          if (value.includes("Wajah") || value.includes("Faces")) {
            // Find matching translation
            const idIndex = t.faceCount.id.findIndex(item => item === value);
            if (idIndex !== -1) {
              translatedOptions[key] = t.faceCount.en[idIndex];
            } else {
              const enIndex = t.faceCount.en.findIndex(item => item === value);
              if (enIndex !== -1) {
                translatedOptions[key] = t.faceCount.id[enIndex];
              } else {
                translatedOptions[key] = value;
              }
            }
          } else {
            translatedOptions[key] = value;
          }
        } else {
          translatedOptions[key] = value;
        }
      }
      
      return translatedOptions;
    };

    // Use generated options or translate existing ones
    let finalOptions = {};
    if (Object.keys(options).length > 0) {
      finalOptions = options;
    } else if (data.options && Object.keys(data.options).length > 0) {
      finalOptions = translateExistingOptions(data.options);
    }

    // Get UI text based on language
    const getUIText = () => {
      if (!uiText) return null;
      
      // If uiText already has language support
      if (typeof uiText === 'object' && (uiText.id || uiText.en)) {
        return uiText[language] || uiText.id || uiText.en;
      }
      
      // Fallback to original uiText
      return uiText;
    };

    const currentUIText = getUIText();

    return {
      id: data.id,
      title: (currentUIText?.details?.title || data.name) || data.name,
      category: data.category,
      images: data.images,
      options: finalOptions,
      uiText: currentUIText ? {
        ...currentUIText,
        details: (() => {
          if (!currentUIText.details) return null;
          const { title, ...rest } = currentUIText.details;
          return rest;
        })(),
      } : null,
      price: data.price,
      isBestSelling: data.isBestSelling ?? false,
      bestSellingLabel: data.bestSellingLabel,
      language: language
    };
  },
};