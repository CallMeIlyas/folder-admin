import type { FC } from "react";
import { useState } from "react";
import { FaChevronDown, FaFilter } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface SortControlsProps {
  sortOption?: string;
  onSortChange: (option: string) => void;
  onOpenFilters?: () => void; 
}

const SortControls: FC<SortControlsProps> = ({ 
  sortOption = "all", 
  onSortChange,
  onOpenFilters 
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const options = [
    { label: t("sortBg.all"), value: "all" },
    { label: t("sortBg.asc"), value: "name-asc" },
    { label: t("sortBg.disc"), value: "name-desc" },
  ];

  const handleSelect = (value: string) => {
    onSortChange(value);
    setOpen(false);
  };

  const getCurrentLabel = () => {
    const current = options.find(opt => opt.value === sortOption);
    return current ? current.label : t("sortBg.all");
  };

  return (
    <div className="bg-[#f0f0f0] px-4 py-3 rounded-xl mb-3">

      {/* DESKTOP: layout horizontal */}
      <div className="hidden md:flex flex-wrap items-center gap-4 sm:gap-6 md:gap-8 text-sm font-poppinsBold text-black">

        <span className="whitespace-nowrap">{t("sortBg.sortby")}</span>

        {/* Frequently Used */}
        <button
          onClick={() =>
            onSortChange(sortOption === "frequently-used" ? "all" : "frequently-used")
          }
          className={`px-4 py-2 rounded-full text-sm border transition ${
            sortOption === "frequently-used"
              ? "bg-black text-white border-black shadow-sm"
              : "bg-white text-gray-700 border-gray-300 hover:border-black hover:text-black"
          }`}
        >
          {t("sortBg.frequentlyused")}
        </button>
      
        {/* Rarely Used */}
        <button
          onClick={() =>
            onSortChange(sortOption === "rarely-used" ? "all" : "rarely-used")
          }
          className={`px-4 py-2 rounded-full text-sm border transition ${
            sortOption === "rarely-used"
              ? "bg-black text-white border-black shadow-sm"
              : "bg-white text-gray-700 border-gray-300 hover:border-black hover:text-black"
          }`}
        >
          {t("sortBg.rarelyused")}
        </button>

        {/* Dropdown Sort */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="font-poppinsBold flex items-center justify-between px-4 py-2 w-40 text-sm bg-white rounded-full border border-gray-300 hover:border-black"
          >
            <span>{getCurrentLabel()}</span>
            <FaChevronDown
              size={14}
              className={`ml-2 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div className="absolute mt-1 w-40 bg-white rounded-md shadow-lg border z-50 overflow-hidden">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`block w-full px-4 py-2 text-left hover:bg-gray-200 ${
                    sortOption === option.value ? "bg-gray-200 font-semibold" : ""
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* MOBILE: layout vertikal dengan tombol filter */}
      <div className="flex flex-col md:hidden gap-3 text-sm font-poppinsBold text-black">

        {/* Baris pertama: "Sort by" */}
        <span className="">{t("sortBg.sortby")}</span>

        {/* Tombol Filter - full width */}
        {onOpenFilters && (
          <div className="relative w-full">
            <button
              onClick={onOpenFilters}
              className="font-poppinsBold flex items-center justify-center px-4 py-2 w-full text-sm bg-white rounded-full border border-gray-300"
            >
              <span className="text-center text-[15px] translate-x-2.5 flex-1">Filter</span>
              <FaFilter
                size={12}
                className="ml-2"
              />
            </button>
          </div>
        )}
        
        {/* Dropdown Sort */}
        <div className="relative w-full">
          <button
            onClick={() => setOpen(!open)}
            className="font-poppinsBold flex items-center justify-center px-4 py-2 w-full text-sm bg-white rounded-full border border-gray-300 relative"
          >
            <span className="text-center absolute left-0 right-0 mx-auto">
              {getCurrentLabel()}
            </span>
            <FaChevronDown
              size={14}
              className={`ml-auto transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        
          {open && (
            <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg border z-50 overflow-hidden">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`block w-full px-4 py-2 text-center hover:bg-gray-100 ${
                    sortOption === option.value ? "bg-gray-200 font-semibold" : ""
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SortControls;