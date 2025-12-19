import { useState, useEffect, type FC } from "react";
import type { VideoItem } from "../../types/types";
import useScrollFloat from "../../utils/scrollFloat"; 
import { useNavigate } from "react-router-dom";
import { priceList } from "../../data/priceList";
import { getPrice } from "../../utils/getPrice";
import productOptions from "../../data/productOptions";
import { allProducts } from "../../data/productDataLoader";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router-dom";

import IGIcon from "../../assets/Icons/IG.png";
import TikTokIcon from "../../assets/Icons/TIKTOD2.png";

import video1 from "../../assets/karya/vid-1.mp4";
import video2 from "../../assets/karya/vid-2.mp4";
import video3 from "../../assets/karya/vid-3.mp4";

import foto1 from "../../assets/karya/foto/foto1.jpeg";
import foto2 from "../../assets/karya/foto/foto2.jpeg";
import foto3 from "../../assets/karya/foto/foto3.jpeg";
import foto4 from "../../assets/karya/foto/foto4.jpeg";
import foto5 from "../../assets/karya/foto/foto5.jpeg";

type LayoutContext = {
  searchQuery: string;
  addToCart: (item: any) => void;
};

const GallerySection: FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const { addToCart } = useOutletContext<LayoutContext>();

  // Fungsi untuk mendapatkan nama produk lengkap seperti di ProductDetail
  const getFullProductName = (label: string) => {
    const cleanLabel = label.split(/[\/\s(]/)[0].trim().toLowerCase();

    const frameProducts = allProducts.filter(
      (p) => p.category?.toLowerCase() === "3d frame"
    );

    const strictMatch = frameProducts.find((p) => {
      const name = p.name.trim().toLowerCase();
      return (
        name.includes(cleanLabel) &&
        !name.includes("ai") &&
        !name.includes("artificial") &&
        !name.includes("preview")
      );
    });

    if (strictMatch) {
      const categoryOptions = productOptions["3D Frame"];
      let fullSizeLabel = strictMatch.name;

      if (categoryOptions?.sizes) {
        const found = categoryOptions.sizes.find(s => 
          s.value.startsWith(cleanLabel.toUpperCase())
        );
        if (found) fullSizeLabel = found.label;
      }
      
      return `3D Frame ${fullSizeLabel}`;
    }

    const fallback = frameProducts.find((p) =>
      p.name.trim().toLowerCase().includes(cleanLabel)
    );

    if (fallback) {
      const categoryOptions = productOptions["3D Frame"];
      let fullSizeLabel = fallback.name;

      if (categoryOptions?.sizes) {
        const found = categoryOptions.sizes.find(s => 
          s.value.startsWith(cleanLabel.toUpperCase())
        );
        if (found) fullSizeLabel = found.label;
      }
      
      return `3D Frame ${fullSizeLabel}`;
    }

    return `3D Frame ${label}`;
  };

  const findMatchingProduct = (label: string) => {
    const cleanLabel = label.split(/[\/\s(]/)[0].trim().toLowerCase();

    const frameProducts = allProducts.filter(
      (p) => p.category?.toLowerCase() === "3d frame"
    );

    const strictMatch = frameProducts.find((p) => {
      const name = p.name.trim().toLowerCase();
      return (
        name.includes(cleanLabel) &&
        !name.includes("ai") &&
        !name.includes("artificial") &&
        !name.includes("preview")
      );
    });

    if (strictMatch) return strictMatch;

    const fallback = frameProducts.find((p) =>
      p.name.trim().toLowerCase().includes(cleanLabel)
    );

    return fallback || null;
  };

  // Fungsi untuk navigasi ke halaman produk seperti di BestSelling
  const handleGoToProduct = (label: string) => {
    const matchingProduct = findMatchingProduct(label);
    
    if (matchingProduct) {
      navigate(`/product/${matchingProduct.id}`, {
        state: {
          ...matchingProduct,
          specialVariations: matchingProduct.specialVariations || [],
          details: matchingProduct.details || {},
        },
      });
    }
  };

  const handleLabelClick = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleGoToProduct(label);
  };

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

  const videos: VideoItem[] = [
    { id: 1, video: video1 },
    { id: 2, video: video2 },
    { id: 3, video: video3 },
  ];

  const photos = [
    { id: 1, image: foto1, label: "A2 (40×55CM)" },
    { id: 2, image: foto2, label: "10R / 25x30cm" },
    { id: 3, image: foto3, label: "12R / 30x40cm" },
    { id: 4, image: foto4, label: "12R / 30x40cm" },
    { id: 5, image: foto5, label: "A0 (80×110 cm)" },
  ];

  return (
    <>
    <div className = "font-poppinsSemiBold">
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
                  src={IGIcon}
                  alt="Instagram"
                  className="w-full h-full object-contain"
                />
              </a>
            </div>

            {/* Video Grid */}
            <div className="float-item grid grid-cols-1 gap-4 w-full">
              {videos.map((video) => (
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
                  src={TikTokIcon}
                  alt="TikTok"
                  className="w-full h-full object-contain"
                />
              </a>
            </div>

            {/* Photo Grid Section */}
            <div className="scroll-float mt-16 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {photos.map((photo) => (
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
                    src={IGIcon}
                    alt="Instagram"
                    className="w-full h-full object-contain"
                  />
                </a>
              </div>

              {/* Video Grid */}
              <div className="float-item grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                {videos.map((video) => (
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
                    src={TikTokIcon}
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
                {photos.map((photo) => (
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
          const selectedPhoto = photos.find(photo => photo.image === selectedImage)
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
                  {matchingProduct
                    ? `Rp ${matchingProduct.price.toLocaleString("id-ID")}`
                    : currentLang === "id" ? "Harga tidak tersedia" : "Price not available"}
                </span>
              </div>

              <div className="flex gap-2 mt-1 justify-start">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const price = matchingProduct?.price || getPrice(selectedPhoto.label.split(/[\/\s(]/)[0].trim().toLowerCase()) || 0
                    
                    const message = `Halo Admin Little Amora, saya tertarik dengan produk:\n\n${fullProductName}\nHarga: Rp ${price.toLocaleString("id-ID")}\n\nBisa info lebih detail?`
                    const encodedMessage = encodeURIComponent(message)
                    window.open(`https://wa.me/6281380340307?text=${encodedMessage}`, '_blank')
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
                    e.stopPropagation()
                    handleGoToProduct(selectedPhoto.label)
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

{/* Fullscreen Modal - Mobile Version - Lebih kecil dan posisi disesuaikan */}
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

        {/* Box info - SANGAT KECIL dan di posisi lebih rendah */}
        {(() => {
          const selectedPhoto = photos.find(photo => photo.image === selectedImage)
          if (!selectedPhoto?.label) return null

          const matchingProduct = findMatchingProduct(selectedPhoto.label)
          const fullProductName = getFullProductName(selectedPhoto.label)

          return (
            <div
              className="
                absolute top-12 right-0  /* Diubah dari top-2 ke top-12 agar lebih rendah */
                bg-white/95 backdrop-blur-sm
                rounded-l-lg
                shadow-lg
                px-2 py-1.5  /* Lebih kecil */
                flex flex-col gap-0.5  /* Gap lebih kecil */
                w-auto
                max-w-[55vw]  /* Lebih sempit */
                border-l border-gray-200
              "
              onClick={(e) => e.stopPropagation()}
              style={{
                marginRight: '0px'
              }}
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-semibold text-black leading-tight">
                  {fullProductName}
                </span>

                <span className="text-[11px] font-bold text-red-500 leading-tight mt-0.5">
                  {matchingProduct
                    ? `Rp ${matchingProduct.price.toLocaleString("id-ID")}`
                    : currentLang === "id" ? "Harga tidak tersedia" : "Price not available"}
                </span>
              </div>

              <div className="flex gap-1 mt-0.5 justify-start">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const price = matchingProduct?.price || getPrice(selectedPhoto.label.split(/[\/\s(]/)[0].trim().toLowerCase()) || 0
                    
                    const message = `Halo Admin Little Amora, saya tertarik dengan produk:\n\n${fullProductName}\nHarga: Rp ${price.toLocaleString("id-ID")}\n\nBisa info lebih detail?`
                    const encodedMessage = encodeURIComponent(message)
                    window.open(`https://wa.me/6281380340307?text=${encodedMessage}`, '_blank')
                  }}
                  className="
                    bg-[#dcbec1] text-black font-poppinsSemiBold
                    rounded-sm py-1 px-2 text-[8px]  /* Lebih kecil */
                    whitespace-nowrap hover:bg-gray-300
                    flex items-center justify-center gap-1
                    min-w-[70px]  /* Lebih kecil */
                  "
                >
                  <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 24 24">  /* Lebih kecil */
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
                  </svg>
                  {currentLang === "id" ? "Chat Admin" : "Chat Admin"}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleGoToProduct(selectedPhoto.label)
                  }}
                  className="
                    bg-[#dcbec1] text-black font-poppinsSemiBold
                    rounded-sm py-1 px-2 text-[8px]  /* Lebih kecil */
                    whitespace-nowrap hover:bg-[#d4b0b4]
                    min-w-[70px]  /* Lebih kecil */
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

    {/* Close button - lebih kecil lagi */}
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

export default GallerySection