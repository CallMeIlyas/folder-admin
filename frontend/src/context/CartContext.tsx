import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { apiFetch } from "../utils/api";

export interface CartItem {
  cartId: string;
  id: string;
  name: string;
  title: string;
  variation?: string;
  variationOptions?: string[];
  price: number;
  quantity: number;
  imageUrl: string;
  image: string;
  productType: "frame" | "shipping" | "other";
  parentCartId?: string;
  category?: string;
  // Store pilihan user dari ProductDetail
  options?: Record<string, string>;
  // Store resolved options dari backend untuk re-calculation
  optionsResolved?: {
    groups: Array<{
      id: string;
      type: string;
      label?: Record<string, string> | string;
      options: Array<{
        value: string;
        label: Record<string, string> | string;
        image?: string;
        preview?: string;
      }>;
    }>;
  };
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "cartId">) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  deleteItem: (cartId: string) => void;
  clearCart: () => void;
  getProductGroup: (productId: string) => CartItem[];
  updateItemVariant: (cartId: string, newVariation: string) => void;
  updateShippingCost: (cartId: string, cost: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart:", e);
    }
  }, [cart]);

  const addToCart = async (item: Omit<CartItem, "cartId">) => {
    console.log("🛒 Adding to cart:", item);

    // Untuk shipping items, langsung tambahkan tanpa processing
    if (item.productType === "shipping") {
      const shippingItem: CartItem = {
        ...item,
        cartId: uuidv4(),
        quantity: item.quantity || 1,
        image: item.imageUrl,
        variation: "",
        variationOptions: [],
      };
      setCart((prev) => [...prev, shippingItem]);
      return;
    }

    try {
      // Fetch product data untuk mendapatkan optionsResolved terbaru dari backend
      const productResponse = await apiFetch(`/api/products/${item.id}`);
      const productData = await productResponse.json();
      
      console.log("🛒 Fetched product data:", productData);

      // Generate variation display dari backend optionsResolved
      const { variation, variationOptions } = await generateVariationFromOptions(
        item.id,
        item.options || {},
        productData.optionsResolved
      );

      const mainCartItem: CartItem = {
        ...item,
        cartId: uuidv4(),
        quantity: item.quantity || 1,
        image: item.imageUrl,
        options: item.options || {},
        optionsResolved: productData.optionsResolved, // Use fresh data dari backend
        variation,
        variationOptions,
      };

      console.log("🛒 Cart item created:", mainCartItem);

      setCart((prev) => [...prev, mainCartItem]);
    } catch (error) {
      console.error("❌ Failed to add to cart:", error);
      
      // Fallback: tambahkan tanpa variation processing
      const fallbackItem: CartItem = {
        ...item,
        cartId: uuidv4(),
        quantity: item.quantity || 1,
        image: item.imageUrl,
        variation: "",
        variationOptions: [],
      };
      setCart((prev) => [...prev, fallbackItem]);
    }
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((p) =>
          p.cartId === cartId
            ? { ...p, quantity: Math.max(0, (p.quantity || 1) + delta) }
            : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  const deleteItem = (cartId: string) => {
    setCart((prev) => prev.filter((p) => p.cartId !== cartId));
  };

  const clearCart = () => setCart([]);

  const getProductGroup = (productId: string) =>
    cart.filter((item) => item.id === productId);

  const updateShippingCost = (cartId: string, cost: number) => {
    setCart((prev) =>
      prev.map((p) =>
        p.cartId === cartId ? { ...p, price: cost } : p
      )
    );
  };

  const updateItemVariant = async (cartId: string, newVariation: string) => {
    console.log("🔄 Updating variation:", { cartId, newVariation });

    setCart((prev) =>
      prev.map((item) => {
        if (item.cartId !== cartId) return item;
        if (item.productType === "shipping") {
          return { ...item, variation: newVariation };
        }

        console.log("🔄 Current item:", item);

        // Update variation display
        const updated = { ...item, variation: newVariation };

        // Calculate new price via backend
        calculateNewPrice(item, newVariation).then(newPrice => {
          setCart((prev) =>
            prev.map((p) =>
              p.cartId === cartId ? { ...p, price: newPrice } : p
            )
          );
        });

        return updated;
      })
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        deleteItem,
        clearCart,
        getProductGroup,
        updateItemVariant,
        updateShippingCost,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
};

// ===== HELPER FUNCTIONS - BACKEND SYNC =====

/**
 * Generate variation display dan list dari options yang dipilih user
 * Menggunakan optionsResolved dari backend (sudah merge dengan admin config)
 */
async function generateVariationFromOptions(
  productId: string,
  options: Record<string, string>,
  optionsResolved?: CartItem["optionsResolved"]
): Promise<{ variation: string; variationOptions: string[] }> {
  
  if (!optionsResolved?.groups || optionsResolved.groups.length === 0) {
    console.log("⚠️ No optionsResolved groups, returning empty variations");
    return { variation: "", variationOptions: [] };
  }

  console.log("📋 Generating variations from options:", { 
    productId, 
    options, 
    groups: optionsResolved.groups.map(g => g.id)
  });

  // Cari group yang paling relevan untuk dijadikan variation display
  // Priority: shading > frame > packaging > size > stand_type > face_count > acrylic_size > express_level > option
  const priorityOrder = [
    "shading",      // 2D Frame
    "frame",        // Frame Kaca/Acrylic
    "packaging",    // 3D Frame 8R
    "size",         // Generic size
    "stand_type",   // Acrylic Stand
    "face_count",   // Additional Wajah
    "acrylic_size", // Additional Acrylic
    "express_level" // Additional Express
  ];
  
  let mainGroup = null;
  
  // Cari berdasarkan priority
  for (const priority of priorityOrder) {
    mainGroup = optionsResolved.groups.find(g => g.id === priority);
    if (mainGroup) {
      console.log(`✅ Found priority group: ${priority}`);
      break;
    }
  }

  // Fallback: ambil group pertama yang ada options
  if (!mainGroup) {
    mainGroup = optionsResolved.groups.find(g => g.options && g.options.length > 0);
    console.log(`⚠️ Using fallback group: ${mainGroup?.id}`);
  }

  if (!mainGroup) {
    console.log("❌ No valid group found");
    return { variation: "", variationOptions: [] };
  }

  // Filter hanya options yang active
  const activeOptions = mainGroup.options.filter(opt => opt.active !== false);

  if (activeOptions.length === 0) {
    console.log("❌ No active options in main group");
    return { variation: "", variationOptions: [] };
  }

  const selectedValue = options[mainGroup.id];
  console.log(`🔍 Looking for selected value: ${selectedValue} in group: ${mainGroup.id}`);

  // Cari option yang dipilih
  const selectedOption = activeOptions.find(opt => opt.value === selectedValue);

  // Get variation display (label dari option yang dipilih)
  let variation = "";
  if (selectedOption) {
    if (typeof selectedOption.label === 'object') {
      variation = selectedOption.label['id'] || selectedOption.label['en'] || selectedOption.value;
    } else {
      variation = selectedOption.label || selectedOption.value;
    }
  } else {
    // Fallback ke option pertama
    const firstOption = activeOptions[0];
    if (typeof firstOption.label === 'object') {
      variation = firstOption.label['id'] || firstOption.label['en'] || firstOption.value;
    } else {
      variation = firstOption.label || firstOption.value;
    }
  }

  // Get all variation options (semua label dari group ini, hanya yang active)
  const variationOptions = activeOptions.map(opt => {
    if (typeof opt.label === 'object') {
      return opt.label['id'] || opt.label['en'] || opt.value;
    }
    return opt.label || opt.value;
  });

  console.log("✅ Generated variations:", { variation, variationOptions });

  return { variation, variationOptions };
}

/**
 * Calculate price ketika variation berubah
 * Menggunakan backend API untuk consistency
 */
async function calculateNewPrice(
  item: CartItem,
  newVariation: string
): Promise<number> {
  console.log("💰 Calculating new price:", { item, newVariation });

  // Untuk shipping, tidak ada price change
  if (item.productType === "shipping") {
    return item.price;
  }

  // Jika tidak ada optionsResolved, kembalikan harga saat ini
  if (!item.optionsResolved?.groups) {
    console.log("⚠️ No optionsResolved, keeping current price");
    return item.price;
  }

  try {
    // Map variation display kembali ke option value
    const newOptions = mapVariationToOptions(item, newVariation);

    if (!newOptions) {
      console.log("⚠️ Could not map variation to options, keeping current price");
      return item.price;
    }

    console.log("💰 New options for price calculation:", newOptions);

    // Call backend API untuk calculate price
    const response = await apiFetch("/api/products/calculate-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: item.id,
        options: newOptions
      })
    });

    if (!response.ok) {
      console.error(`❌ Price calculation API failed: ${response.status}`);
      return item.price;
    }

    const data = await response.json();
    console.log("💰 Price calculation result:", data);

    return typeof data.price === 'number' ? data.price : item.price;

  } catch (error) {
    console.error("❌ Price calculation error:", error);
    return item.price; // Fallback ke harga sekarang
  }
}

