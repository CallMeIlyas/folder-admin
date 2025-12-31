import { useState } from "react";
import type { FC } from "react";
import { FaChevronDown } from "react-icons/fa";
import SplitBorder from "./SplitBorder";
import { useTranslation } from "react-i18next";

interface SidebarFiltersProps {
  onFilterChange: (filters: {
    categories?: string[];
    shippedFrom?: string[];
    shippedTo?: string[];
  }) => void;
  onMobileCategoryClick?: () => void;
}

const SidebarFilters: FC<SidebarFiltersProps> = ({ 
  onFilterChange, 
  onMobileCategoryClick 
}) => {
  const { t } = useTranslation();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedShippedFrom, setSelectedShippedFrom] = useState<Set<string>>(new Set());
  const [selectedShippedTo, setSelectedShippedTo] = useState<Set<string>>(new Set());

  // ===== UI CONFIGURATION =====
  const categoryConfig = [
    {
      value: "3D Frame",
      label: t("side.categories.3d"),
      subcategories: ["12R", "10R", "8R", "20x20cm", "6R", "15x15cm", "4R", "A2", "A1", "A0"]
    },
    {
      value: "2D Frame",
      label: t("side.categories.2d"),
      subcategories: []
    },
    {
      value: "Additional",
      label: t("side.categories.additional"),
      subcategories: ["BACKGROUND CUSTOM", "BIAYA TAMBAHAN WAJAH KARIKATUR"]
    },
    {
      value: "Acrylic Stand",
      label: t("side.categories.acrylic"),
      subcategories: ["2CM", "3MM"]
    },
    {
      value: "Softcopy Design",
      label: t("side.categories.softcopy"),
      subcategories: ["WITH BACKGROUND CATALOG", "WITH BACKGROUND CUSTOM", "WITHOUT BACKGROUND"]
    }
  ];

  // ===== SIMPLE TOGGLE LOGIC =====
  const toggleExpanded = (categoryValue: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      newSet.has(categoryValue) ? newSet.delete(categoryValue) : newSet.add(categoryValue);
      return newSet;
    });
  };

  const toggleCategory = (categoryValue: string, checked: boolean) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      
      if (checked) {
        // Tambah category
        next.add(categoryValue);
      } else {
        // Hapus category dan semua subcategory-nya
        next.delete(categoryValue);
        
        // Hapus semua subcategory yang dimulai dengan category ini
        Array.from(next).forEach((value) => {
          if (value.startsWith(`${categoryValue}/`)) {
            next.delete(value);
          }
        });
      }
      
      // Kirim filter ke parent
      onFilterChange({
        categories: Array.from(next),
        shippedFrom: Array.from(selectedShippedFrom),
        shippedTo: Array.from(selectedShippedTo)
      });
      
      return next;
    });
  };

  const toggleShippedFrom = (value: string, checked: boolean) => {
    setSelectedShippedFrom((prev) => {
      const next = new Set(prev);
      checked ? next.add(value) : next.delete(value);
      
      onFilterChange({
        categories: Array.from(selectedCategories),
        shippedFrom: Array.from(next),
        shippedTo: Array.from(selectedShippedTo)
      });
      
      return next;
    });
  };

  const toggleShippedTo = (value: string, checked: boolean) => {
    setSelectedShippedTo((prev) => {
      const next = new Set(prev);
      checked ? next.add(value) : next.delete(value);
      
      onFilterChange({
        categories: Array.from(selectedCategories),
        shippedFrom: Array.from(selectedShippedFrom),
        shippedTo: Array.from(next)
      });
      
      return next;
    });
  };

  // ===== DESKTOP LAYOUT =====
  const DesktopLayout = () => (
    <aside className="hidden md:block w-64 p-6 bg-white rounded-xl">
      <SplitBorder />
      <div className="mb-8">
        <h3 className="font-nataliecaydence text-xl font-light mb-4 ml-4">
          {t("side.category")}
        </h3>

        {categoryConfig.map(({ value, label, subcategories }) => {
          const isExpanded = expandedCategories.has(value);
          const hasSubcategories = subcategories.length > 0;
          const isMainSelected = selectedCategories.has(value);

          return (
            <div key={value} className="mb-2">
              <div className="font-poppinsRegular flex items-center gap-2 mb-2 ml-6">
                <input
                  type="checkbox"
                  checked={isMainSelected}
                  onChange={(e) => toggleCategory(value, e.target.checked)}
                  className="appearance-none w-4 h-4 border border-black rounded-sm
                             cursor-pointer transition-all duration-200 relative
                             checked:bg-white checked:border-black
                             after:content-[''] after:absolute after:hidden checked:after:block
                             after:w-[6px] after:h-[10px]
                             after:border-r-[2px] after:border-b-[2px]
                             after:border-black after:top-[0px] after:left-[5px]
                             after:rotate-45"
                />
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategory(value, !isMainSelected);
                  }}
                  className="text-sm cursor-pointer hover:text-primary flex-1"
                >
                  {label}
                </div>

                {hasSubcategories && (
                  <button
                    onClick={() => toggleExpanded(value)}
                    className="text-gray-500 hover:text-primary"
                  >
                    <FaChevronDown
                      size={12}
                      className={`transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </div>

              {isExpanded && hasSubcategories && (
                <div className="ml-10 space-y-2">
                  {subcategories.map((subcatValue) => {
                    const subcategoryFullValue = `${value}/${subcatValue}`;
                    const isSubSelected = selectedCategories.has(subcategoryFullValue);

                    return (
                      <div key={subcategoryFullValue} className="font-poppinsRegular flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSubSelected}
                          onChange={(e) => toggleCategory(subcategoryFullValue, e.target.checked)}
                          className="appearance-none relative w-4 h-4 min-w-[16px] min-h-[16px] aspect-square 
                                     border border-black rounded-[3px] cursor-pointer flex-shrink-0
                                     checked:bg-white checked:border-black transition-all duration-200
                                     after:content-[''] after:absolute after:hidden checked:after:block
                                     after:w-[5px] after:h-[9px]
                                     after:border-r-[2px] after:border-b-[2px]
                                     after:border-black after:top-[1px] after:left-[4px] after:rotate-45"
                        />
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategory(subcategoryFullValue, !isSubSelected);
                          }}
                          className="text-sm cursor-pointer hover:text-primary"
                        >
                          {subcatValue}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SplitBorder />
      <div className="mb-8">
        <h3 className="font-nataliecaydence text-xl font-light mb-4 ml-4">
          {t("side.shippedFrom")}
        </h3>
        {["Bogor", "Jakarta"].map((item) => (
          <div key={item} className="font-poppinsRegular flex items-center gap-2 mb-3 ml-6">
            <input
              type="checkbox"
              checked={selectedShippedFrom.has(item)}
              onChange={(e) => toggleShippedFrom(item, e.target.checked)}
              className="appearance-none w-4 h-4 border border-black rounded-sm
                         cursor-pointer transition-all duration-200 relative
                         checked:bg-white checked:border-black
                         after:content-[''] after:absolute after:hidden checked:after:block
                         after:w-[6px] after:h-[10px]
                         after:border-r-[2px] after:border-b-[2px]
                         after:border-black after:top-[0px] after:left-[5px]
                         after:rotate-45"
            />
            <div
              onClick={(e) => {
                e.stopPropagation();
                toggleShippedFrom(item, !selectedShippedFrom.has(item));
              }}
              className="text-sm cursor-pointer hover:text-primary"
            >
              {item}
            </div>
          </div>
        ))}
      </div>

      <SplitBorder />
      <div className="mb-8">
        <h3 className="font-nataliecaydence text-xl font-light mb-4 ml-4">
          {t("side.shippedTo")}
        </h3>
        {["Worldwide"].map((dest) => (
          <div key={dest} className="font-poppinsRegular flex items-center gap-2 mb-3 ml-6">
            <input
              type="checkbox"
              checked={selectedShippedTo.has(dest)}
              onChange={(e) => toggleShippedTo(dest, e.target.checked)}
              className="appearance-none w-4 h-4 border border-black rounded-sm
                         cursor-pointer transition-all duration-200 relative
                         checked:bg-white checked:border-black
                         after:content-[''] after:absolute after:hidden checked:after:block
                         after:w-[6px] after:h-[10px]
                         after:border-r-[2px] after:border-b-[2px]
                         after:border-black after:top-[0px] after:left-[5px]
                         after:rotate-45"
            />
            <div
              onClick={(e) => {
                e.stopPropagation();
                toggleShippedTo(dest, !selectedShippedTo.has(dest));
              }}
              className="text-sm cursor-pointer hover:text-primary"
            >
              {t(`side.to.${dest.toLowerCase()}`)}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );

  // ===== MOBILE LAYOUT =====
  const MobileLayout = () => (
    <aside className="block md:hidden w-full p-4 bg-white rounded-xl">
      <SplitBorder />
      <div className="mb-6">
        <h3 className="font-nataliecaydence text-lg font-light mb-4 ml-2">
          {t("side.category")}
        </h3>
  
        {categoryConfig.map(({ value, label }) => {
          const isMainSelected = selectedCategories.has(value);
          
          return (
            <div key={value} className="mb-2">
              <div 
                className="font-poppinsRegular flex items-center gap-2 mb-2 ml-4 cursor-pointer hover:text-primary transition-colors"
                onClick={() => {
                  toggleCategory(value, !isMainSelected);
                  if (onMobileCategoryClick) {
                    setTimeout(() => onMobileCategoryClick(), 100);
                  }
                }}
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isMainSelected}
                    readOnly
                    className="appearance-none w-4 h-4 border border-black rounded-sm
                               cursor-pointer transition-all duration-200 relative
                               checked:bg-white checked:border-black
                               after:content-[''] after:absolute after:hidden checked:after:block
                               after:w-[6px] after:h-[10px]
                               after:border-r-[2px] after:border-b-[2px]
                               after:border-black after:top-[0px] after:left-[5px]
                               after:rotate-45"
                  />
                </div>
                <div className="text-sm cursor-pointer hover:text-primary flex-1 py-1">
                  {label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
  
      <SplitBorder />
      <div className="mb-6">
        <h3 className="font-nataliecaydence text-lg font-light mb-4 ml-2">
          {t("side.shippedTo")}
        </h3>
        {["Worldwide"].map((dest) => {
          const isSelected = selectedShippedTo.has(dest);
          return (
            <div
              key={dest}
              className="font-poppinsRegular flex items-center gap-2 mb-3 ml-4 cursor-pointer hover:text-primary transition-colors"
              onClick={() => {
                toggleShippedTo(dest, !isSelected);
                if (onMobileCategoryClick) {
                  setTimeout(() => onMobileCategoryClick(), 100);
                }
              }}
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="appearance-none w-4 h-4 border border-black rounded-sm
                             cursor-pointer transition-all duration-200 relative
                             checked:bg-white checked:border-black
                             after:content-[''] after:absolute after:hidden checked:after:block
                             after:w-[6px] after:h-[10px]
                             after:border-r-[2px] after:border-b-[2px]
                             after:border-black after:top-[0px] after:left-[5px]
                             after:rotate-45"
                />
              </div>
              <div className="text-sm cursor-pointer hover:text-primary py-1">
                {t(`side.to.${dest.toLowerCase()}`)}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );

  return (
    <>
      <DesktopLayout />
      <MobileLayout />
    </>
  );
};

export default SidebarFilters;