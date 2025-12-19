import { useMemo } from "react";  
import type { FilterOptions } from "../types/types";  
  
interface Product {  
  id: string;  
  imageUrl: string;  
  name: string;  
  displayName?: string;
  size: string;  
  category: string;  
  subcategory: string | null;  
  fullPath: string;  
  price: number;  
  shippedFrom: string[];  
  shippedTo: string[];  
  allImages?: string[];  
}
  
const normalize = (str: string) =>  
  str.toLowerCase().replace(/[^a-z0-9]/g, "");

const locationCategories: Record<string, string[]> = {
  "Bogor": ["4R", "15cm", "6R", "20cm", "8R", "10R", "12R", "A2", "A1", "A0"],
  "Jakarta": ["4R", "15cm", "6R", "8R", "10R", "12R"],
  "Worldwide": ["4R", "15cm", "6R", "20cm", "8R", "10R", "12R", "A2", "A1", "A0"]
};

const categoryMapping: Record<string, string> = {
  "4R": "4R",
  "15cm": "15cm", 
  "6R": "6R",
  "8R": "8R",
  "10R": "10R",
  "12R": "12R",
  "12R by AI": "12R",
  "15X15CM": "15cm",
  "20X20CM": "20cm",
  "A0-80X110CM": "A0",
  "A1-55X80CM": "A1", 
  "A2-40X55CM": "A2",
  "15x15cm": "15cm",
  "20x20cm": "20cm",
  "a0-80x110cm": "A0",
  "a1-55x80cm": "A1",
  "a2-40x55cm": "A2"
};

const normalizeCategoryForLocation = (subcategory: string | null): string => {
  if (!subcategory) return "";
  
  const mapped = categoryMapping[subcategory];
  if (mapped) {
    return mapped.toLowerCase();
  }
  
  const lowerSub = subcategory.toLowerCase();
  for (const [key, value] of Object.entries(categoryMapping)) {
    if (key.toLowerCase() === lowerSub) {
      return value.toLowerCase();
    }
  }
  
  return lowerSub;
};

const isProductAvailableInLocation = (product: Product, location: string): boolean => {
  const availableCategories = locationCategories[location] || [];
  const productCategory = normalizeCategoryForLocation(product.subcategory);
  
  const isAvailable = availableCategories.some(availableCat => 
    availableCat.toLowerCase() === productCategory
  );
  
  return isAvailable;
};  

const parseUrlParams = (urlParamsString?: string) => {
  const params = new URLSearchParams(urlParamsString || "");
  
  const result = {
    search: params.get("search") || "",
    type: params.get("type") || "",
    size: params.get("size") || "",
    category: params.get("category") || "",
    exclude: params.get("exclude") || "",
    special_filter: params.get("special_filter") || ""
  };
  
  return result;
};

const keywordToCategoryMapping: Record<string, string[]> = {
  'karikatur': ['2D Frame', '3D Frame'],
  'caricature': ['2D Frame', '3D Frame'],
  'pop up frame': ['3D Frame'],
  'frame': ['2D Frame', '3D Frame'],
  'bingkai': ['2D Frame', '3D Frame'],
  'foto': ['2D Frame', '3D Frame'],
  'acrylic': ['Acrylic Stand', '3D Frame'],
  'standee': ['Acrylic Stand'],
  'acrylic stand': ['Acrylic Stand'],
  'plakat': ['Acrylic Stand'],
  'softcopy': ['Softcopy Design'],
  'desain aja': ['Softcopy Design'],
  'desain': ['Softcopy Design'],
  'desain saja': ['Softcopy Design'],
  'tambahan wajah': ['Additional'],
  'tambahan': ['Additional'],
  'additional': ['Additional'],
  'kado': ['2D Frame', '3D Frame', 'Acrylic Stand'],
  'hadiah': ['2D Frame', '3D Frame', 'Acrylic Stand'],
  'hampers': ['2D Frame', '3D Frame', 'Acrylic Stand'],
  '2d': ['2D Frame'],
  '2d frame': ['2D Frame'],
  '3d': ['3D Frame'],
  '3d frame': ['3D Frame'],
  'kaca': ['2D Frame', '3D Frame'],
  'a2': ['3D Frame'],
  'a1': ['3D Frame'],
  'a0': ['3D Frame'],
};

const SPECIAL_KEYWORDS = [
  'acrylic', 'standee', 'acrylic stand', 'plakat',
  'a2', 'a1', 'a0',
  '2d', '2d frame', '3d', '3d frame',
  'kaca', 'bingkai', 'frame',
  'karikatur', 'caricature', 'pop up frame', 'foto',
  'softcopy', 'desain aja', 'desain', 'desain saja',
  'tambahan wajah', 'tambahan', 'additional',
  'kado', 'hadiah', 'hampers',
];