/**
 * Map variation display (yang ditampilkan di dropdown) kembali ke option value
 * untuk dikirim ke backend
 */
function mapVariationToOptions(
  item: CartItem,
  newVariation: string
): Record<string, string> | null {
  
  if (!item.optionsResolved?.groups || !item.options) {
    return null;
  }

  const updatedOptions = { ...item.options };
  let found = false;

  console.log("🔄 Mapping variation to options:", { newVariation, currentOptions: item.options });

  // Cari group mana yang variation-nya berubah
  for (const group of item.optionsResolved.groups) {
    // Filter hanya active options
    const activeOptions = group.options.filter(opt => opt.active !== false);

    const matchingOption = activeOptions.find(opt => {
      const label = typeof opt.label === 'object'
        ? opt.label['id'] || opt.label['en']
        : opt.label;
      
      // Match by label atau value
      return label === newVariation || opt.value === newVariation;
    });

    if (matchingOption) {
      // Update option value untuk group ini
      updatedOptions[group.id] = matchingOption.value;
      found = true;
      
      console.log(`✅ Mapped variation "${newVariation}" to option:`, {
        groupId: group.id,
        value: matchingOption.value
      });
      break;
    }
  }

  if (!found) {
    console.log(`⚠️ Could not find matching option for variation: ${newVariation}`);
    return item.options; // Return original options
  }

  return updatedOptions;
}

