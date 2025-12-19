import React, { useEffect, useRef, useState } from "react";
import Footer from "../components/home/Footer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { allProducts } from "../data/productDataLoader";
import type { Product } from "../data/productDataLoader";

// ️ Import semua gambar
import mainImage1 from "../assets/size-guide/main-image1.png";
import mainImage2 from "../assets/size-guide/main-image2.png";
import mainImage3 from "../assets/size-guide/main-image3.png";
import onHand1 from "../assets/size-guide/1.png";
import onHand2 from "../assets/size-guide/2.png";
import onHand3 from "../assets/size-guide/3.png";
import onHand4 from "../assets/size-guide/4.png";
import onHand5 from "../assets/size-guide/5.png";
import onHand6 from "../assets/size-guide/6.png";
import portofolio from "../assets/size-guide/A.png";
import cartoon from "../assets/size-guide/B.png"
import facewithcartoonbody from "../assets/size-guide/C.png"

// Import gambar berdasarkan bahasa
// Indonesia
import size4R_ID from "../assets/size-guide/INDONESIA/4R.png";
import size6R_ID from "../assets/size-guide/INDONESIA/6R.png";
import size8R_ID from "../assets/size-guide/INDONESIA/8R.png";
import size10R_ID from "../assets/size-guide/INDONESIA/10R.png";
import size12R_ID from "../assets/size-guide/INDONESIA/12R.png";
import size15CM_ID from "../assets/size-guide/INDONESIA/15CM.png";
import size20CM_ID from "../assets/size-guide/INDONESIA/20CM.png";
import sizeA0_ID from "../assets/size-guide/INDONESIA/A0.png";
import sizeA1_ID from "../assets/size-guide/INDONESIA/A1.png";
import sizeA2_ID from "../assets/size-guide/INDONESIA/A2.png";

// English
import size4R_EN from "../assets/size-guide/ENGLISH/4R.png";
import size6R_EN from "../assets/size-guide/ENGLISH/6R.png";
import size8R_EN from "../assets/size-guide/ENGLISH/8R.png";
import size10R_EN from "../assets/size-guide/ENGLISH/10R.png";
import size12R_EN from "../assets/size-guide/ENGLISH/12R.png";
import size15CM_EN from "../assets/size-guide/ENGLISH/15CM.png";
import size20CM_EN from "../assets/size-guide/ENGLISH/20CM.png";
import sizeA0_EN from "../assets/size-guide/ENGLISH/A0.png";
import sizeA1_EN from "../assets/size-guide/ENGLISH/A1.png";
import sizeA2_EN from "../assets/size-guide/ENGLISH/A2.png";

