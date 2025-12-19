import { useState } from "react";
import type { FC } from "react";
import { FaChevronDown } from "react-icons/fa";
import SplitBorder from "./SplitBorder";
import type { FilterOptions } from "../../types/types";
import { useTranslation } from "react-i18next";

interface SidebarFiltersProps {
  onFilterChange: React.Dispatch<React.SetAction<FilterOptions>>;
  onMobileCategoryClick?: () => void;
}

const SidebarFilters: FC<SidebarFiltersProps> = ({ 
  onFilterChange, 
  onMobileCategoryClick 
}) => {
  const { t } = useTranslation();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedMainCategories, setSelectedMainCategories] = useState<Set<string>>(new Set());
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<string>>(new Set());
  const [selectedShippedFrom, setSelectedShippedFrom] = useState<Set<string>>(new Set());
  const [selectedShippedTo, setSelectedShippedTo] = useState<Set<string>>(new Set());

  // ===== MAPPING UNTUK FILTER =====
  // Mapping UI → Category (sesuai dengan product data loader)
  const uiToCategoryMap: Record<string, string> = {
    [t("side.categories.3d")]: "3D Frame",
    [t("side.categories.2d")]: "2D Frame", 
    [t("side.categories.additional")]: "Additional",
    [t("side.categories.acrylic")]: "Acrylic Stand",
    [t("side.categories.softcopy")]: "Softcopy Design",
  };

  // 3D subcategories → Product name
  const threeDSizeToNameMap: Record<string, string> = {
    "12R": "12R",
    "10R": "10R", 
    "8R": "8R",
    "20x20cm": "20X20CM",
    "6R": "6R", 
    "15x15cm": "15X15CM",
    "4R": "4R",
    "A2": "A2-40X55CM",
    "A1": "A1-55X80CM",
    "A0": "A0-80X110CM"
  };

  // 2D subcategories → Product name
  const twoDSizeToNameMap: Record<string, string> = {
    "12R": "12R",
    "15cm": "15cm",
    "4R": "4R", 
    "6R": "6R",
    "8R": "8R"
  };

  // Other subcategories → Product name
  const otherSubcategoryToNameMap: Record<string, Record<string, string>> = {
    [t("side.categories.additional")]: {
      [t("side.subcategories.backgroundCustom") || "Background Custom"]: "BACKGROUND CUSTOM",
      [t("side.subcategories.additionalFaces") || "Additional Faces"]: "BIAYA TAMBAHAN WAJAH KARIKATUR",
    },
    [t("side.categories.acrylic")]: {
      [t("side.subcategories.2cm") || "2CM"]: "2CM",
      [t("side.subcategories.3mm") || "3MM"]: "3MM",
    },
    [t("side.categories.softcopy")]: {
      [t("side.subcategories.backgroundCatalog") || "With Background Catalog"]: "WITH BACKGROUND CATALOG",
      [t("side.subcategories.backgroundCustomSoftcopy") || "With Background Custom"]: "WITH BACKGROUND CUSTOM", 
      [t("side.subcategories.withoutBackground") || "Without Background"]: "WITHOUT BACKGROUND"
    }
  };

  // ===== UI CONFIGURATION =====
  const customCategories = {
    [t("side.categories.3d")]: [
      "12R",
      "10R", 
      "8R",
      "20x20cm",
      "6R",
      "15x15cm",
      "4R",
      "A2",
      "A1",
      "A0"
    ],
    [t("side.categories.2d")]: [
    ],
    
    [t("side.categories.additional")]: [
      t("side.subcategories.backgroundCustom") || "Background Custom",
      t("side.subcategories.additionalFaces") || "Additional Faces"
    ],
    [t("side.categories.acrylic")]: [
      t("side.subcategories.2cm") || "2CM",
      t("side.subcategories.3mm") || "3MM"
    ],
    [t("side.categories.softcopy")]: [
      t("side.subcategories.backgroundCatalog") || "With Background Catalog",
      t("side.subcategories.backgroundCustomSoftcopy") || "With Background Custom",
      t("side.subcategories.withoutBackground") || "Without Background"
    ]
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      newSet.has(category) ? newSet.delete(category) : newSet.add(category);
      return newSet;
    });
  };

  // ===== FILTER LOGIC =====
  const handleMainCategoryChange = (category: string, isChecked: boolean) => {
    const mappedCategory = uiToCategoryMap[category];
    
    setSelectedMainCategories((prev) => {
      const newSet = new Set(prev);
      isChecked ? newSet.add(category) : newSet.delete(category);
      return newSet;
    });
    
    onFilterChange((prev) => {
      const newCategories = isChecked
        ? [...prev.categories, mappedCategory]
        : prev.categories.filter((cat) => cat !== mappedCategory);
      return { ...prev, categories: newCategories };
    });
  };

  const handleMainCategoryChangeMobile = (category: string, isChecked: boolean) => {
    handleMainCategoryChange(category, isChecked);
    
    if (onMobileCategoryClick) {
      setTimeout(() => onMobileCategoryClick(), 100);
    }
  };

  const handleSubcategoryChange = (
    mainCategory: string,
    subcategory: string,
    isChecked: boolean
  ) => {
    const mappedCategory = uiToCategoryMap[mainCategory];
    let productName: string;
    
    if (mappedCategory === "3D Frame") {
      productName = threeDSizeToNameMap[subcategory] || subcategory;
    } 
    else if (mappedCategory === "2D Frame") {
      productName = twoDSizeToNameMap[subcategory] || subcategory;
    }
    else {
      const map = otherSubcategoryToNameMap[mainCategory];
      productName = map ? map[subcategory] || subcategory : subcategory;
    }
    
    // Format: "Category/ProductName" untuk filter
    const filterKey = `${mappedCategory}/${productName}`;
    const displayKey = `${mainCategory}/${subcategory}`;

    setSelectedSubcategories((prev) => {
      const newSet = new Set(prev);
      isChecked ? newSet.add(displayKey) : newSet.delete(displayKey);
      return newSet;
    });

    onFilterChange((prev) => {
      const newCategories = isChecked
        ? [...prev.categories, filterKey]
        : prev.categories.filter((cat) => cat !== filterKey);
      return { ...prev, categories: newCategories };
    });
  };

  const handleShippedFromChange = (location: string, isChecked: boolean) => {
    setSelectedShippedFrom((prev) => {
      const newSet = new Set(prev);
      isChecked ? newSet.add(location) : newSet.delete(location);
      return newSet;
    });

    onFilterChange((prev) => {
      const newShippedFrom = isChecked
        ? [...prev.shippedFrom, location]
        : prev.shippedFrom.filter((loc) => loc !== location);
      return { ...prev, shippedFrom: newShippedFrom };
    });
  };

  const handleShippedToChange = (destination: string, isChecked: boolean) => {
    setSelectedShippedTo((prev) => {
      const newSet = new Set(prev);
      isChecked ? newSet.add(destination) : newSet.delete(destination);
      return newSet;
    });

    onFilterChange((prev) => {
      const newShippedTo = isChecked
        ? [...prev.shippedTo, destination]
        : prev.shippedTo.filter((dest) => dest !== destination);
      return { ...prev, shippedTo: newShippedTo };
    });
  };

  const handleShippedToChangeMobile = (destination: string, isChecked: boolean) => {
    handleShippedToChange(destination, isChecked);
    
    if (onMobileCategoryClick) {
      setTimeout(() => onMobileCategoryClick(), 100);
    }
  };

  // ===== COMPONENT RENDERING =====
  const DesktopLayout = () => (
    <aside className="hidden md:block w-64 p-6 bg-white rounded-xl">
      <SplitBorder />
      <div className="mb-8">
        <h3 className="font-nataliecaydence text-xl font-light mb-4 ml-4">
          {t("side.category")}
        </h3>

        {Object.entries(customCategories).map(([mainCategory, subcategories]) => {
          const isExpanded = expandedCategories.has(mainCategory);
          const hasSubcategories = subcategories.length > 0;

          return (
            <div key={mainCategory} className="mb-2">
              <div className="font-poppinsRegular flex items-center gap-2 mb-2 ml-6">
                <input
                  type="checkbox"
                  id={`desktop-${mainCategory.toLowerCase().replace(/\s+/g, "-")}`}
                  checked={selectedMainCategories.has(mainCategory)}
                  onChange={(e) =>
                    handleMainCategoryChange(mainCategory, e.target.checked)
                  }
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
                    handleMainCategoryChange(mainCategory, !selectedMainCategories.has(mainCategory));
                  }}
                  className="text-sm cursor-pointer hover:text-primary flex-1"
                >
                  {mainCategory}
                </div>

                {hasSubcategories && (
                  <button
                    onClick={() => toggleCategory(mainCategory)}
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
                  {subcategories.map((subcat) => {
                    const displayKey = `${mainCategory}/${subcat}`;
                    const isChecked = selectedSubcategories.has(displayKey);

                    return (
                      <div key={displayKey} className="font-poppinsRegular flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`desktop-${displayKey.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-")}`}
                          checked={isChecked}
                          onChange={(e) =>
                            handleSubcategoryChange(mainCategory, subcat, e.target.checked)
                          }
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
                            handleSubcategoryChange(mainCategory, subcat, !isChecked);
                          }}
                          className="text-sm cursor-pointer hover:text-primary"
                        >
                          {subcat}
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
          <div
            key={item}
            className="font-poppinsRegular flex items-center gap-2 mb-3 ml-6"
          >
            <input
              type="checkbox"
              id={`desktop-from-${item.toLowerCase()}`}
              checked={selectedShippedFrom.has(item)}
              onChange={(e) => handleShippedFromChange(item, e.target.checked)}
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
                handleShippedFromChange(item, !selectedShippedFrom.has(item));
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
          <div
            key={dest}
            className="font-poppinsRegular flex items-center gap-2 mb-3 ml-6"
          >
            <input
              type="checkbox"
              id={`desktop-to-${dest.toLowerCase()}`}
              checked={selectedShippedTo.has(dest)}
              onChange={(e) => handleShippedToChange(dest, e.target.checked)}
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
                handleShippedToChange(dest, !selectedShippedTo.has(dest));
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

  const MobileLayout = () => (
    <aside className="block md:hidden w-full p-4 bg-white rounded-xl">
      <SplitBorder />
      <div className="mb-6">
        <h3 className="font-nataliecaydence text-lg font-light mb-4 ml-2">
          {t("side.category")}
        </h3>
  
        {Object.entries(customCategories).map(([mainCategory, subcategories]) => {
          const isMainCategorySelected = selectedMainCategories.has(mainCategory);
          
          return (
            <div key={mainCategory} className="mb-2">
              <div 
                className="font-poppinsRegular flex items-center gap-2 mb-2 ml-4 cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleMainCategoryChangeMobile(mainCategory, !isMainCategorySelected)}
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    id={`mobile-${mainCategory.toLowerCase().replace(/\s+/g, "-")}`}
                    checked={isMainCategorySelected}
                    onChange={() => {}}
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
                  {mainCategory}
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
              onClick={() => handleShippedToChangeMobile(dest, !isSelected)}
            >
              <div className="relative">
                <input
                  type="checkbox"
                  id={`mobile-to-${dest.toLowerCase()}`}
                  checked={isSelected}
                  onChange={() => {}}
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