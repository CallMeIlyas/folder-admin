type ProductDetailInput = {
  id: string;
  category: string;
  name: string;
  images: {
    main: string;
    gallery: string[];
  };
  options: any;
  uiText: any;
  price: number;
  isBestSelling?: boolean;
  bestSellingLabel?: string;
};

export const productMapper = {
  toProductDetail(data: ProductDetailInput) {
    const { uiText } = data;

    return {
      id: data.id,
      title: uiText.details?.title || data.name,
      category: data.category,

      images: data.images,
      options: data.options,

      uiText: {
        ...uiText,

        details: (() => {
          if (!uiText.details) return null;

          const { title, ...rest } = uiText.details;
          return rest;
        })(),
      },

      price: data.price,

      isBestSelling: data.isBestSelling ?? false,
      bestSellingLabel: data.bestSellingLabel,
    };
  },
};