export interface Product {  
  id: number;  
  name: string;  
  size: string;  
  imageUrl: string;  
  category: string;  
  shippedFrom: string;  
  shippedTo: string[];  
  price: number;  
}

export interface CartItem {
  cartId: string;
  id: string;
  name: string;
  variation: string; // HANYA frame variant, misal "Black Hardbox"
  price: number;
  quantity: number;
  imageUrl: string;
  productType: "frame";
  attributes?: {
    faceCount?: number;     
    backgroundType?: string;
  };
}
export interface Step {
  number: number;
  icon: string;
  text: string;
  special?: boolean;
}

export interface VideoItem {
  id: number;
  video: string;
}

export interface FilterOptions {
  categories: string[];
  shippedFrom: string[];
  shippedTo: string[];
}