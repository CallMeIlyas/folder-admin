export const productMapper = {
  toProductDetail(data: ProductDetailInput, language: "id" | "en" = "id") {
    const { uiText } = data;

    const resolveUIText = () => {
      if (!uiText) return null;

      if (typeof uiText === "object" && (uiText.id || uiText.en)) {
        return uiText[language] || uiText.id || uiText.en;
      }

      return uiText;
    };

    const currentUIText = resolveUIText();

    return {
      id: data.id,

      title:
        (currentUIText?.details?.title || data.name) ??
        data.name,

      category: data.category,

      images: data.images,

      // 🔥 INI KUNCI UTAMA
      // FE UTAMA HANYA BACA INI
      optionsResolved: data.optionsResolved ?? null,

      uiText: currentUIText
        ? {
            ...currentUIText,
            details: (() => {
              if (!currentUIText.details) return null;
              const { title, ...rest } = currentUIText.details;
              return rest;
            })()
          }
        : null,

      price: data.price,

      isBestSelling: data.isBestSelling ?? false,

      bestSellingLabel: data.bestSellingLabel ?? "",

      language
    };
  }
};