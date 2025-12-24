import { useEffect, useRef, useState } from "react";
import Footer from "../components/home/Footer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReactDOM from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { apiFetch, apiAsset } from "@/utils/api";

gsap.registerPlugin(ScrollTrigger);

type SizeItem = {
  size: string;
  image: string;
  productId: string | null;
  fallbackUrl: string | null;
};

type SizeGuideData = {
  titles: Record<string, string>;
  images: {
    frame: {
      base: string;
      overlay: string;
      comparison: string;
    };
    onHand: string[];
    sizes: SizeItem[];
    extra: {
      portofolio: string;
      cartoon: string;
      faceWithCartoonBody: string;
    };
  };
};

const SizeGuide = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<SizeGuideData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  // ================= FETCH DATA =================
  useEffect(() => {
    apiFetch(`/api/content/size-guide?lang=${i18n.language}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [i18n.language]);

  // ================= CHECK SCREEN SIZE =================
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // ================= ANIMATION =================
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

  // ================= HANDLERS =================
  const prevImage = () => {
    if (!data) return;
    setCurrentIndex(i => i === 0 ? data.images.onHand.length - 1 : i - 1);
  };

  const nextImage = () => {
    if (!data) return;
    setCurrentIndex(i => i === data.images.onHand.length - 1 ? 0 : i + 1);
  };

  const handleSizeClick = (item: SizeItem) => {
    if (item.productId) {
      navigate(`/product/${item.productId}`);
    } else if (item.fallbackUrl) {
      navigate(item.fallbackUrl);
    }
  };

  // ================= COMPONENTS =================
  const SectionTitle = ({ title }: { title: string }) => {
    if (isMobile) {
      return (
        <div className="relative my-6 mb-8 text-center w-screen left-1/2 -translate-x-1/2 px-2">
          <h1 className="inline-block px-4 text-[21px] font-nataliecaydence relative z-10">
            {title}
          </h1>
          <div className="absolute top-1/2 left-0 w-[10%] border-t-2 border-black transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-[10%] border-t-2 border-black transform -translate-y-1/2"></div>
        </div>
      );
    }

    return (
      <div className="relative my-8 mb-10 text-center w-screen left-1/2 -translate-x-1/2">
        <h1 className="inline-block px-4 text-4xl font-nataliecaydence relative z-10">
          {title}
        </h1>
        <div className="absolute top-1/2 left-0 w-[20%] border-t-4 border-black transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-0 w-[20%] border-t-4 border-black transform -translate-y-1/2"></div>
      </div>
    );
  };

  // ================= DISABLE SCROLL ON FULLSCREEN =================
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [selectedImage]);

  if (!data) return null;

  // ================= MOBILE LAYOUT =================
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          {/* FRAME SIZE */}
          <section ref={el => (sectionsRef.current[0] = el)} className="px-3">
            <SectionTitle title={data.titles.frameSize} />
            <div className="relative flex justify-center items-center">
              <img
                src={apiAsset(data.images.frame.base)}
                alt="Frame Size Base"
                className="w-full max-w-[95%] object-contain"
              />
              <img
                src={apiAsset(data.images.frame.overlay)}
                alt="Frame Size Overlay"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[95%] object-contain pointer-events-none"
              />
            </div>
          </section>

          {/* SIZE COMPARISON */}
          <section ref={el => (sectionsRef.current[1] = el)} className="px-3 mt-8">
            <SectionTitle title={data.titles.sizeComparison} />
            <div className="flex justify-center">
              <img
                src={apiAsset(data.images.frame.comparison)}
                alt="Size Comparison"
                className="w-full max-w-[95%] object-contain"
              />
            </div>
          </section>

          {/* SIZE ON HAND - CAROUSEL */}
          <section ref={el => (sectionsRef.current[2] = el)} className="w-full mt-6 mb-16 relative">
            <SectionTitle title={data.titles.sizeOnHand} />
            
            <div className="relative flex justify-center items-center overflow-visible px-4 py-4">
              <div className="flex items-center justify-center w-full relative min-h-[160px] mt-2 mb-6">
                {data.images.onHand.map((img, index) => {
                  const isActive = index === currentIndex;
                  const isNext = index === (currentIndex + 1) % data.images.onHand.length;
                  const isPrev = index === (currentIndex === 0 ? data.images.onHand.length - 1 : currentIndex - 1);

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
                      src={apiAsset(img)}
                      alt={`On Hand ${index + 1}`}
                      className={`absolute transition-all duration-500 ease-in-out rounded-md shadow-md cursor-pointer w-[65vw] max-w-[280px] object-cover ${position}`}
                      onClick={() => setSelectedImage(apiAsset(img))}
                      style={{
                        maxHeight: 'calc(100vh - 200px)'
                      }}
                    />
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={prevImage}
                className="absolute left-2 bg-white/80 hover:bg-white text-black p-1.5 rounded-full shadow-md z-30"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 bg-white/80 hover:bg-white text-black p-1.5 rounded-full shadow-md z-30"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* SIZE GRID */}
            <div className="w-full mt-12 mb-12 px-2">
              <div className="grid grid-cols-2 gap-2">
                {data.images.sizes.map((item, index) => {
                  const isWide = item.size === "A1" || item.size === "A0";

                  if (isWide) {
                    return (
                      <div key={index} className="col-span-2 flex flex-col items-center">
                        <div
                          className="relative cursor-pointer hover:opacity-90 transition-opacity duration-300 group w-full"
                          onClick={() => handleSizeClick(item)}
                        >
                          <img
                            src={apiAsset(item.image)}
                            alt={item.size}
                            className="w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded" />
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      key={index}
                      className="relative cursor-pointer hover:opacity-90 transition-opacity duration-300 group"
                      onClick={() => handleSizeClick(item)}
                    >
                      <img
                        src={apiAsset(item.image)}
                        alt={item.size}
                        className="w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded" />
                      
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {i18n.language === "id" ? "Klik" : "Click"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* PORTFOLIO */}
          <section ref={el => (sectionsRef.current[3] = el)} className="w-full mt-8 mb-10 relative">
            <SectionTitle title={data.titles.portofolio} />
            <div className="flex justify-center px-3">
              <img
                src={apiAsset(data.images.extra.portofolio)}
                alt="Portfolio"
                className="w-full max-w-[95%] object-contain"
              />
            </div>
          </section>

          {/* CARTOON */}
          <section ref={el => (sectionsRef.current[4] = el)} className="w-full mt-8 mb-10 relative">
            <SectionTitle title={data.titles.cartoon} />
            <div className="flex justify-center px-3">
              <img
                src={apiAsset(data.images.extra.cartoon)}
                alt="Cartoon Body"
                className="w-full max-w-[95%] object-contain"
              />
            </div>
          </section>

          {/* FACE WITH CARTOON BODY */}
          <section ref={el => (sectionsRef.current[5] = el)} className="w-full mt-8 mb-10 relative">
            <SectionTitle title={data.titles.facewithcartoonbody} />
            <div className="flex justify-center px-3">
              <img
                src={apiAsset(data.images.extra.faceWithCartoonBody)}
                alt="Face with Cartoon Body"
                className="w-full max-w-[95%] object-contain"
              />
            </div>
          </section>
        </main>

        <Footer />

        {/* FULLSCREEN PREVIEW */}
        {selectedImage &&
          ReactDOM.createPortal(
            <div
              className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center animate-fadeIn"
              onClick={() => setSelectedImage(null)}
            >
              <button
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xl font-bold w-7 h-7 rounded-full flex items-center justify-center z-[1000]"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>

              <div
                className="relative flex items-center justify-center px-2"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedImage}
                  alt="Full view"
                  className="object-contain rounded-lg shadow-xl max-w-[95vw] max-h-[70vh] transition-transform duration-300 ease-out scale-100 hover:scale-[1.01]"
                />
              </div>
            </div>,
            document.body
          )}
      </div>
    );
  }

  // ================= DESKTOP LAYOUT =================
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* FRAME SIZE */}
        <section ref={el => (sectionsRef.current[0] = el)} className="max-w-7xl mx-auto px-4 md:px-10">
          <SectionTitle title={data.titles.frameSize} />
          <div className="relative flex justify-center items-center">
            <img
              src={apiAsset(data.images.frame.base)}
              alt="Frame Size Base"
              className="w-full md:w-4/5 lg:w-3/4 object-contain"
            />
            <img
              src={apiAsset(data.images.frame.overlay)}
              alt="Frame Size Overlay"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-full md:w-4/5 lg:w-3/4 object-contain pointer-events-none"
            />
          </div>
        </section>

        {/* SIZE COMPARISON */}
        <section ref={el => (sectionsRef.current[1] = el)} className="max-w-7xl mx-auto px-4 md:px-10 mt-12 md:mt-20">
          <SectionTitle title={data.titles.sizeComparison} />
          <div className="flex justify-center">
            <img
              src={apiAsset(data.images.frame.comparison)}
              alt="Size Comparison"
              className="w-full md:w-4/5 lg:w-3/4 object-contain"
            />
          </div>
        </section>

        {/* SIZE ON HAND - CAROUSEL */}
        <section ref={el => (sectionsRef.current[2] = el)} className="w-full mt-12 md:mt-20 mb-16 md:mb-24 relative">
          <SectionTitle title={data.titles.sizeOnHand} />

          <div className="relative flex justify-center items-center overflow-visible px-4 md:px-10">
            <div className="flex items-center justify-center w-full relative min-h-[300px] md:min-h-[400px] mt-6 md:mt-10">
              {data.images.onHand.map((img, index) => {
                const isActive = index === currentIndex;
                const isNext = index === (currentIndex + 1) % data.images.onHand.length;
                const isPrev = index === (currentIndex === 0 ? data.images.onHand.length - 1 : currentIndex - 1);

                const position = isActive
                  ? "scale-100 opacity-100 z-20"
                  : isNext
                  ? "translate-x-[15%] scale-90 opacity-70 z-10"
                  : isPrev
                  ? "-translate-x-[15%] scale-90 opacity-70 z-10"
                  : "opacity-0 pointer-events-none";

                return (
                  <img
                    key={index}
                    src={apiAsset(img)}
                    alt={`On Hand ${index + 1}`}
                    className={`absolute transition-all duration-700 ease-in-out rounded-xl shadow-xl cursor-pointer w-[55vw] lg:w-[40vw] object-cover ${position}`}
                    onClick={() => setSelectedImage(apiAsset(img))}
                  />
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevImage}
              className="absolute bg-white/70 hover:bg-white text-black p-3 rounded-full shadow-lg z-30 transition-all hover:scale-110 border border-gray-100"
              style={{ 
                left: 'calc(50% - 20vw - 20px)',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={nextImage}
              className="absolute bg-white/70 hover:bg-white text-black p-3 rounded-full shadow-lg z-30 transition-all hover:scale-110 border border-gray-100"
              style={{ 
                right: 'calc(50% - 20vw - 20px)',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

          {/* SIZE GRID */}
          <div className="w-full mt-12 md:mt-16">
            <div className="grid grid-cols-2 gap-2">
              {data.images.sizes.map((item, index) => {
                const isLeftColumn = index % 2 === 0;
                const isWide = item.size === "A1" || item.size === "A0";

                if (isWide) {
                  return (
                    <div key={index} className="col-span-2 flex flex-col items-center">
                      <div
                        className="relative cursor-pointer hover:opacity-90 transition-opacity duration-300 mb-2 group"
                        onClick={() => handleSizeClick(item)}
                      >
                        <img
                          src={apiAsset(item.image)}
                          alt={item.size}
                          className="w-[1213px] h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded" />
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div
                    key={index}
                    className={`${isLeftColumn ? 'ml-8' : 'mr-8'} relative cursor-pointer hover:opacity-90 transition-opacity duration-300 group`}
                    onClick={() => handleSizeClick(item)}
                  >
                    <img
                      src={apiAsset(item.image)}
                      alt={item.size}
                      className="w-[600px] h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded" />
                    
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {i18n.language === "id" ? "Klik untuk melihat produk" : "Click to view product"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PORTFOLIO */}
        <section ref={el => (sectionsRef.current[3] = el)} className="w-full mt-12 md:mt-20 mb-16 md:mb-24 relative">
          <SectionTitle title={data.titles.portofolio} />
          <div className="flex justify-center">
            <img
              src={apiAsset(data.images.extra.portofolio)}
              alt="Portfolio"
              className="w-full md:w-4/5 lg:w-3/4 object-contain"
            />
          </div>
        </section>

        {/* CARTOON */}
        <section ref={el => (sectionsRef.current[4] = el)} className="w-full mt-12 md:mt-20 mb-16 md:mb-24 relative">
          <SectionTitle title={data.titles.cartoon} />
          <div className="flex justify-center">
            <img
              src={apiAsset(data.images.extra.cartoon)}
              alt="Cartoon Body"
              className="w-full md:w-4/5 lg:w-3/4 object-contain"
            />
          </div>
        </section>

        {/* FACE WITH CARTOON BODY */}
        <section ref={el => (sectionsRef.current[5] = el)} className="w-full mt-12 md:mt-20 mb-16 md:mb-24 relative">
          <SectionTitle title={data.titles.facewithcartoonbody} />
          <div className="flex justify-center">
            <img
              src={apiAsset(data.images.extra.faceWithCartoonBody)}
              alt="Face with Cartoon Body"
              className="w-full md:w-4/5 lg:w-3/4 object-contain"
            />
          </div>
        </section>
      </main>

      <Footer />

      {/* FULLSCREEN PREVIEW */}
      {selectedImage &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center animate-fadeIn"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-6 right-6 bg-black/60 hover:bg-black/80 text-white text-3xl font-bold w-10 h-10 rounded-full flex items-center justify-center z-[1000]"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>

            <div
              className="relative flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Full view"
                className="object-contain rounded-xl shadow-2xl max-w-[70vw] max-h-[80vh] transition-transform duration-300 ease-out scale-100 hover:scale-[1.03]"
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default SizeGuide;