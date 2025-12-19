import type { FC } from "react";
import { useState } from "react";
import SplitBorder from "./SplitBorder";
import type { FilterOptions } from "../../types/types";
import { useTranslation } from "react-i18next";

interface SidebarFiltersProps {
  onFilterChange: React.Dispatch<React.SetStateAction<FilterOptions>>;
  onMobileCategoryClick?: () => void; 
}

const SidebarFilters: FC<SidebarFiltersProps> = ({ 
  onFilterChange, 
  onMobileCategoryClick 
}) => {
  const { t } = useTranslation();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  const handleCheckboxChange = (
    value: string,
    isChecked: boolean
  ) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(value);
      } else {
        newSet.delete(value);
      }
      return newSet;
    });

    onFilterChange((prev) => {
      const newFilters = { ...prev };

      if (isChecked) {
        newFilters.categories = [...newFilters.categories, value];
      } else {
        newFilters.categories = newFilters.categories.filter((item) => item !== value);
      }

      return newFilters;
    });

    // Auto-close untuk mobile
    if (onMobileCategoryClick) {
      setTimeout(() => onMobileCategoryClick(), 100);
    }
  };

  const categories = [
    "Company/Office/Brand",
    "Goverment/Police",
    "Oil/Construction/Ship",
    "Hospital/Medical",
    "Graduation/School/Children",
    "Couple/Wedding/Birthday",
    "Travel/Place/Country/Culture",
    "Indoor/Cafe/Kitchen",
    "Sport",
    "Others",
    "Pop Up Photos",
    "Acrylic Stand"
  ];

  return (
    <aside className="w-full md:w-64 p-4 md:p-6 bg-white rounded-xl">
      {/* Category */}
      <SplitBorder />
      <div className="mb-6 md:mb-8">
        <h3 className="font-nataliecaydence text-lg md:text-xl font-light mb-3 md:mb-4 md:ml-4">{t("sideBg.category")}</h3>
        
        {/* MOBILE: Grid layout */}
        <div className="md:hidden grid grid-cols-1 gap-2">
          {categories.map((item) => {
            const isChecked = selectedCategories.has(item);
            return (
              <div 
                key={item} 
                className="font-poppinsRegular flex items-start gap-2 cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleCheckboxChange(item, !isChecked)}
              >
                <div className="relative shrink-0">
                  <input
                    type="checkbox"
                    id={`mobile-${item.toLowerCase().replace(/\s+/g, "-")}`}
                    checked={isChecked}
                    onChange={() => {}}
                    className="
                      w-4 h-4 border border-black rounded-sm
                      appearance-none cursor-pointer
                      checked:bg-white checked:border-black
                      relative transition-all duration-200
                      after:hidden checked:after:block
                      after:w-[6px] after:h-[10px]
                      after:border-r-[2px] after:border-b-[2px]
                      after:border-black after:absolute
                      after:top-[0px] after:left-[5px]
                      after:rotate-45
                    "
                  />
                </div>
                <div className="text-sm flex-1 leading-tight py-0.5">
                  {item}
                </div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP: Original layout */}
        <div className="hidden md:block">
          {categories.map((item) => {
            const isChecked = selectedCategories.has(item);
            return (
              <div 
                key={item} 
                className="font-poppinsRegular flex items-start gap-2 mb-3 ml-6 cursor-pointer hover:text-primary"
                onClick={() => handleCheckboxChange(item, !isChecked)}
              >
                <div className="relative shrink-0">
                  <input
                    type="checkbox"
                    id={`desktop-${item.toLowerCase().replace(/\s+/g, "-")}`}
                    checked={isChecked}
                    onChange={() => {}} 
                    className="
                      w-4 h-4 border border-black rounded-sm
                      appearance-none cursor-pointer
                      checked:bg-white checked:border-black
                      relative transition-all duration-200
                      after:hidden checked:after:block
                      after:w-[6px] after:h-[10px]
                      after:border-r-[2px] after:border-b-[2px]
                      after:border-black after:absolute
                      after:top-[0px] after:left-[5px]
                      after:rotate-45
                    "
                  />
                </div>
                <div className="text-sm flex-1 leading-tight py-0.5">
                  {item}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default SidebarFilters;