/**
 * Get user-friendly label untuk variation
 */
export function getVariationLabel(
  item: CartItem,
  lang: string = 'id'
): string {
  if (!item.variation) return "";
  
  if (!item.optionsResolved?.groups) return item.variation;

  // Cari option yang match dengan variation saat ini
  for (const group of item.optionsResolved.groups) {
    const option = group.options.find(opt => {
      const label = typeof opt.label === 'object'
        ? opt.label[lang] || opt.label['en']
        : opt.label;
      return label === item.variation || opt.value === item.variation;
    });

    if (option) {
      return typeof option.label === 'object'
        ? option.label[lang] || option.label['en'] || option.value
        : option.label || option.value;
    }
  }

  return item.variation;
}

/**
 * Debug helper: Print cart item structure
 */
export function debugCartItem(item: CartItem): void {
  console.group(`🛒 Cart Item: ${item.name}`);
  console.log("ID:", item.id);
  console.log("Variation:", item.variation);
  console.log("Variation Options:", item.variationOptions);
  console.log("Selected Options:", item.options);
  console.log("Price:", item.price);
  console.log("Has optionsResolved:", !!item.optionsResolved);
  if (item.optionsResolved) {
    console.log("Groups:", item.optionsResolved.groups.map(g => ({
      id: g.id,
      type: g.type,
      activeOptions: g.options.filter(o => o.active !== false).length,
      totalOptions: g.options.length
    })));
  }
  console.groupEnd();
}