const PRODUCT_NAME_SEARCH: Record<string, { category?: string[], exactMatch?: boolean }> = {
  '10r': { category: ['3D Frame'] },
  '12r': { category: ['2D Frame', '3D Frame'] },
  '12r by ai': { category: ['3D Frame'], exactMatch: true },
  '15x15cm': { category: ['3D Frame'] },
  '20x20cm': { category: ['3D Frame'] },
  '4r': { category: ['2D Frame', '3D Frame'] },
  '6r': { category: ['2D Frame', '3D Frame'] },
  '8r': { category: ['2D Frame', '3D Frame'] },
  'a0-80x110cm': { category: ['3D Frame'] },
  'a1-55x80cm': { category: ['3D Frame'] },
  'a2-40x55cm': { category: ['3D Frame'] },
  '15cm': { category: ['2D Frame'] },
  '2cm': { category: ['Acrylic Stand'] },
  '3mm': { category: ['Acrylic Stand'] },
  'with background catalog': { category: ['Softcopy Design'], exactMatch: true },
  'with background custom': { category: ['Softcopy Design'], exactMatch: true },
  'without background': { category: ['Softcopy Design'], exactMatch: true },
  'biaya ekspress': { category: ['Additional'] },
  'ekspress': { category: ['Additional'] },
  'background custom': { category: ['Additional'] },
  'ganti frame': { category: ['Additional'] },
  'tambahan packing': { category: ['Additional'] },
  'tambahan lainnya': { category: ['Additional'] },
  'pose custom': { category: ['Additional'] },
  'gradasi': { category: ['Additional'] },
  'foto asli': { category: ['Additional'] },
  'bold shading': { category: ['Additional'] },
};
  
