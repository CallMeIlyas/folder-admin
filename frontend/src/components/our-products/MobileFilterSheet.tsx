import { useEffect, useState } from "react";
import SidebarFilters from "./SidebarFilters";
import { FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function MobileFilterSheet({ isOpen, onClose, onFilterChange }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  // State lokal untuk filter di mobile
  const [mobileFilters, setMobileFilters] = useState({
    categories: [],
    shippedFrom: [],
    shippedTo: [],
  });

  // Kirim filter ke parent ketika berubah
  const handleMobileFilterChange = (filters) => {
    setMobileFilters(filters);
    onFilterChange(filters);
  };

  // Reset filters ketika modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setMobileFilters({
        categories: [],
        shippedFrom: [],
        shippedTo: [],
      });
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  const [headerHeight, setHeaderHeight] = useState(64);

  useEffect(() => {
    const headerEl = document.querySelector("header");
    if (headerEl) setHeaderHeight(headerEl.offsetHeight);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`absolute left-0 w-full max-h-[80%] bg-white rounded-t-2xl shadow-xl
                    transform transition-transform ${
                      isOpen ? "translate-y-0" : "translate-y-full"
                    }`}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Tombol Close */}
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="p-2">
            <FaTimes size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 max-h-[calc(80vh-80px)]">
          {/* Kirim callback untuk auto-close */}
          <SidebarFilters 
            onFilterChange={handleMobileFilterChange}
            onMobileCategoryClick={onClose} // Callback untuk auto-close
          />
        </div>

      </div>
    </div>
  );
}