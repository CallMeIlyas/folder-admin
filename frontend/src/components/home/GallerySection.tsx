import { useState, useEffect, type FC } from "react";
import type { VideoItem } from "../../types/types";
import useScrollFloat from "../../utils/scrollFloat"; 
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router-dom";
import { apiFetch, apiAsset } from "@/utils/api";

type LayoutContext = {
  searchQuery: string;
  addToCart: (item: any) => void;
};

// Tipe untuk foto yang kompatibel dengan modal lama
type CompatiblePhoto = {
  id: number;
  image: string;  // URL lengkap via apiAsset
  label: string;  // Label asli dari backend
  productId?: string; // Optional: untuk navigasi langsung jika ada
  productName?: string; // Optional: untuk fallback
  price?: number; // Optional: untuk fallback
};

type GalleryData = {
  videos: Array<{
    id: number;
    videoUrl: string;
  }>;
  photos: Array<{
    id: number;
    imageUrl: string;
    label: string;
    productId?: string;
    productName?: string;
    price?: number;
  }>;
  socialIcons: {
    instagram: string;
    tiktok: string;
  };
};

const GallerySection: FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [galleryData, setGalleryData] = useState<GalleryData | null>(null);
  const [compatiblePhotos, setCompatiblePhotos] = useState<CompatiblePhoto[]>([]);
  const [compatibleVideos, setCompatibleVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [priceCache, setPriceCache] = useState<Record<string, number>>({});

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const { addToCart } = useOutletContext<LayoutContext>();

  // Fungsi untuk mendapatkan nama produk lengkap dari backend
  const getFullProductName = (label: string) => {
    const backendPhoto = galleryData?.photos.find(p => p.label === label);
    return backendPhoto?.productName || label;
  };

  const findMatchingProduct = (label: string) => {
    // Cari dari data backend
    if (galleryData) {
      const backendPhoto = galleryData.photos.find(p => p.label === label);
      if (backendPhoto?.productId) {
        return {
          id: backendPhoto.productId,
          name: backendPhoto.productName || label,
          price: backendPhoto.price || 0,
          category: "3D Frame"
        };
      }
    }
    
    return null;
  };

  // Fungsi untuk mendapatkan harga dari backend API
  const getPrice = async (label: string): Promise<number> => {
    // Cek cache dulu
    if (priceCache[label]) {
      return priceCache[label];
    }

    // Coba dari data gallery dulu
    if (galleryData) {
      const backendPhoto = galleryData.photos.find(p => p.label === label);
      if (backendPhoto?.price) {
        setPriceCache(prev => ({ ...prev, [label]: backendPhoto.price! }));
        return backendPhoto.price;
      }
    }

    try {
      // Fetch harga dari API khusus price
      const cleanLabel = label.split(/[\/\s(]/)[0].trim().toLowerCase();
      const priceRes = await apiFetch(`/api/prices?size=${cleanLabel}&lang=${currentLang}`);
      
      if (priceRes.ok) {
        const priceData = await priceRes.json();
        if (priceData.price) {
          setPriceCache(prev => ({ ...prev, [label]: priceData.price }));
          return priceData.price;
        }
      }
    } catch (error) {
      console.error("Error fetching price:", error);
    }

    return 0;
  };

  // Fungsi untuk navigasi ke halaman produk
  const handleGoToProduct = (label: string) => {
    const matchingProduct = findMatchingProduct(label);
    
    if (matchingProduct?.id) {
      navigate(`/product/${matchingProduct.id}`, {
        state: {
          ...matchingProduct,
          specialVariations: [],
          details: {},
        },
      });
    }
    // Jika tidak ada productId, tidak melakukan apa-apa (sesuai behavior lama)
  };

  const handleLabelClick = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleGoToProduct(label);
  };

  // Fetch gallery data dari backend
  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch gallery data dari backend
        const galleryRes = await apiFetch(`/api/content/gallery?lang=${currentLang}`);
        const data = await galleryRes.json();
        setGalleryData(data);
        
        // Konversi ke format kompatibel untuk modal
        const photos: CompatiblePhoto[] = data.photos.map((photo: any) => ({
          id: photo.id,
          image: apiAsset(photo.imageUrl), // Konversi ke URL lengkap
          label: photo.label,
          productId: photo.productId,
          productName: photo.productName,
          price: photo.price
        }));
        
        const videos: VideoItem[] = data.videos.map((video: any) => ({
          id: video.id,
          video: apiAsset(video.videoUrl) // Konversi ke URL lengkap
        }));
        
        setCompatiblePhotos(photos);
        setCompatibleVideos(videos);
        
      } catch (error) {
        console.error("Error fetching gallery data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGalleryData();
  }, [currentLang]);

  useScrollFloat(".scroll-float", {
    yIn: 50,
    yOut: 40,
    blurOut: 6,
    inDuration: 1.1,
    outDuration: 0.7,
    stagger: 0.15,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fungsi untuk handle chat admin dengan async price fetching
  const handleChatAdmin = async (photo: CompatiblePhoto) => {
    const fullProductName = getFullProductName(photo.label);
    let price = photo.price || 0;
    
    if (!price) {
      try {
        price = await getPrice(photo.label);
      } catch (error) {
        console.error("Failed to get price:", error);
      }
    }
    
    const message = `Halo Admin Little Amora, saya tertarik dengan produk:\n\n${fullProductName}\nHarga: Rp ${price.toLocaleString("id-ID")}\n\nBisa info lebih detail?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/6281380340307?text=${encodedMessage}`, '_blank');
  };

  if (isLoading || !galleryData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <>
    <div className="font-poppinsSemiBold">
      {/* Border */}
      <div className="relative my-10 text-center h-[1px]">
        <div className="absolute top-0 left-0 w-1/4 border-t-[5px] border-black"></div>
        <div className="absolute top-0 right-0 w-1/4 border-t-[5px] border-black"></div>
      </div>

      <section className={`bg-white ${isMobile ? "py-8 px-4" : "py-16 px-5"}`}>
        <h2
          className={`scroll-float font-nataliecaydence text-center text-black ${
            isMobile ? "text-3xl mb-6" : "text-[46px] mb-10"
          }`}
        >
          {t("gallery.title")}
        </h2>

        {isMobile ? (
          <div
            data-scroll-group="true"
            className="scroll-float flex flex-col gap-6 max-w-md mx-auto"
          >
            {/* Instagram Button */}
            <div className="float-item social-wrapper">
              <span className="social-title">Photo Gallery</span>
              <a
                href="https://www.instagram.com/alittleamora"
                className="social-button"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={apiAsset(galleryData.socialIcons.instagram)}
                  alt="Instagram"
                  className="w-full h-full object-contain"
                />
              </a>
            </div>

            {/* Video Grid */}
            <div className="float-item grid grid-cols-1 gap-4 w-full">
              {compatibleVideos.map((video) => (
                <div
                  key={video.id}
                  className="aspect-[9/16] overflow-hidden rounded-xl shadow-md bg-black"
                >
                  <video controls className="w-full h-full object-cover">
                    <source src={video.video} type="video/mp4" />
                  </video>
                </div>
              ))}
            </div>

            {/* TikTok Button */}
            <div className="float-item social-wrapper">
              <span className="social-title">Video Gallery</span>
              <a
                href="https://www.tiktok.com/@alittleamora"
                className="social-button"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={apiAsset(galleryData.socialIcons.tiktok)}
                  alt="TikTok"
                  className="w-full h-full object-contain"
                />
              </a>
            </div>

            {/* Photo Grid Section */}
            <div className="scroll-float mt-16 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {compatiblePhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative float-item aspect-[9/16] overflow-hidden rounded-xl shadow-md transition-transform duration-300 bg-gray-100 scale-90 hover:scale-100 cursor-pointer group"
                    onClick={() => setSelectedImage(photo.image)}
                  >
                    <img
                      src={photo.image}
                      alt={`Gallery photo ${photo.id}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                
                    {/* Tombol ukuran di tengah bawah */}
                    {photo.label && (
                      <button
                        onClick={(e) => handleLabelClick(photo.label, e)}
                        className="
                          absolute bottom-4 left-4
                          flex items-center gap-2
                          bg-white/20 backdrop-blur-lg
                          text-white font-semibold text-sm md:text-[15px]
                          px-4 py-[6px] md:py-2
                          rounded-full shadow-lg border border-white/30
                          whitespace-nowrap
                          transition-all duration-300
                          hover:scale-105 hover:shadow-xl hover:bg-white/30
                        "
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-white/80 shadow-sm"></span>
                        {photo.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div
              data-scroll-group="true"
              className="scroll-float flex flex-col md:flex-row items-center gap-8 max-w-6xl mx-auto"
            >
              {/* Instagram Button */}
              <div className="float-item social-wrapper">
                <span className="social-title">{t("gallery.photo")}</span>
                <a
                  href="https://www.instagram.com/alittleamora"
                  className="social-button"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={apiAsset(galleryData.socialIcons.instagram)}
                    alt="Instagram"
                    className="w-full h-full object-contain"
                  />
                </a>
              </div>

              {/* Video Grid */}
              <div className="float-item grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                {compatibleVideos.map((video) => (
                  <div
                    key={video.id}
                    className="aspect-[9/16] overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-transform duration-300 bg-black hover:scale-[1.03]"
                  >
                    <video controls className="w-full h-full object-cover">
                      <source src={video.video} type="video/mp4" />
                    </video>
                  </div>
                ))}
              </div>

              {/* TikTok Button */}
              <div className="float-item social-wrapper">
                <span className="social-title">{t("gallery.video")}</span>
                <a
                  href="https://www.tiktok.com/@alittleamora"
                  className="social-button"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={apiAsset(galleryData.socialIcons.tiktok)}
                    alt="TikTok"
                    className="w-full h-full object-contain"
                  />
                </a>
              </div>
            </div>

            {/* Photo Grid Section */}
            <div
              data-scroll-group="true"
              className="scroll-float mt-16 max-w-2xl mx-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {compatiblePhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative float-item aspect-[9/16] overflow-hidden rounded-xl shadow-md transition-transform duration-300 bg-gray-100 scale-90 hover:scale-100 cursor-pointer group"
                    onClick={() => setSelectedImage(photo.image)}
                  >
                    <img
                      src={photo.image}
                      alt={`Gallery photo ${photo.id}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                
                    {/* Tombol ukuran di tengah bawah */}
                    {photo.label && (
                      <button
                        onClick={(e) => handleLabelClick(photo.label, e)}
                        className="
                          absolute bottom-4 left-4
                          flex items-center gap-2
                          bg-white/20 backdrop-blur-lg
                          text-white font-semibold text-sm md:text-[15px]
                          px-4 py-[6px] md:py-2
                          rounded-full shadow-lg border border-white/30
                          whitespace-nowrap
                          transition-all duration-300
                          hover:scale-105 hover:shadow-xl hover:bg-white/30
                        "
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-white/80 shadow-sm"></span>
                        {photo.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* ==================== MODAL ==================== */}
      {/* Fullscreen Modal - Desktop Version */}
      {selectedImage && !isMobile && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="w-full flex items-center justify-center">
            
            {/* Gambar jadi parent relatif */}
            <div className="relative">
              <img
                src={selectedImage}
                alt="Full view"
                className="
                  max-h-[92vh]
                  w-auto
                  max-w-full
                  object-contain
                  rounded-lg
                  shadow-2xl
                "
              />

              {/* Box info berada DI DALAM gambar */}
              {(() => {
                const selectedPhoto = compatiblePhotos.find(photo => photo.image === selectedImage)
                if (!selectedPhoto?.label) return null

                const matchingProduct = findMatchingProduct(selectedPhoto.label)
                const fullProductName = getFullProductName(selectedPhoto.label)

                return (
                  <div
                    className="
                      absolute top-4 right-0
                      bg-white
                      rounded-l-3xl
                      shadow-2xl
                      px-5 py-4
                      flex flex-col gap-2
                      w-auto
                      max-w-[70vw]
                    "
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col">
                      <span className="text-[16px] font-semibold text-black leading-tight">
                        {fullProductName}
                      </span>

                      <span className="text-[20px] font-bold text-red-500 leading-tight mt-1">
                        {matchingProduct?.price ?? selectedPhoto.price
                          ? `Rp ${(matchingProduct?.price ?? selectedPhoto.price!).toLocaleString("id-ID")}`
                          : currentLang === "id" ? "Harga tidak tersedia" : "Price not available"}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-1 justify-start">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChatAdmin(selectedPhoto);
                        }}
                        className="
                          bg-[#dcbec1] text-black font-poppinsSemiBold
                          rounded-lg py-2 px-6 text-[14px]
                          whitespace-nowrap hover:bg-gray-300
                        "
                      >
                        {currentLang === "id" ? "Chat Admin" : "Chat Admin"}
                      </button>

                      {/* Tombol yang diubah menjadi navigasi ke halaman produk */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGoToProduct(selectedPhoto.label);
                        }}
                        className="
                          bg-[#dcbec1] text-black font-poppinsSemiBold
                          rounded-lg py-2 px-6 text-[14px]
                          whitespace-nowrap hover:bg-[#d4b0b4]
                        "
                      >
                        {currentLang === "id" ? "Ke Halaman Produk" : "Go to Product"}
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>

          </div>

          {/* Close button */}
          <button
            className="
              absolute top-5 right-5 text-white text-3xl font-bold
              bg-black/50 rounded-full w-10 h-10 flex items-center justify-center
              hover:bg-black/70 transition-colors
            "
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Fullscreen Modal - Mobile Version */}
      {selectedImage && isMobile && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2"
          onClick={() => setSelectedImage(null)}
        >
          <div className="w-full flex items-center justify-center">
            
            {/* Container untuk gambar */}
            <div className="relative">
              <img
                src={selectedImage}
                alt="Full view"
                className="
                  max-h-[90vh]
                  w-auto
                  max-w-[95vw]
                  object-contain
                  rounded-lg
                  shadow-2xl
                "
              />

              {/* Box info */}
              {(() => {
                const selectedPhoto = compatiblePhotos.find(photo => photo.image === selectedImage)
                if (!selectedPhoto?.label) return null

                const matchingProduct = findMatchingProduct(selectedPhoto.label)
                const fullProductName = getFullProductName(selectedPhoto.label)

                return (
                  <div
                    className="
                      absolute top-12 right-0
                      bg-white/95 backdrop-blur-sm
                      rounded-l-lg
                      shadow-lg
                      px-2 py-1.5
                      flex flex-col gap-0.5
                      w-auto
                      max-w-[55vw]
                      border-l border-gray-200
                    "
                    onClick={(e) => e.stopPropagation()}
                    style={{ marginRight: '0px' }}
                  >
                    <div className="flex flex-col">
                      <span className="text-[9px] font-semibold text-black leading-tight">
                        {fullProductName}
                      </span>

                      <span className="text-[11px] font-bold text-red-500 leading-tight mt-0.5">
                        {matchingProduct?.price ?? selectedPhoto.price
                          ? `Rp ${(matchingProduct?.price ?? selectedPhoto.price!).toLocaleString("id-ID")}`
                          : currentLang === "id" ? "Harga tidak tersedia" : "Price not available"}
                      </span>
                    </div>

                    <div className="flex gap-1 mt-0.5 justify-start">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChatAdmin(selectedPhoto);
                        }}
                        className="
                          bg-[#dcbec1] text-black font-poppinsSemiBold
                          rounded-sm py-1 px-2 text-[8px]
                          whitespace-nowrap hover:bg-gray-300
                          flex items-center justify-center gap-1
                          min-w-[70px]
                        "
                      >
                        <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
                        </svg>
                        {currentLang === "id" ? "Chat Admin" : "Chat Admin"}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGoToProduct(selectedPhoto.label);
                        }}
                        className="
                          bg-[#dcbec1] text-black font-poppinsSemiBold
                          rounded-sm py-1 px-2 text-[8px]
                          whitespace-nowrap hover:bg-[#d4b0b4]
                          min-w-[70px]
                        "
                      >
                        {currentLang === "id" ? "Ke Halaman Produk" : "Go to Product"}
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>

          </div>

          {/* Close button */}
          <button
            className="
              absolute top-3 right-3 text-white text-base font-bold
              bg-black/50 rounded-full w-6 h-6 flex items-center justify-center
              hover:bg-black/70 transition-colors
            "
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
    </>
  );
};

export default GallerySection;