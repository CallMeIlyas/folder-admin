export const productMapper = {
  toProductDetail(data: ProductDetailInput, language: 'id' | 'en' = 'id') {
    const { uiText } = data;

    // ✅ LANGKAH 1 & 3: Mapper TIDAK mengubah variations
    // Hanya menggunakan options dari controller
    const options = data.options || {};

    // ✅ Get UI text based on language
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
      // ✅ LANGKAH 3: Langsung return options dari controller
      options: options,
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