const SizeGuide: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const navigate = useNavigate();
  const images = [onHand1, onHand2, onHand3, onHand4, onHand5, onHand6];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  //  Dapatkan bahasa aktif
  const currentLanguage = i18n.language === "id" || i18n.language === "id-ID" ? "id" : "en";
  
  // Check screen size untuk menentukan mobile/desktop
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  //️ Mapping ukuran ke produk target (sesuaikan dengan produk yang ada)
  const sizeToProductMap = [
    { 
      size: "4R", 
      match: "4R", 
      target3D: "4R",
      id: size4R_ID, 
      en: size4R_EN,
      displayName: "4R - 10x15cm"
    },
    { 
      size: "15CM", 
      match: "15CM", 
      target3D: "15X15CM",
      id: size15CM_ID, 
      en: size15CM_EN,
      displayName: "15CM - 15x15cm"
    },
    { 
      size: "6R", 
      match: "6R", 
      target3D: "6R",
      id: size6R_ID, 
      en: size6R_EN,
      displayName: "6R - 15x20cm"
    },
    { 
      size: "20CM", 
      match: "20CM", 
      target3D: "20X20CM",
      id: size20CM_ID, 
      en: size20CM_EN,
      displayName: "20CM - 20x20cm"
    },
    { 
      size: "8R", 
      match: "8R", 
      target3D: "8R",
      id: size8R_ID, 
      en: size8R_EN,
      displayName: "8R - 20x25cm"
    },
    { 
      size: "10R", 
      match: "10R", 
      target3D: "10R",
      id: size10R_ID, 
      en: size10R_EN,
      displayName: "10R - 25x30cm"
    },
    { 
      size: "12R", 
      match: "12R", 
      target3D: "12R",
      id: size12R_ID, 
      en: size12R_EN,
      displayName: "12R - 30x40cm"
    },
    { 
      size: "A2", 
      match: "A2-40X55CM", 
      target3D: "A2-40X55CM",
      id: sizeA2_ID, 
      en: sizeA2_EN,
      displayName: "A2 - 40x55cm"
    },
    { 
      size: "A1", 
      match: "A1-55X80CM", 
      target3D: "A1-55X80CM",
      id: sizeA1_ID, 
      en: sizeA1_EN,
      displayName: "A1 - 55x80cm"
    },
    { 
      size: "A0", 
      match: "A0-80X110CM", 
      target3D: "A0-80X110CM",
      id: sizeA0_ID, 
      en: sizeA0_EN,
      displayName: "A0 - 80x110cm"
    },
  ];

  // Fungsi untuk handle klik pada gambar size
  const handleSizeClick = (sizeItem: typeof sizeToProductMap[0]) => {
    // 1. Tampilkan preview gambar dulu
    setSelectedImage(currentLanguage === "id" ? sizeItem.id : sizeItem.en);
    
    // 2. Setelah 500ms, navigasi ke produk
    setTimeout(() => {
      const targetName = sizeItem.target3D.trim().toLowerCase();
      const targetProduct = allProducts.find(
        (p) => p.category === "3D Frame" && p.name.trim().toLowerCase() === targetName
      );

      if (targetProduct) {
        navigate(`/product/${targetProduct.id}`, {
          state: {
            ...targetProduct,
            specialVariations: targetProduct.specialVariations || [],
            details: targetProduct.details || {},
          },
        });
      } else {
        // Fallback jika produk tidak ditemukan
        console.warn(`Product ${sizeItem.target3D} not found`);
        // Bisa tambahkan navigasi ke halaman produk umum atau ukuran tertentu
        navigate("/products?category=3D+Frame");
      }
    }, 500);
  };

  // Fade-in observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-5");
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionsRef.current.forEach((el) => el && observer.observe(el));
    setTimeout(() => window.dispatchEvent(new Event("resize")), 500);
    return () => observer.disconnect();
  }, []);

  const SectionTitle = ({ title }: { title: string }) => (
    <div className={`relative my-6 mb-8 md:my-8 md:mb-10 text-center w-screen left-1/2 -translate-x-1/2 ${isMobile ? 'px-2' : ''}`}>
      <h1 className={`inline-block px-4 font-nataliecaydence relative z-10 ${isMobile ? 'text-[21px]' : 'text-4xl'}`}>
        {title}
      </h1>
      <div className={`absolute top-1/2 left-0 border-t-2 md:border-t-4 border-black transform -translate-y-1/2 ${isMobile ? 'w-[10%]' : 'w-[15%] md:w-[20%]'}`}></div>
      <div className={`absolute top-1/2 right-0 border-t-2 md:border-t-4 border-black transform -translate-y-1/2 ${isMobile ? 'w-[10%]' : 'w-[15%] md:w-[20%]'}`}></div>
    </div>
  );

  // Navigasi carousel
  const prevImage = () =>
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () =>
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  // Nonaktifkan scroll saat fullscreen aktif
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [selectedImage]);

  // ========== LAYOUT MOBILE ==========
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          {/* ========== FRAME SIZE ========== */}
          <section
            ref={(el) => (sectionsRef.current[0] = el)}
            className="transition-all duration-700 opacity-0 translate-y-5 px-3"
          >
            <SectionTitle title={t("size.frameSize")} />
            <div className="relative flex justify-center items-center">
              <img
                src={mainImage1}
                alt="Frame Size Base"
                className="w-full max-w-[95%] object-contain"
              />
              <img
                src={mainImage2}
                alt="Frame Size Overlay"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[95%] object-contain pointer-events-none"
              />
            </div>
          </section>

          {/* ========== SIZE COMPARISON ========== */}
          <section
            ref={(el) => (sectionsRef.current[1] = el)}
            className="transition-all duration-700 opacity-0 translate-y-5 px-3 mt-8"
          >
            <SectionTitle title={t("size.sizeComparison")} />
            <div className="flex justify-center">
              <img
                src={mainImage3}
                alt="Size Comparison"
                className="w-full max-w-[95%] object-contain"
              />
            </div>
          </section>

          {/* ========== SIZE ON HAND (Carousel) ========== */}
          <section
            ref={(el) => (sectionsRef.current[2] = el)}
            className="transition-all duration-700 opacity-0 translate-y-5 w-full mt-6 mb-16 relative"
          >
            <SectionTitle title={t("size.sizeOnHand")} />
          
          {/* Carousel Mobile */}
          <div className="relative flex justify-center items-center overflow-visible px-4 py-4">
            <div className="flex items-center justify-center w-full relative min-h-[160px] mt-2 mb-6">
              {images.map((img, index) => {
                const isActive = index === currentIndex;
                const isNext = index === (currentIndex + 1) % images.length;
                const isPrev =
                  index ===
                  (currentIndex === 0
                    ? images.length - 1
                    : currentIndex - 1);
          
                const position = isActive
                  ? "scale-100 opacity-100 z-20"
                  : isNext
                  ? "translate-x-[25%] scale-85 opacity-60 z-10"
                  : isPrev
                  ? "-translate-x-[25%] scale-85 opacity-60 z-10"
                  : "opacity-0 pointer-events-none";
          
                return (
                  <img
                    key={index}
                    src={img}
                    alt={`On Hand ${index + 1}`}
                    className={`absolute transition-all duration-500 ease-in-out rounded-md shadow-md cursor-pointer w-[65vw] max-w-[280px] object-cover ${position}`}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      maxHeight: 'calc(100vh - 200px)'
                    }}
                  />
                );
              })}
            </div>
          
            {/* Tombol navigasi mobile */}
            <button
              onClick={prevImage}
              className="absolute left-2 sm:left-4 bg-white/80 hover:bg-white text-black p-1.5 rounded-full shadow-md z-30"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 sm:right-4 bg-white/80 hover:bg-white text-black p-1.5 rounded-full shadow-md z-30"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          
            {/* Grid Size Chart Mobile - Sama seperti desktop tapi lebih kecil */}
            <div className="w-full mt-12 mb-12 px-2">
              <div className="grid grid-cols-2 gap-2">
                {sizeToProductMap.map((sizeItem, index) => {
                  const isLeftColumn = index % 2 === 0;
                  const isA1orA0 = sizeItem.size === "A1" || sizeItem.size === "A0";
          
                  if (isA1orA0) {
                    return (
                      <div key={sizeItem.size} className="col-span-2 flex flex-col items-center">
                        <div
                          className="relative cursor-pointer hover:opacity-90 transition-opacity duration-300 group w-full"
                          onClick={() => {
                            const targetName = sizeItem.target3D.trim().toLowerCase();
                            const targetProduct = allProducts.find(
                              (p) => p.category === "3D Frame" && p.name.trim().toLowerCase() === targetName
                            );
          
                            if (targetProduct) {
                              navigate(`/product/${targetProduct.id}`, {
                                state: {
                                  ...targetProduct,
                                  specialVariations: targetProduct.specialVariations || [],
                                  details: targetProduct.details || {},
                                },
                              });
                            } else {
                              navigate("/products?category=3D+Frame");
                            }
                          }}
                        >
                          <img
                            src={currentLanguage === "id" ? sizeItem.id : sizeItem.en}
                            alt={sizeItem.displayName}
                            className="w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded" />
                        </div>
                      </div>
                    );
                  }
                  
                  // Untuk ukuran lainnya - layout grid 2 kolom seperti desktop
                  return (
                    <div
                      key={sizeItem.size}
                      className={`relative cursor-pointer hover:opacity-90 transition-opacity duration-300 group`}
                      onClick={() => {
                        const targetName = sizeItem.target3D.trim().toLowerCase();
                        const targetProduct = allProducts.find(
                          (p) => p.category === "3D Frame" && p.name.trim().toLowerCase() === targetName
                        );
          
                        if (targetProduct) {
                          navigate(`/product/${targetProduct.id}`, {
                            state: {
                              ...targetProduct,
                              specialVariations: targetProduct.specialVariations || [],
                              details: targetProduct.details || {},
                            },
                          });
                        } else {
                          navigate("/products?category=3D+Frame");
                        }
                      }}
                    >
                      <img
                        src={currentLanguage === "id" ? sizeItem.id : sizeItem.en}
                        alt={sizeItem.displayName}
                        className="w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded" />
                      
                      {/* Tooltip/indikator klik mobile */}
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {currentLang === "id" ? "Klik" : "Click"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
          
          {/*Portofolio Mobile*/}
          <section
            ref={(el) => (sectionsRef.current[3] = el)}
            className="transition-all duration-700 opacity-0 translate-y-5 w-full mt-8 mb-10 relative"
          >
            <SectionTitle title={t("size.portofolio")} />
            <div className="flex justify-center px-3">
              <img
                src={portofolio}
                alt="Portofolio"
                className="w-full max-w-[95%] object-contain"
              />
            </div>
          </section>
          
{/*Badan kartun Mobile*/}
<section
  ref={(el) => (sectionsRef.current[4] = el)}
  className="transition-all duration-700 opacity-0 translate-y-5 w-full mt-8 mb-10 relative"
>
  {isMobile ? (
    <div className="relative my-4 mb-6 text-center w-screen left-1/2 -translate-x-1/2 px-2">
      <h1 className="inline-block px-4 text-2xl font-nataliecaydence relative z-10 max-w-[70%] mx-auto break-words leading-tight">
        {t("size.cartoon")}
      </h1>
      <div className="absolute top-1/2 left-0 w-[15%] border-t-2 border-black transform -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-0 w-[15%] border-t-2 border-black transform -translate-y-1/2"></div>
    </div>
  ) : (
    <SectionTitle title={t("size.cartoon")} />
  )}
  <div className="flex justify-center px-3">
    <img
      src={cartoon}
      alt="Cartoon Body"
      className="w-full max-w-[95%] object-contain"
    />
  </div>
</section>

{/*wajah asli dengan badan kartun Mobile*/}
<section
  ref={(el) => (sectionsRef.current[5] = el)}
  className="transition-all duration-700 opacity-0 translate-y-5 w-full mt-8 mb-10 relative"
>
  {isMobile ? (
    <div className="relative my-4 mb-6 text-center w-screen left-1/2 -translate-x-1/2 px-2">
      <h1 className="inline-block px-4 text-2xl font-nataliecaydence relative z-10 max-w-[60%] mx-auto break-words leading-tight">
        {t("size.facewithcartoonbody")}
      </h1>
      <div className="absolute top-1/2 left-0 w-[10%] border-t-2 border-black transform -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-0 w-[10%] border-t-2 border-black transform -translate-y-1/2"></div>
    </div>
  ) : (
    <SectionTitle title={t("size.facewithcartoonbody")} />
  )}
  <div className="flex justify-center px-3">
    <img
      src={facewithcartoonbody}
      alt="Face with Cartoon Body"
      className="w-full max-w-[95%] object-contain"
    />
  </div>
</section>
        </main>

        <Footer />

        {/*  Fullscreen Preview Mobile */}
        {selectedImage &&
          ReactDOM.createPortal(
            <div
              className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center animate-fadeIn"
              onClick={() => setSelectedImage(null)}
            >
              {/* Tombol close mobile */}
              <button
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xl font-bold w-7 h-7 rounded-full flex items-center justify-center z-[1000]"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>

              {/* Gambar tengah mobile */}
              <div
                className="relative flex items-center justify-center px-2"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedImage}
                  alt="Full view"
                  className="
                    object-contain rounded-lg shadow-xl
                    max-w-[95vw] max-h-[70vh]
                    transition-transform duration-300 ease-out
                    scale-100 hover:scale-[1.01]
                  "
                />
              </div>
            </div>,
            document.body
          )}
      </div>
    );
  }

  // ========== LAYOUT DESKTOP ==========
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* ========== FRAME SIZE ========== */}
        <section
          ref={(el) => (sectionsRef.current[0] = el)}
          className="transition-all duration-700 opacity-0 translate-y-5 max-w-7xl mx-auto px-4 md:px-10"
        >
          <SectionTitle title={t("size.frameSize")} />
          <div className="relative flex justify-center items-center">
            <img
              src={mainImage1}
              alt="Frame Size Base"
              className="w-full md:w-4/5 lg:w-3/4 object-contain"
            />
            <img
              src={mainImage2}
              alt="Frame Size Overlay"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-full md:w-4/5 lg:w-3/4 object-contain pointer-events-none"
            />
          </div>
        </section>

        {/* ========== SIZE COMPARISON ========== */}
        <section
          ref={(el) => (sectionsRef.current[1] = el)}
          className="transition-all duration-700 opacity-0 translate-y-5 max-w-7xl mx-auto px-4 md:px-10 mt-12 md:mt-20"
        >
          <SectionTitle title={t("size.sizeComparison")} />
          <div className="flex justify-center">
            <img
              src={mainImage3}
              alt="Size Comparison"
              className="w-full md:w-4/5 lg:w-3/4 object-contain"
            />
          </div>
        </section>

        {/* ========== SIZE ON HAND (Carousel) ========== */}
        <section
          ref={(el) => (sectionsRef.current[2] = el)}
          className="transition-all duration-700 opacity-0 translate-y-5 w-full mt-12 md:mt-20 mb-16 md:mb-24 relative"
        >
          <SectionTitle title={t("size.sizeOnHand")} />

          {/* Carousel */}
          <div className="relative flex justify-center items-center overflow-visible px-4 md:px-10">
            <div className="flex items-center justify-center w-full relative min-h-[300px] md:min-h-[400px] mt-6 md:mt-10">
              {images.map((img, index) => {
                const isActive = index === currentIndex;
                const isNext = index === (currentIndex + 1) % images.length;
                const isPrev =
                  index ===
                  (currentIndex === 0
                    ? images.length - 1
                    : currentIndex - 1);
          
                const position = isActive
                  ? "scale-100 opacity-100 z-20"
                  : isNext
                  ? "translate-x-[20%] md:translate-x-[15%] scale-90 opacity-70 z-10"
                  : isPrev
                  ? "-translate-x-[20%] md:-translate-x-[15%] scale-90 opacity-70 z-10"
                  : "opacity-0 pointer-events-none";
          
                return (
                  <img
                    key={index}
                    src={img}
                    alt={`On Hand ${index + 1}`}
                    className={`absolute transition-all duration-700 ease-in-out rounded-lg md:rounded-xl shadow-lg md:shadow-xl cursor-pointer w-[90vw] md:w-[55vw] lg:w-[40vw] object-cover ${position}`}
                    onClick={() => setSelectedImage(img)}
                  />
                );
              })}
            </div>
          
            {/* Tombol navigasi - responsive dengan media query CSS */}
            <button
              onClick={prevImage}
              className="absolute bg-white/70 hover:bg-white text-black p-2 md:p-3 rounded-full shadow-lg z-30 transition-all hover:scale-110 border border-gray-100 hidden md:block"
              style={{ 
                left: 'calc(50% - 20vw - 20px)',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              <ChevronLeft className="w-7 h-7 md:w-8 md:h-8" />
            </button>
            <button
              onClick={prevImage}
              className="absolute bg-white/70 hover:bg-white text-black p-2 rounded-full shadow-lg z-30 transition-all hover:scale-110 border border-gray-100 md:hidden"
              style={{ 
                left: 'calc(50% - 45vw - 20px)',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          
            <button
              onClick={nextImage}
              className="absolute bg-white/70 hover:bg-white text-black p-2 md:p-3 rounded-full shadow-lg z-30 transition-all hover:scale-110 border border-gray-100 hidden md:block"
              style={{ 
                right: 'calc(50% - 20vw - 20px)',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              <ChevronRight className="w-7 h-7 md:w-8 md:h-8" />
            </button>
            <button
              onClick={nextImage}
              className="absolute bg-white/70 hover:bg-white text-black p-2 rounded-full shadow-lg z-30 transition-all hover:scale-110 border border-gray-100 md:hidden"
              style={{ 
                right: 'calc(50% - 45vw - 20px)',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>

        {/* Grid Size Chart - Urutan dari kecil ke besar */}
          <div className="w-full mt-12 md:mt-16">
            <div className="grid grid-cols-2 gap-2">
              {/* Render semua ukuran dari mapping */}
              {sizeToProductMap.map((sizeItem, index) => {
                const isLeftColumn = index % 2 === 0;
                const isA1orA0 = sizeItem.size === "A1" || sizeItem.size === "A0";

                if (isA1orA0) {
                  return (
                    <div key={sizeItem.size} className="col-span-2 flex flex-col items-center">
                      <div
                        className="relative cursor-pointer hover:opacity-90 transition-opacity duration-300 mb-2 group"
                        onClick={() => {
                          // Langsung navigasi tanpa preview fullscreen
                          const targetName = sizeItem.target3D.trim().toLowerCase();
                          const targetProduct = allProducts.find(
                            (p) => p.category === "3D Frame" && p.name.trim().toLowerCase() === targetName
                          );

                          if (targetProduct) {
                            navigate(`/product/${targetProduct.id}`, {
                              state: {
                                ...targetProduct,
                                specialVariations: targetProduct.specialVariations || [],
                                details: targetProduct.details || {},
                              },
                            });
                          } else {
                            navigate("/products?category=3D+Frame");
                          }
                        }}
                      >
                        <img
                          src={currentLanguage === "id" ? sizeItem.id : sizeItem.en}
                          alt={sizeItem.displayName}
                          className="w-[1213px] h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                        {/* Overlay untuk feedback visual */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded" />
                      </div>
                    </div>
                  );
                }
                
                // Untuk ukuran lainnya
                return (
                  <div
                    key={sizeItem.size}
                    className={`${isLeftColumn ? 'ml-8' : 'mr-8'} relative cursor-pointer hover:opacity-90 transition-opacity duration-300 group`}
                    onClick={() => {
                      // Langsung navigasi tanpa preview fullscreen
                      const targetName = sizeItem.target3D.trim().toLowerCase();
                      const targetProduct = allProducts.find(
                        (p) => p.category === "3D Frame" && p.name.trim().toLowerCase() === targetName
                      );

                      if (targetProduct) {
                        navigate(`/product/${targetProduct.id}`, {
                          state: {
                            ...targetProduct,
                            specialVariations: targetProduct.specialVariations || [],
                            details: targetProduct.details || {},
                          },
                        });
                      } else {
                        navigate("/products?category=3D+Frame");
                      }
                    }}
                  >
                    <img
                      src={currentLanguage === "id" ? sizeItem.id : sizeItem.en}
                      alt={sizeItem.displayName}
                      className="w-[600px] h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                    {/* Overlay untuk feedback visual */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded" />
                    
                    {/* Tooltip/indikator klik */}
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {currentLang === "id" ? "Klik untuk melihat produk" : "Click to view product"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        
        {/*Portofolio*/}
          <section
          ref={(el) => (sectionsRef.current[3] = el)}
          className="transition-all duration-700 opacity-0 translate-y-5 w-full mt-12 md:mt-20 mb-16 md:mb-24 relative"
        >
          <SectionTitle title={t("size.portofolio")} />
            <div className="flex justify-center">
            <img
              src={portofolio}
              alt="Size Comparison"
              className="w-full md:w-4/5 lg:w-3/4 object-contain"
            />
          </div>
          </section>
          
          {/*Badan kartun*/}
          <section
          ref={(el) => (sectionsRef.current[4] = el)}
          className="transition-all duration-700 opacity-0 translate-y-5 w-full mt-12 md:mt-20 mb-16 md:mb-24 relative"
        >
          <SectionTitle title={t("size.cartoon")} />
            <div className="flex justify-center">
            <img
              src={cartoon}
              alt="Size Comparison"
              className="w-full md:w-4/5 lg:w-3/4 object-contain"
            />
          </div>
          </section>
          
          {/*wajah asli dengan badan kartun*/}
          <section
          ref={(el) => (sectionsRef.current[5] = el)}
          className="transition-all duration-700 opacity-0 translate-y-5 w-full mt-12 md:mt-20 mb-16 md:mb-24 relative"
        >
          <SectionTitle title={t("size.facewithcartoonbody")} />
            <div className="flex justify-center">
            <img
              src={facewithcartoonbody}
              alt="Size Comparison"
              className="w-full md:w-4/5 lg:w-3/4 object-contain"
            />
          </div>
          </section>
      </main>

      <Footer />

      {/* Fullscreen Preview */}
      {selectedImage &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center animate-fadeIn"
            onClick={() => setSelectedImage(null)}
          >
            {/* Tombol close */}
            <button
              className="absolute top-4 right-4 md:top-6 md:right-6 bg-black/60 hover:bg-black/80 text-white text-xl md:text-3xl font-bold w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center z-[1000]"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>

            {/* Gambar tengah */}
            <div
              className="relative flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Full view"
                className="
                  object-contain rounded-lg md:rounded-xl shadow-xl md:shadow-2xl
                  max-w-[90vw] max-h-[80vh]
                  md:max-w-[70vw] md:max-h-[80vh]
                  transition-transform duration-300 ease-out
                  scale-100 hover:scale-[1.02] md:hover:scale-[1.03]
                "
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default SizeGuide;