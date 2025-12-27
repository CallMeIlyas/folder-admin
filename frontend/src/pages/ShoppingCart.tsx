import React, { useEffect, useState, useMemo, useRef } from "react";
import Footer from "../components/home/Footer";
import { useCart } from "../context/CartContext";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import { apiFetch, apiAsset } from "../utils/api";

// Types untuk data dari backend
interface PaymentAsset {
  key: string;
  label: string;
  account: string;
  owner: string;
  image: string;
}

interface PaymentAssetsData {
  banks: PaymentAsset[];
  ewallets: PaymentAsset[];
  shippingIcon: string;
}

interface TranslationsData {
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
}

// fungsi formatProductName:
const formatProductName = (name: string): string => {
  if (!name) return name;
  
  const sizePattern = /(A\d+)-(\d+)X(\d+)CM/i;
  const match = name.match(sizePattern);
  
  if (match) {
    const [, size, width, height] = match;
    const formattedSize = `${size} / ${width}x${height}cm`;
    
    if (name.toLowerCase().includes("frame")) {
      return name.replace(sizePattern, formattedSize);
    }
    
    return `Frame ${formattedSize}`;
  }
  
  return name;
};

// Komponen DateInput
interface DateInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  placeholder?: string;
  className?: string;
}

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  name,
  placeholder,
  className
}) => {
  const [inputType, setInputType] = useState('text');

  const handleFocus = () => {
    setInputType('date');
  };

  const handleBlur = () => {
    if (!value) {
      setInputType('text');
    }
  };

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  };

  return (
    <input
      type={inputType}
      value={value}
      onChange={onChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      name={name}
      placeholder={placeholder}
      min={inputType === "date" ? getMinDate() : undefined}
      className={className}
    />
  );
};

const resolveCartImage = (src?: string) => {
  if (!src) return apiAsset("images/placeholder/product-default.jpg");
  if (src.startsWith("http")) return src;
  return apiAsset(src);
};

const ProductImage: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => (
  <img
    src={resolveCartImage(src)}
    alt={alt}
    className="w-16 h-16 rounded-md object-cover"
    onError={(e) => {
      e.currentTarget.src = apiAsset("images/placeholder/product-default.jpg");
    }}
  />
);

// Komponen ProductName
const ProductName: React.FC<{ name: string }> = ({ name }) => (
  <h3 className="font-poppinsRegular text-[15px] w-[230px] truncate">
    {formatProductName(name)}
  </h3>
);

// Komponen ProductPrice
const ProductPrice: React.FC<{ price: number }> = ({ price }) => (
  <span className="font-poppinsSemiBold mr-9">
    Rp{price.toLocaleString("id-ID")}
  </span>
);

