export interface ShoppingCartTranslations {
  shoppingCart: {
    title: string;
    emptyCart: string;
    selectAll: string;
    addShipping: string;
    noVariations: string;
    variations: string;
    glassFrame: string;
    acrylicFrame: string;
    shippingCostDescription: string;
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    total: string;
    items: string;
    includesShipping: string;
    checkout: string;
    payment: {
      title: string;
      description: string;
      notes: {
        note1: string;
        note2: string;
        note3: string;
      };
    };
    continueOrder: {
      title: string;
      description: string;
      points: {
        point1: string;
        point2: string;
      };
    };
    contactLittleAmora: string;
    sendToWhatsApp: string;
    alerts: {
      shippingExists: {
        title: string;
        message: string;
        gotIt: string;
      };
      selectProduct: {
        title: string;
        message: string;
        gotIt: string;
      };
      enterName: {
        title: string;
        message: string;
        example: string;
        sendToWhatsApp: string;
        cancel: string;
      };
      emptyName: {
        title: string;
        message: string;
        gotIt: string;
      };
    };
    whatsappMessage: string;
  };
  shipping: {
    shippingCost: string;
  };
  paymentMethods: {
    banks: PaymentMethod[];
    ewallets: PaymentMethod[];
  };
  assets: {
    shippingIcon: string;
    placeholders: Record<string, string>;
  };
}

export interface PaymentMethod {
  key: string;
  label: string;
  account: string;
  owner: string;
  image?: string;
}