export const useProductFilter = (  
  allProducts: Product[],  
  filters: FilterOptions,  
  searchQuery: string,
  urlParamsString?: string
) => {  
  const filteredProducts = useMemo(() => {  
    const urlParams = parseUrlParams(urlParamsString);
    const effectiveSearch = urlParams.search || searchQuery;
    
    let result = [...allProducts];
    
    if (urlParams.special_filter === 'acrylic_plus_a_frames') {
      result = result.filter(product => {
        const productCategory = product.category.toLowerCase();
        const productSize = product.size.toLowerCase();
        const productName = product.name.toLowerCase();
        const productSubcategory = product.subcategory?.toLowerCase() || '';
        
        if (productCategory === 'acrylic stand') {
          return true;
        }
        
        if (productCategory.includes('3d') || productCategory === '3d frame' || productCategory === '3D Frame') {
          const isSizeA = 
            productSize.includes('a2') || productSize.includes('a1') || productSize.includes('a0') ||
            productName.includes('a2') || productName.includes('a1') || productName.includes('a0') ||
            productSubcategory.includes('a2') || productSubcategory.includes('a1') || productSubcategory.includes('a0');
          
          return isSizeA;
        }
        
        return false;
      });
      
      return result;
    }
    
    if (urlParams.type) {
      const types = urlParams.type.split(",").map(t => t.trim().toLowerCase());
      
      result = result.filter(product => {
        const productCategory = product.category.toLowerCase();
        const productName = product.name.toLowerCase();
        const productSubcategory = product.subcategory?.toLowerCase() || '';
        
        return types.some(type => {
          if (type === '2d' || type === '2d frame') {
            return (
              productCategory.includes('2d') ||
              productCategory.includes('2d frame') ||
              productCategory === '2d frame' ||
              productName.includes('2d') ||
              productSubcategory.includes('2d') ||
              productCategory === '2D Frame' ||
              productCategory.includes('2D')
            );
          }
          if (type === '3d' || type === '3d frame') {
            return (
              productCategory.includes('3d') ||
              productCategory.includes('3d frame') ||
              productCategory === '3d frame' ||
              productName.includes('3d') ||
              productSubcategory.includes('3d') ||
              productCategory === '3D Frame' ||
              productCategory.includes('3D')
            );
          }
          return (
            productCategory.includes(type) ||
            productName.includes(type) ||
            productSubcategory.includes(type)
          );
        });
      });
    }
    
    if (urlParams.exclude) {
      const excludeCategories = urlParams.exclude.split(",").map(c => c.trim().toLowerCase());
      
      result = result.filter(product => {
        const productCategory = product.category.toLowerCase();
        
        const shouldExclude = excludeCategories.some(excludeCat => {
          if (excludeCat === 'softcopy') {
            return productCategory === 'softcopy design';
          }
          if (excludeCat === 'acrylic') {
            return productCategory === 'acrylic stand';
          }
          
          return productCategory.includes(excludeCat) || productCategory === excludeCat;
        });
        
        return !shouldExclude;
      });
    }
    
    if (urlParams.size) {
      const sizes = urlParams.size.split(",").map(s => s.trim().toLowerCase());
      
      result = result.filter(product => {
        const productSize = product.size.toLowerCase();
        const productName = product.name.toLowerCase();
        const productDisplayName = product.displayName?.toLowerCase() || '';
        const productSubcategory = product.subcategory?.toLowerCase() || '';
        
        return sizes.some(size => 
          productSize.includes(size) ||
          productName.includes(size) ||
          productDisplayName.includes(size) ||
          productSubcategory.includes(size)
        );
      });
    }
    
    if (urlParams.category) {
      result = result.filter(product => {
        const productCategory = product.category.toLowerCase();
        
        if (urlParams.category.toLowerCase() === 'softcopy') {
          return productCategory === 'softcopy design';
        }
        
        if (urlParams.category.toLowerCase() === 'acrylic') {
          return productCategory === 'acrylic stand';
        }
        
        const productSubcategory = product.subcategory?.toLowerCase() || '';
        
        return (
          productCategory === urlParams.category.toLowerCase() ||
          productSubcategory === urlParams.category.toLowerCase() ||
          productCategory.includes(urlParams.category.toLowerCase()) ||
          productSubcategory.includes(urlParams.category.toLowerCase())
        );
      });
    }
    
    if (effectiveSearch.trim() !== "") {  
      const queryLower = effectiveSearch.toLowerCase().trim();
      
      const isSpecialKeyword = SPECIAL_KEYWORDS.some(keyword => 
        queryLower.includes(keyword.toLowerCase())
      );
      
      if (isSpecialKeyword) {
        if (queryLower.includes('acrylic') || queryLower.includes('standee') || queryLower.includes('plakat')) {
          if (queryLower.includes('acrylic') && !queryLower.includes('acrylic stand')) {
            result = result.filter(product => {
              const productCategory = product.category.toLowerCase();
              const productName = product.name.toLowerCase();
              const productSize = product.size.toLowerCase();
              const productSubcategory = product.subcategory?.toLowerCase() || '';
              
              if (productCategory === 'acrylic stand') {
                return true;
              }
              
              if (productCategory.includes('3d') || productCategory === '3d frame' || productCategory === '3D Frame') {
                const isSizeA = 
                  productSize.includes('a2') || productSize.includes('a1') || productSize.includes('a0') ||
                  productName.includes('a2') || productName.includes('a1') || productName.includes('a0') ||
                  productSubcategory.includes('a2') || productSubcategory.includes('a1') || productSubcategory.includes('a0');
                
                if (urlParams.type) {
                  const types = urlParams.type.split(",").map(t => t.trim().toLowerCase());
                  const is3DType = types.some(type => 
                    type === '3d' || type === '3d frame' ||
                    productCategory.includes('3d') || productCategory.includes('3D')
                  );
                  
                  return isSizeA && is3DType;
                }
                
                return isSizeA;
              }
              
              return false;
            });
          } else {
            result = result.filter(product => {
              const productCategory = product.category.toLowerCase();
              return productCategory === 'acrylic stand';
            });
          }
        }
        else if (queryLower.includes('kaca')) {
          const glassFrameSizes = ["4r", "15cm", "6r", "20cm", "8r", "10r", "12r"];
          
          result = result.filter(product => {
            const productSize = product.size.toLowerCase();
            const productName = product.name.toLowerCase();
            const productSubcategory = product.subcategory?.toLowerCase() || '';
            
            return glassFrameSizes.some(size => 
              productSize.includes(size) ||
              productName.includes(size) ||
              productSubcategory.includes(size)
            );
          });
        }
        else if (queryLower.includes('softcopy') || queryLower.includes('desain')) {
          result = result.filter(product => {
            const productCategory = product.category.toLowerCase();
            return productCategory === 'softcopy design';
          });
        }
        else if (queryLower.includes('tambahan wajah')) {
          result = result.filter(product => {
            const productName = product.name.toLowerCase();
            const productDisplayName = product.displayName?.toLowerCase() || '';
            
            return (
              productName.includes('biaya tambahan wajah karikatur') ||
              productName.includes('tambahan wajah karikatur') ||
              productDisplayName.includes('biaya tambahan wajah karikatur') ||
              productDisplayName.includes('tambahan wajah karikatur')
            );
          });
        }
        else if (queryLower.includes('tambahan') || queryLower.includes('additional')) {
          result = result.filter(product => {
            const productCategory = product.category.toLowerCase();
            return productCategory === 'additional';
          });
        }
        else if (queryLower.includes('pop up frame')) {
          result = result.filter(product => {
            const productCategory = product.category.toLowerCase();
            return productCategory.includes('3d') || productCategory === '3d frame';
          });
        }
        else {
          let keywordCategories: string[] = [];
          for (const [keyword, categories] of Object.entries(keywordToCategoryMapping)) {
            if (queryLower.includes(keyword.toLowerCase())) {
              keywordCategories = categories;
              break;
            }
          }
          
          if (keywordCategories.length > 0) {
            result = result.filter(product => {
              return keywordCategories.some(cat => 
                product.category.toLowerCase().includes(cat.toLowerCase()) ||
                product.category === cat
              );
            });
          }
        }
        
      } else {
        let matchedProductSearch = false;
        
        for (const [productKeyword, searchConfig] of Object.entries(PRODUCT_NAME_SEARCH)) {
          const isMatch = searchConfig.exactMatch 
            ? queryLower === productKeyword.toLowerCase()
            : queryLower.includes(productKeyword.toLowerCase());
          
          if (isMatch) {
            matchedProductSearch = true;
            
            result = result.filter(product => {
              const productName = product.name.toLowerCase();
              const productCategory = product.category.toLowerCase();
              
              const categoryMatch = searchConfig.category 
                ? searchConfig.category.some(cat => productCategory === cat.toLowerCase() || productCategory.includes(cat.toLowerCase()))
                : true;
              
              const nameMatch = productName.includes(productKeyword.toLowerCase());
              
              return categoryMatch && nameMatch;
            });
            
            break;
          }
        }
        
        if (!matchedProductSearch) {
          const query = normalize(effectiveSearch);  
          
          result = result.filter((product) => {
            const nameNorm = normalize(product.name);  
            const displayNameNorm = product.displayName ? normalize(product.displayName) : "";
            const categoryNorm = normalize(product.category);  
            const subcategoryNorm = normalize(product.subcategory || "");  
            const pathNorm = normalize(product.fullPath);
            const sizeNorm = normalize(product.size);

            if (query.includes('softcopy') || query.includes('desain')) {
              const productCategory = product.category.toLowerCase();
              return productCategory === 'softcopy design';
            }
            
            return (  
              nameNorm.includes(query) ||  
              displayNameNorm.includes(query) ||
              categoryNorm.includes(query) ||  
              subcategoryNorm.includes(query) ||  
              pathNorm.includes(query) ||
              sizeNorm.includes(query)
            );
          });
        }
      }
    }
    
    if (filters.categories.length > 0) {  
      result = result.filter((product) => {
        const matchCategory = filters.categories.some((filterCat) => {  
          const normalizedProductCategory = product.category.toLowerCase();  
          const normalizedProductSub = product.subcategory?.toLowerCase() || "";  
          const normalizedFullPath = `${normalizedProductCategory}/${normalizedProductSub}`.toLowerCase();  
          const normalizedFilter = filterCat.toLowerCase();  

          if (normalizedFilter === 'softcopy') {
            return normalizedProductCategory === 'softcopy design';
          }
          
          if (normalizedFilter === 'acrylic') {
            return normalizedProductCategory === 'acrylic stand';
          }

          return (  
            normalizedProductCategory === normalizedFilter ||  
            normalizedProductSub === normalizedFilter ||  
            normalizedFullPath === normalizedFilter  
          );
        });  

        return matchCategory;
      });
    }  
  
    if (filters.shippedFrom.length > 0) {
      result = result.filter(product => {
        const matchShippedFrom = filters.shippedFrom.some(location => {
          const locationAvailable = product.shippedFrom.includes(location);
          const categoryAvailable = isProductAvailableInLocation(product, location);
          return locationAvailable && categoryAvailable;
        });
        
        return matchShippedFrom;
      });
    }
  
    if (filters.shippedTo.length > 0) {  
      result = result.filter(product => {
        const matchShippedTo = filters.shippedTo.some(destination => {
          const destinationMatch = product.shippedTo.includes(destination);
          const categoryAvailable = isProductAvailableInLocation(product, destination);
          return destinationMatch && categoryAvailable;
        });
        
        return matchShippedTo;
      });
    }
    
    return result;
  }, [filters, searchQuery, allProducts, urlParamsString]);  
  
  return filteredProducts;  
};