// Komponen FrameVariantDropdown
const FrameVariantDropdown: React.FC<{ 
  item: any; 
  updateItemVariant: (cartId: string, newVariation: string) => void;
  translations: TranslationsData['shoppingCart'] | null;
}> = ({
  item,
  updateItemVariant,
  translations
}) => {
  const { i18n } = useTranslation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(item.variation || item.variationOptions?.[0] || "");

  const toggleDropdown = () => {
    if (item.variationOptions && item.variationOptions.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  const shouldShowNoVariation = () => {
    if (!item.variationOptions || item.variationOptions.length === 0) {
      return true;
    }
    
    if (item.variationOptions.length === 1 && 
        (item.variationOptions[0] === "" || 
         item.variationOptions[0] === "No Variation")) {
      return true;
    }
    
    return false;
  };

  if (shouldShowNoVariation()) {
    return (
      <div className="w-[200px] ml-20">
        <p className="font-poppinsRegular text-[15px] select-none text-gray-500 italic">
          {translations?.noVariations || "No variations"}
        </p>
      </div>
    );
  }

  const handleSelect = (value: string) => {
    setSelected(value);
    updateItemVariant(item.cartId, value);
    setIsOpen(false);
  };

  const getDisplayValue = (value: string) => {
    const valueLower = value.toLowerCase();
    
    if (valueLower.includes("kaca") || valueLower.includes("glass")) {
      return translations?.glassFrame || "Glass Frame";
    } 
    else if (valueLower.includes("acrylic")) {
      return translations?.acrylicFrame || "Acrylic Frame";
    }
    return value;
  };

  return (
    <div className="w-[200px] ml-20 relative">
      <div 
        onClick={toggleDropdown}
        className={`font-poppinsRegular text-[15px] cursor-pointer select-none ${
          item.variationOptions && item.variationOptions.length > 0 
            ? '' 
            : 'text-gray-500 cursor-default'
        }`}
      >
        {translations?.variations || "Variations"}:{" "}
        {item.variationOptions && item.variationOptions.length > 0 && (
          <span
            className={`inline-block text-[12px] transform scale-x-[1.5] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        )}
      </div>

      {item.variationOptions && item.variationOptions.length > 0 ? (
        <>
          <p
            onClick={toggleDropdown}
            className="bg-white outline-none font-poppinsRegular text-[15px] cursor-pointer mt-1"
          >
            {getDisplayValue(selected)}
          </p>

          {isOpen && (
            <div className="absolute left-0 top-full w-full mt-1 bg-white rounded-md border border-[#ddd] overflow-hidden z-10">
              <div className="max-h-[120px] overflow-y-auto py-1">
                {item.variationOptions.map((opt: string) => (
                  <p
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className={`px-2 py-[2px] cursor-pointer font-poppinsRegular text-[15px] hover:bg-[#f6f6f6] ${
                      opt === selected ? "text-[#a23728] font-poppinsSemiBold" : ""
                    }`}
                  >
                    {getDisplayValue(opt)}
                  </p>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500 italic mt-1">
          -
        </p>
      )}
    </div>
  );
};

// Komponen ShippingCostItemDesktop
const ShippingCostItemDesktop: React.FC<{ 
  item: any;
  updateShippingCost: (cartId: string, cost: number) => void;
  editingShippingCost: string | null;
  tempShippingCost: string;
  handleEditShippingClick: (item: any) => void;
  handleSaveShippingCost: (cartId: string) => void;
  handleCancelShippingEdit: () => void;
  handleShippingCostChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  deleteItem: (cartId: string) => void;
  translations: TranslationsData['shoppingCart'] | null;
}> = ({
  item,
  updateShippingCost,
  editingShippingCost,
  tempShippingCost,
  handleEditShippingClick,
  handleSaveShippingCost,
  handleCancelShippingEdit,
  handleShippingCostChange,
  deleteItem,
  translations
}) => {

  return (
    <div className="mt-4 pt-4 border-t border-gray-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full mr-3">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <p className="font-poppinsSemiBold text-[15px]">
              {item.name}
            </p>
            <p className="font-poppinsRegular text-xs text-gray-500">
              {translations?.shippingCostDescription || "Shipping cost for your order"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {editingShippingCost === item.cartId ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="flex items-center rounded-[20px] border border-black overflow-hidden w-[120px]">
                  <span className="px-3 py-2 bg-gray-100 font-poppinsSemiBold text-sm">Rp</span>
                  <input
                    type="number"
                    value={tempShippingCost}
                    onChange={handleShippingCostChange}
                    className="px-3 py-2 text-sm w-full text-center font-poppinsRegular outline-none"
                    placeholder="0"
                    min="0"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSaveShippingCost(item.cartId)}
                  className="bg-[#dcbec1] text-black font-poppinsSemiBold text-xs px-3 py-1 rounded-full hover:opacity-90 transition shadow-sm"
                >
                  {translations?.save || "Save"}
                </button>
                <button
                  onClick={handleCancelShippingEdit}
                  className="bg-gray-300 text-black font-poppinsSemiBold text-xs px-3 py-1 rounded-full hover:opacity-90 transition shadow-sm"
                >
                  {translations?.cancel || "Cancel"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-right">
                <p className="font-poppinsBold text-red-600 text-lg">
                  Rp{item.price > 0 ? item.price.toLocaleString("id-ID") : "0"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditShippingClick(item)}
                  className="bg-[#dcbec1] text-black font-poppinsSemiBold text-xs px-3 py-1 rounded-full hover:opacity-90 transition shadow-sm"
                >
                  {translations?.edit || "Edit"}
                </button>
                <button
                  onClick={() => deleteItem(item.cartId)}
                  className="text-red-500 font-poppinsRegular text-sm"
                >
                  {translations?.delete || "Delete"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Komponen ShippingCostItemMobile
const ShippingCostItemMobile: React.FC<{ 
  item: any;
  updateShippingCost: (cartId: string, cost: number) => void;
  editingShippingCost: string | null;
  tempShippingCost: string;
  handleEditShippingClick: (item: any) => void;
  handleSaveShippingCost: (cartId: string) => void;
  handleCancelShippingEdit: () => void;
  handleShippingCostChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  deleteItem: (cartId: string) => void;
  translations: TranslationsData['shoppingCart'] | null;
}> = ({
  item,
  updateShippingCost,
  editingShippingCost,
  tempShippingCost,
  handleEditShippingClick,
  handleSaveShippingCost,
  handleCancelShippingEdit,
  handleShippingCostChange,
  deleteItem,
  translations
}) => {

  return (
    <div className="mt-4 pt-4 border-t border-gray-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full mr-3">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <p className="font-poppinsSemiBold text-[13px]">
              {item.name}
            </p>
            <p className="font-poppinsRegular text-[10px] text-gray-500">
              {translations?.shippingCostDescription || "Shipping cost for your order"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {editingShippingCost === item.cartId ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="flex items-center rounded-[20px] border border-black overflow-hidden w-[100px]">
                  <span className="px-2 py-1 bg-gray-100 font-poppinsSemiBold text-xs">Rp</span>
                  <input
                    type="number"
                    value={tempShippingCost}
                    onChange={handleShippingCostChange}
                    className="px-2 py-1 text-xs w-full text-center font-poppinsRegular outline-none"
                    placeholder="0"
                    min="0"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSaveShippingCost(item.cartId)}
                  className="bg-[#dcbec1] text-black font-poppinsSemiBold text-[10px] px-2 py-1 rounded-full hover:opacity-90 transition shadow-sm"
                >
                  {translations?.save || "Save"}
                </button>
                <button
                  onClick={handleCancelShippingEdit}
                  className="bg-gray-300 text-black font-poppinsSemiBold text-[10px] px-2 py-1 rounded-full hover:opacity-90 transition shadow-sm"
                >
                  {translations?.cancel || "Cancel"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-right">
                <p className="font-poppinsBold text-red-600 text-sm">
                  Rp{item.price > 0 ? item.price.toLocaleString("id-ID") : "0"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditShippingClick(item)}
                  className="bg-[#dcbec1] text-black font-poppinsSemiBold text-[10px] px-2 py-1 rounded-full hover:opacity-90 transition shadow-sm"
                >
                  {translations?.edit || "Edit"}
                </button>
                <button
                  onClick={() => deleteItem(item.cartId)}
                  className="text-red-500 font-poppinsRegular text-xs"
                >
                  {translations?.delete || "Delete"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Komponen utama ShoppingCart
const ShoppingCart: React.FC = () => {
  const { 
    cart, 
    updateQuantity, 
    deleteItem, 
    updateItemVariant, 
    updateShippingCost, 
    addToCart 
  } = useCart();
  
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editingShippingCost, setEditingShippingCost] = useState<string | null>(null);
  const [tempShippingCost, setTempShippingCost] = useState<string>("");
  const [showCheckout, setShowCheckout] = useState(false);
  const checkoutRef = useRef<HTMLDivElement | null>(null);

  // State untuk data dari backend
  const [paymentAssets, setPaymentAssets] = useState<PaymentAssetsData | null>(null);
  const [translations, setTranslations] = useState<TranslationsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch semua data dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
const res = await apiFetch(`/api/content/shoppingcart?lang=${currentLang}`);

if (!res.ok) throw new Error("Failed to load shopping cart content");

const json = await res.json();

if (json.success) {
  setTranslations({
    shoppingCart: json.data.shoppingCart,
    shipping: json.data.shipping
  });

  setPaymentAssets({
    banks: json.data.paymentMethods.banks.map((b: any) => ({
      ...b,
      image: `banks/${b.key}.png`
    })),
    ewallets: json.data.paymentMethods.ewallets.map((e: any) => ({
      ...e,
      image: `ewallets/${e.key}.png`
    })),
    shippingIcon: json.data.assets.shippingIcon
  });
}
      } catch (error) {
        console.error("Failed to fetch data from backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentLang]);

  // Filter cart untuk memisahkan produk dan shipping
  const productItems = useMemo(() => 
    cart.filter(item => 
      !item.name.toLowerCase().includes("ongkir") && 
      !item.name.toLowerCase().includes("shipping")
    ), 
    [cart]
  );

  const shippingItems = useMemo(() => 
    cart.filter(item => 
      item.name.toLowerCase().includes("ongkir") || 
      item.name.toLowerCase().includes("shipping")
    ), 
    [cart]
  );

  const addShippingItem = () => {
    const hasShippingItem = shippingItems.length > 0;
    
    if (hasShippingItem) {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
      
      modal.innerHTML = `
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-fadeIn">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-[#dcbec1] mb-4">
              <svg class="w-8 h-8 text-[#a23728]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="font-poppinsSemiBold text-xl text-gray-800 mb-2">
              ${translations?.shoppingCart.alerts.shippingExists.title || "Shipping Already Exists"}
            </h3>
            <p class="font-poppinsRegular text-gray-600 mb-6">
              ${translations?.shoppingCart.alerts.shippingExists.message || "Shipping cost already exists in the shopping cart."}
            </p>
            <button 
              onclick="this.closest('.fixed').remove()"
              class="font-poppinsSemiBold bg-[#dcbec1] hover:bg-[#c7a9ac] text-gray-800 px-6 py-3 rounded-full transition-colors w-full"
            >
              ${translations?.shoppingCart.alerts.shippingExists.gotIt || "Got it"}
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      setTimeout(() => {
        if (document.body.contains(modal)) {
          modal.remove();
        }
      }, 3000);
      
      return;
    }
    
    addToCart({
      id: "shipping-cost-001",
      name: translations?.shipping.shippingCost || "Shipping Cost",
      price: 0,
      quantity: 1,
      imageUrl: paymentAssets?.shippingIcon || "icons/shipping-icon.svg",
      image: paymentAssets?.shippingIcon || "icons/shipping-icon.svg",
      productType: "shipping",
      variation: "",
      variationOptions: [],
      attributes: {}
    });
  };

  const handleEditShippingClick = (item: any) => {
    setEditingShippingCost(item.cartId);
    setTempShippingCost(item.price > 0 ? item.price.toString() : "");
  };

  const handleSaveShippingCost = (cartId: string) => {
    const costValue = parseInt(tempShippingCost) || 0;
    updateShippingCost(cartId, costValue);
    setEditingShippingCost(null);
  };

  const handleCancelShippingEdit = () => {
    setEditingShippingCost(null);
  };

  const handleShippingCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempShippingCost(e.target.value);
  };

  const groupedProductItems = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    productItems.forEach((item) => {
      const key = item.parentCartId || item.cartId;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [productItems]);

  const allSelected = productItems.length > 0 && selectedItems.length === productItems.length;
  
  const toggleSelectAll = () => {
    if (allSelected) setSelectedItems([]);
    else setSelectedItems(productItems.map((item) => item.cartId));
  };

  // Hitung total harga
  const totalProductPrice = productItems
    .filter((item) => selectedItems.includes(item.cartId))
    .reduce((total, item) => total + item.price * item.quantity, 0);

  const totalShippingPrice = shippingItems
    .reduce((total, item) => total + item.price * item.quantity, 0);

  const totalPrice = totalProductPrice + totalShippingPrice;

  // Function untuk send message ke WhatsApp
  const handleSendToWhatsApp = () => {
    if (selectedItems.length === 0) {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
      
      modal.innerHTML = `
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-fadeIn">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-[#dcbec1] mb-4">
              <svg class="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="font-poppinsSemiBold text-xl text-gray-800 mb-2">
              ${translations?.shoppingCart.alerts.selectProduct.title || "Attention"}
            </h3>
            <p class="font-poppinsRegular text-gray-600 mb-6">
              ${translations?.shoppingCart.alerts.selectProduct.message || "Please select at least 1 product to checkout."}
            </p>
            <button 
              onclick="this.closest('.fixed').remove()"
              class="font-poppinsSemiBold bg-[#dcbec1] hover:bg-[#c7a9ac] text-black px-6 py-3 rounded-full transition-colors w-full"
            >
              ${translations?.shoppingCart.alerts.selectProduct.gotIt || "Got it"}
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      setTimeout(() => {
        if (document.body.contains(modal)) {
          modal.remove();
        }
      }, 3000);
      
      return;
    }

    // Modal untuk input nama
    const nameModal = document.createElement('div');
    nameModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    
    nameModal.innerHTML = `
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-fadeIn">
        <div class="text-center mb-4">
          <div class="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-[#dcbec1] mb-3">
            <svg class="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <h3 class="font-poppinsSemiBold text-xl text-gray-800 mb-2">
            ${translations?.shoppingCart.alerts.enterName.title || "Enter Your Name"}
          </h3>
          <p class="font-poppinsRegular text-gray-600 mb-4">
            ${translations?.shoppingCart.alerts.enterName.message || "Enter your name to create invoice."}
          </p>
        </div>
        <input
          type="text"
          id="customerNameInput"
          placeholder="${translations?.shoppingCart.alerts.enterName.example || "Example: John Doe"}"
          class="w-full border border-black rounded-full px-4 py-3 mb-4 font-poppinsRegular focus:outline-none"
          autofocus
        />
        <div class="flex gap-3">
          <button 
            id="cancelNameBtn"
            class="flex-1 bg-gray-300 text-black font-poppinsSemiBold px-4 py-3 rounded-full hover:bg-gray-400 transition-colors"
          >
            ${translations?.shoppingCart.alerts.enterName.cancel || "Cancel"}
          </button>
          <button 
            id="confirmNameBtn"
            class="flex-1 bg-[#dcbec1] hover:bg-[#c7a9ac] text-black font-poppinsSemiBold px-4 py-3 rounded-full transition-colors"
          >
            ${translations?.shoppingCart.alerts.enterName.sendToWhatsApp || "Send to WhatsApp"}
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(nameModal);
    
    const customerNameInput = document.getElementById('customerNameInput') as HTMLInputElement;
    const cancelNameBtn = document.getElementById('cancelNameBtn');
    const confirmNameBtn = document.getElementById('confirmNameBtn');
    
    const closeNameModal = () => {
      if (document.body.contains(nameModal)) {
        nameModal.remove();
      }
    };
    
    cancelNameBtn?.addEventListener('click', closeNameModal);
    
    confirmNameBtn?.addEventListener('click', () => {
      const customerName = customerNameInput?.value.trim();
      
      if (!customerName) {
        const errorModal = document.createElement('div');
        errorModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        
        errorModal.innerHTML = `
          <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-fadeIn">
            <div class="text-center">
              <div class="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-[#dcbec1] mb-4">
                <svg class="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="font-poppinsSemiBold text-xl text-gray-800 mb-2">
                ${translations?.shoppingCart.alerts.emptyName.title || "Empty Name"}
              </h3>
              <p class="font-poppinsRegular text-gray-600 mb-6">
                ${translations?.shoppingCart.alerts.emptyName.message || "Please enter your name first."}
              </p>
              <button 
                onclick="this.closest('.fixed').remove()"
                class="font-poppinsSemiBold bg-[#dcbec1] hover:bg-[#c7a9ac] text-black px-6 py-3 rounded-full transition-colors w-full"
              >
                ${translations?.shoppingCart.alerts.emptyName.gotIt || "Got it"}
              </button>
            </div>
          </div>
        `;
        
        document.body.appendChild(errorModal);
        
        setTimeout(() => {
          if (document.body.contains(errorModal)) {
            errorModal.remove();
          }
        }, 3000);
        
        return;
      }
      
      closeNameModal();
      
      // Gunakan template message dari backend
      const messageTemplate = translations?.shoppingCart.whatsappMessage || "Halo, Little Amora\nboleh bikinin invoice untuk order atas nama {{customerName}}";
      const message = messageTemplate.replace("{{customerName}}", customerName);
      
      const encodedMessage = encodeURIComponent(message);
      const phoneNumber = "6281380340307";
      
      window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    });
  };

  useEffect(() => {
    if (showCheckout && checkoutRef.current) {
      gsap.fromTo(
        checkoutRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [showCheckout]);

  // Render payment methods untuk mobile
  const renderPaymentMethodsMobile = () => {
    if (loading || !paymentAssets) {
      return (
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-8 bg-gray-200 animate-pulse rounded"></div>
              <div className="flex flex-col">
                <div className="w-28 h-3 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-20 h-2 bg-gray-200 animate-pulse rounded mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <ul className="space-y-3">
        {paymentAssets.banks.map((bank) => (
          <li key={bank.key} className="flex items-center gap-3">
            <img 
              src={apiAsset(bank.image)} 
              alt={bank.label} 
              className="w-12 h-auto"
              onError={(e) => {
                e.currentTarget.src = apiAsset("images/placeholder/bank-default.jpg");
              }}
            />
            <div className="flex flex-col">
              <span className="font-poppinsRegular text-sm">{bank.account}</span>
              <span className="text-xs font-poppinsBold">{bank.owner}</span>
            </div>
          </li>
        ))}
        {paymentAssets.ewallets.map((ewallet) => (
          <li key={ewallet.key} className="flex items-center gap-3">
            <img 
              src={apiAsset(ewallet.image)} 
              alt={ewallet.label} 
              className="w-12 h-auto"
              onError={(e) => {
                e.currentTarget.src = apiAsset("images/placeholder/ewallet-default.jpg");
              }}
            />
            <div className="flex flex-col">
              <span className="font-poppinsRegular text-sm">{ewallet.account}</span>
              <span className="text-xs font-poppinsBold">{ewallet.owner}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  // Render payment methods untuk desktop
  const renderPaymentMethodsDesktop = () => {
    if (loading || !paymentAssets) {
      return (
        <div className="space-y-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-[65px] h-[40px] bg-gray-200 animate-pulse rounded"></div>
              <div className="flex flex-col">
                <div className="w-32 h-4 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-24 h-3 bg-gray-200 animate-pulse rounded mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <ul className="space-y-2">
        {paymentAssets.banks.map((bank) => (
          <li key={bank.key} className="flex items-center gap-3">
            <img 
              src={apiAsset(bank.image)} 
              alt={bank.label} 
              className="w-[65px] h-auto"
              onError={(e) => {
                e.currentTarget.src = apiAsset("images/placeholder/bank-default.jpg");
              }}
            />
            <div className="flex flex-col">
              <span className="font-poppinsRegular">{bank.account}</span>
              <span className="text-[12px] font-poppinsBold">{bank.owner}</span>
            </div>
          </li>
        ))}
        {paymentAssets.ewallets.map((ewallet) => (
          <li key={ewallet.key} className="flex items-center gap-3">
            <img 
              src={apiAsset(ewallet.image)} 
              alt={ewallet.label} 
              className="w-[65px] h-auto"
              onError={(e) => {
                e.currentTarget.src = apiAsset("images/placeholder/ewallet-default.jpg");
              }}
            />
            <div className="flex flex-col">
              <span className="font-poppinsRegular">{ewallet.account}</span>
              <span className="text-[12px] font-poppinsBold">{ewallet.owner}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* MOBILE LAYOUT */}
      <div className="block md:hidden flex-1">
        <main className="px-4 py-6 space-y-6">
          
          {/* Box Cart - Mobile */}
          <div className="rounded-2xl border border-black p-4 bg-white shadow-sm">
            {productItems.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">
                {translations?.shoppingCart.emptyCart || "Cart is empty"}
              </p>
            ) : (
              <>
                {/* Select All Atas - Mobile */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 w-4 h-4 custom-checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                    />
                    <span className="font-poppinsSemiBold text-sm">
                      {translations?.shoppingCart.selectAll || "Select All"} ({productItems.length})
                    </span>
                  </div>
                  
                  <button
                    onClick={addShippingItem}
                    className="bg-[#dcbec1] text-black font-poppinsSemiBold text-xs px-3 py-1 rounded-full shadow-sm hover:opacity-90 transition"
                  >
                    {translations?.shoppingCart.addShipping || "Add Shipping"}
                  </button>
                </div>
                
                {Object.values(groupedProductItems).map((group: any[], idx) => (
                  <div key={idx} className="mb-4 pb-4 last:pb-0 border-b border-gray-200 last:border-b-0">
                    {group.map((item) => (
                      <div
                        key={item.cartId}
                        className="flex items-start py-3 space-y-2"
                      >
                        <input
                          type="checkbox"
                          className="mr-3 mt-2 w-4 h-4 custom-checkbox"
                          checked={selectedItems.includes(item.cartId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, item.cartId]);
                            } else {
                              setSelectedItems(
                                selectedItems.filter((id) => id !== item.cartId)
                              );
                            }
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <ProductImage src={item.imageUrl || item.image} alt={item.name} />
                            <div className="flex-1 min-w-0">
                              <ProductName name={item.name} />
                              <div className="mt-1">
                                <FrameVariantDropdown
                                  item={item}
                                  updateItemVariant={updateItemVariant}
                                  translations={translations?.shoppingCart || null}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <ProductPrice price={item.price} />
                            <div className="flex items-center gap-2">
                              <div className="flex items-center rounded-[20px] border border-black overflow-hidden">
                                <button
                                  className="px-2 py-1 border-r border-black text-xs"
                                  onClick={() => updateQuantity(item.cartId, -1)}
                                >
                                  -
                                </button>
                                <span className="px-2 py-1 text-xs">
                                  {item.quantity}
                                </span>
                                <button
                                  className="px-2 py-1 border-l border-black text-xs"
                                  onClick={() => updateQuantity(item.cartId, 1)}
                                >
                                  +
                                </button>
                              </div>
                              <p className="text-sm font-bold text-red-600">
                                Rp{(item.price * item.quantity).toLocaleString("id-ID")}
                              </p>
                              <button
                                className="font-poppinsRegular text-xs text-red-500"
                                onClick={() => deleteItem(item.cartId)}
                              >
                                {translations?.shoppingCart.delete || "Delete"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                
                {/* Shipping Cost Section - Mobile */}
                {shippingItems.map((item) => (
                  <ShippingCostItemMobile
                    key={item.cartId}
                    item={item}
                    updateShippingCost={updateShippingCost}
                    editingShippingCost={editingShippingCost}
                    tempShippingCost={tempShippingCost}
                    handleEditShippingClick={handleEditShippingClick}
                    handleSaveShippingCost={handleSaveShippingCost}
                    handleCancelShippingEdit={handleCancelShippingEdit}
                    handleShippingCostChange={handleShippingCostChange}
                    deleteItem={deleteItem}
                    translations={translations?.shoppingCart || null}
                  />
                ))}
                
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 custom-checkbox"
                    />
                    <span className="font-poppinsSemiBold text-sm">
                      {translations?.shoppingCart.selectAll || "Select All"} ({productItems.length})
                    </span>
                  </label>
                  <div className="text-right">
                    <p className="font-poppinsSemiBold text-sm">
                      {translations?.shoppingCart.total || "Total"} ({selectedItems.length} {translations?.shoppingCart.items || "items"}):{" "}
                      <span className="font-poppinsBold text-red-500">
                        Rp {totalPrice.toLocaleString("id-ID")}
                      </span>
                    </p>
                    {shippingItems.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {translations?.shoppingCart.includesShipping || "Includes shipping cost"}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Checkout Section - Mobile */}
          {!showCheckout ? (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowCheckout(true)}
                className="bg-[#dcbec1] text-black font-poppinsSemiBold text-sm px-6 py-2 rounded-full shadow-sm hover:opacity-90 transition w-full max-w-[200px]"
              >
                {translations?.shoppingCart.checkout || "Checkout"}
              </button>
            </div>
          ) : (
            <div ref={checkoutRef} className="space-y-6 mt-6">
              {/* Payment Section - Mobile */}
              <div className="bg-white rounded-2xl border border-black p-4">
                <h2 className="font-poppinsSemiBold text-sm mb-3 bg-[#dcbec1] px-3 py-1 rounded-full inline-block">
                  {translations?.shoppingCart.payment.title || "Payment"}
                </h2>
                <p className="mb-3 font-poppinsRegular text-sm">
                  {translations?.shoppingCart.payment.description || "Please make a payment to:"}
                </p>
                {renderPaymentMethodsMobile()}
                <div className="mt-4 space-y-1">
                  <p className="text-xs font-poppinsItalic text-[#a23728]">
                    {translations?.shoppingCart.payment.notes.note1 || "*Please give the bank payment receipt to our team via WhatsApp"}
                  </p>
                  <p className="text-xs font-poppinsItalic text-[#a23728]">
                    {translations?.shoppingCart.payment.notes.note2 || "*This invoice is valid and published by Claresta, owner of Little Amora Karikatur"}
                  </p>
                  <p className="text-xs font-poppinsItalic text-[#a23728]">
                    {translations?.shoppingCart.payment.notes.note3 || "*Copying or changing in any form is prohibited"}
                  </p>
                </div>
              </div>

              {/* Button Send to WhatsApp - Mobile */}
              <div className="bg-white rounded-2xl border border-black p-4">
                <h2 className="font-poppinsSemiBold text-sm mb-3 bg-[#dcbec1] px-3 py-1 rounded-full inline-block">
                  {translations?.shoppingCart.continueOrder.title || "Continue Order"}
                </h2>
                <p className="mb-12 font-poppinsRegular text-sm">
                  <span dangerouslySetInnerHTML={{ __html: translations?.shoppingCart.continueOrder.description || 
                    "If you <strong>WANT TO PAY</strong> or <strong>ALREADY PAID</strong>, you can confirm first with Little Amora team."
                  }} />
                  <br />
                  {translations?.shoppingCart.continueOrder.points.point1 || "1. To check order details (shipping fee, meeting deadline, glass/acrylic, etc)"}
                  <br />
                  {translations?.shoppingCart.continueOrder.points.point2 || "2. So the invoice you get is correct and valid"}
                </p>
                <button
                  onClick={handleSendToWhatsApp}
                  className="w-full bg-[#dcbec1] hover:bg-[#c7a9ac] text-black font-poppinsSemiBold text-sm px-6 py-3 rounded-full shadow-sm transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
                  </svg>
                  {translations?.shoppingCart.sendToWhatsApp || "Send to Little Amora WhatsApp"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:block flex-1">
        <main className="px-6 md:px-16 py-10 space-y-10">
          
          {/* Box Cart */}
          <div className="rounded-[30px] border border-black p-6 bg-white shadow-sm">
            {productItems.length === 0 ? (
              <p className="text-center text-gray-500">
                {translations?.shoppingCart.emptyCart || "Cart is empty"}
              </p>
            ) : (
              <>
                {/* Select All Atas */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 custom-checkbox"
                      style={{ width: '16px', height: '16px' }}
                      checked={allSelected}
                      onChange={toggleSelectAll}
                    />
                    <span className="font-poppinsSemiBold">
                      {translations?.shoppingCart.selectAll || "Select All"} ({productItems.length})
                    </span>
                  </div>
                  <button
                    onClick={addShippingItem}
                    className="bg-[#dcbec1] text-black font-poppinsSemiBold text-sm px-4 py-1 rounded-full shadow-sm hover:opacity-90 transition"
                  >
                    {translations?.shoppingCart.addShipping || "Add Shipping"}
                  </button>
                </div>
                
                {Object.values(groupedProductItems).map((group: any[], idx) => (
                  <div key={idx} className="mb-6 pb-6 last:pb-0">
                    {group.map((item) => (
                      <div
                        key={item.cartId}
                        className="flex items-center justify-between py-3"
                      >
                        <input
                          type="checkbox"
                          className="mr-3 custom-checkbox"
                          style={{ width: '16px', height: '16px' }}
                          checked={selectedItems.includes(item.cartId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, item.cartId]);
                            } else {
                              setSelectedItems(
                                selectedItems.filter((id) => id !== item.cartId)
                              );
                            }
                          }}
                        />
                        <div className="flex items-center gap-3 flex-1">
                          <ProductImage src={item.imageUrl || item.image} alt={item.name} />
                          <ProductName name={item.name} />
                          <FrameVariantDropdown
                            item={item}
                            updateItemVariant={updateItemVariant}
                            translations={translations?.shoppingCart || null}
                          />
                          <div className="flex-shrink-0 -translate-x-7">
                            <ProductPrice price={item.price} />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center rounded-[30px] border border-black overflow-hidden">
                            <button
                              className="px-3 py-[0.1rem] border-r border-black"
                              onClick={() => updateQuantity(item.cartId, -1)}
                            >
                              -
                            </button>
                            <span className="px-4 py-[0.1rem]">
                              {item.quantity}
                            </span>
                            <button
                              className="px-3 py-[0.1rem] border-l border-black"
                              onClick={() => updateQuantity(item.cartId, 1)}
                            >
                              +
                            </button>
                          </div>
                          <p className="w-28 text-right font-bold text-red-600">
                            Rp{(item.price * item.quantity).toLocaleString("id-ID")}
                          </p>
                          <button
                            className="font-poppinsRegular text-red-500"
                            onClick={() => deleteItem(item.cartId)}
                          >
                            {translations?.shoppingCart.delete || "Delete"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                
                {/* Shipping Cost Section - Desktop */}
                {shippingItems.map((item) => (
                  <ShippingCostItemDesktop
                    key={item.cartId}
                    item={item}
                    updateShippingCost={updateShippingCost}
                    editingShippingCost={editingShippingCost}
                    tempShippingCost={tempShippingCost}
                    handleEditShippingClick={handleEditShippingClick}
                    handleSaveShippingCost={handleSaveShippingCost}
                    handleCancelShippingEdit={handleCancelShippingEdit}
                    handleShippingCostChange={handleShippingCostChange}
                    deleteItem={deleteItem}
                    translations={translations?.shoppingCart || null}
                  />
                ))}
                
                <div className="flex items-center justify-between pt-4 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 custom-checkbox"
                    />
                    <span className="font-poppinsSemiBold">
                      {translations?.shoppingCart.selectAll || "Select All"} ({productItems.length})
                    </span>
                  </label>
                  <div className="text-right">
                    <p className="font-poppinsSemiBold">
                      {translations?.shoppingCart.total || "Total"} ({selectedItems.length} {translations?.shoppingCart.items || "items"}):{" "}
                      <span className="font-poppinsBold text-red-500">
                        Rp {totalPrice.toLocaleString("id-ID")}
                      </span>
                    </p>
                    {shippingItems.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {translations?.shoppingCart.includesShipping || "Includes shipping cost"}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Checkout Section */}
          {!showCheckout ? (
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowCheckout(true)}
                className="bg-[#dcbec1] text-black font-poppinsSemiBold text-[15px] px-5 py-2 rounded-full shadow-sm hover:opacity-90 transition"
              >
                {translations?.shoppingCart.checkout || "Checkout"}
              </button>
            </div>
          ) : (
            <div ref={checkoutRef} className="grid md:grid-cols-2 gap-8 mt-8">
              {/* Payment Section */}
              <div>
                <h2 className="font-poppinsSemiBold text-[15px] mb-4 bg-[#dcbec1] translate-x-[-25px] px-4 py-2 rounded-full inline-block">
                  {translations?.shoppingCart.payment.title || "Payment"}
                </h2>
                <p className="mb-4 font-poppinsRegular">
                  {translations?.shoppingCart.payment.description || "Please make a payment to:"}
                </p>
                {renderPaymentMethodsDesktop()}
                <div className="mt-6 -space-y-1">
                  <p className="text-[12px] font-poppinsItalic text-[#a23728]">
                    {translations?.shoppingCart.payment.notes.note1 || "*Please give the bank payment receipt to our team via WhatsApp"}
                  </p>
                  <p className="text-[12px] font-poppinsItalic text-[#a23728]">
                    {translations?.shoppingCart.payment.notes.note2 || "*This invoice is valid and published by Claresta, owner of Little Amora Karikatur"}
                  </p>
                  <p className="text-[12px] font-poppinsItalic text-[#a23728]">
                    {translations?.shoppingCart.payment.notes.note3 || "*Copying or changing in any form is prohibited"}
                  </p>
                </div>
              </div>

              {/* Button Send to WhatsApp - Desktop */}
              <div className="text-[13px]">
                <h2 className="font-poppinsSemiBold text-[15px] mb-4 bg-[#dcbec1] translate-x-[-25px] px-4 py-2 rounded-full inline-block">
                  {translations?.shoppingCart.continueOrder.title || "Continue Order"}
                </h2>
                <p className="font-poppinsRegular text-sm">
                  <span dangerouslySetInnerHTML={{ __html: translations?.shoppingCart.continueOrder.description || 
                    "If you <strong>WANT TO PAY</strong> or <strong>ALREADY PAID</strong>, you can confirm first with Little Amora team."
                  }} />
                  <br />
                  {translations?.shoppingCart.continueOrder.points.point1 || "1. To check order details (shipping fee, meeting deadline, glass/acrylic, etc)"}
                  <br />
                  {translations?.shoppingCart.continueOrder.points.point2 || "2. So the invoice you get is correct and valid"}
                </p>
  
                <div className="bg-white rounded-2xl border border-black p-6 mt-4">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-[#dcbec1] mb-4">
                      <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
                      </svg>
                    </div>
                    <h3 className="font-poppinsSemiBold text-xl text-gray-800 mb-2">
                      {translations?.shoppingCart.contactLittleAmora || "Contact Little Amora"}
                    </h3>
                    <p className="font-poppinsRegular text-gray-600 mb-6">
                      {currentLang === "id" 
                        ? "Kirim detail pesanan Anda ke WhatsApp untuk mendapatkan invoice resmi dan konfirmasi pemesanan."
                        : "Send your order details to WhatsApp to get official invoice and order confirmation."
                      }
                    </p>
                    <button
                      onClick={handleSendToWhatsApp}
                      className="w-full bg-[#dcbec1] hover:bg-[#c7a9ac] text-black font-poppinsSemiBold text-[15px] px-6 py-3 rounded-full shadow-sm transition flex items-center justify-center gap-3"
                    >
                      <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
                      </svg>
                      {translations?.shoppingCart.sendToWhatsApp || "Send to Little Amora WhatsApp"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default ShoppingCart;