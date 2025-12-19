import { Outlet } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import Header from "./home/Header";
import { Toaster, toast } from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { Check } from "lucide-react";
import gsap from "gsap";

interface LayoutProps {
  onSearch?: (query: string) => void;
  children?: React.ReactNode;
}

const ToastItem: React.FC<{ t: any }> = ({ t }) => {
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toastRef.current) return;

    if (t.visible) {
      gsap.fromTo(
        toastRef.current,
        { y: -50, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
        }
      );
    } else {
      gsap.to(toastRef.current, {
        opacity: 0,
        y: -20,
        scale: 0.95,
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [t.visible]);

  return (
    <div
      ref={toastRef}
      className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-md border border-gray-100"
    >
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#dcbec1] flex-shrink-0">
        <Check size={16} className="text-black" strokeWidth={3} />
      </div>
      <span className="text-[15px] font-poppinsMedium text-black">
        Item has been added to your shopping cart
      </span>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ onSearch, children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { cart, addToCart } = useCart();
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleAddToCart = useCallback(
    (item: Parameters<typeof addToCart>[0]) => {
      addToCart(item);
      toast.custom((t) => <ToastItem t={t} />, {
        duration: 2500,
        position: "top-right",
      });
    },
    [addToCart]
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (onSearch) onSearch(query);
    },
    [onSearch]
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header cartCount={cartCount} cartItems={cart} onSearch={handleSearch} />

      <main className="flex-grow">
        {children ? (
          children
        ) : (
          <Outlet context={{ searchQuery, addToCart: handleAddToCart }} />
        )}
      </main>

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Layout;