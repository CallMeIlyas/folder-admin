import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";
import { apiFetch, apiAsset } from "@/utils/api";

gsap.registerPlugin(ScrollTrigger);

type HeroData = {
  logoUrl: string;
  imageUrl: string;
  description: string;
};

const Hero = () => {
  const { i18n } = useTranslation();

  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [heroData, setHeroData] = useState<HeroData | null>(null);

  const sectionRef = useRef<HTMLElement | null>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Deteksi Mobile / Desktop
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Fetch Hero Content berdasarkan bahasa
  useEffect(() => {
    apiFetch(`/api/content/hero?lang=${i18n.language}`)
      .then(res => res.json())
      .then(data => setHeroData(data))
      .catch(console.error);
  }, [i18n.language]);

  // Animasi GSAP
  useEffect(() => {
    if (isMobile === null || !heroData) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 60%",
          toggleActions: "play none none reverse",
        },
        defaults: { ease: "power3.out" },
        delay: 1.1,
      });

      tl.from(logoRef.current, {
        opacity: 0,
        y: -60,
        scale: 0.9,
        duration: 1.2,
        ease: "power2.out",
      });

      tl.from(
        textRef.current,
        {
          opacity: 0,
          y: 35,
          duration: 1.0,
          ease: "power2.out",
        },
        "-=0.6"
      );

      tl.from(
        imageRef.current,
        {
          opacity: 0,
          scale: 0.96,
          duration: 1.3,
          ease: "power2.out",
        },
        "-=0.7"
      );

      gsap.to(imageRef.current, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.1,
        },
      });
    });

    return () => ctx.revert();
  }, [isMobile, heroData]);

  if (isMobile === null || !heroData) return null;

  // ================= Desktop Layout =================
  const DesktopLayout = () => (
    <section
      ref={sectionRef}
      className="flex justify-between px-12 py-14 items-start gap-10"
    >
      <div className="max-w-[500px]">
        <img
          ref={logoRef}
          src={apiAsset(heroData.logoUrl)}
          alt="Little Amora - Caricature 3D Frame"
          className="w-full max-w-[300px] mb-5"
        />
        <p
          ref={textRef}
          className="font-poppinsRegular text-[14px] leading-[1.7] text-[#444] max-w-[310px] text-justify"
        >
          {heroData.description}
        </p>
      </div>

      <div>
        <img
          ref={imageRef}
          src={apiAsset(heroData.imageUrl)}
          alt="Caricature Frame"
          className="max-w-[1000px] w-full rounded-[10px]"
        />
      </div>
    </section>
  );

  // ================= Mobile Layout =================
  const MobileLayout = () => (
    <section
      ref={sectionRef}
      className="flex flex-col px-6 py-10 gap-4 items-center"
    >
      <img
        ref={logoRef}
        src={apiAsset(heroData.logoUrl)}
        alt="Little Amora - Caricature 3D Frame"
        className="w-full max-w-[270px] mb-4 -translate-y-5"
      />
      <p
        ref={textRef}
        className="font-poppinsRegular text-[14px] leading-[1.6] text-[#444] text-justify -mt-10"
      >
        {heroData.description}
      </p>
      <img
        ref={imageRef}
        src={apiAsset(heroData.imageUrl)}
        alt="Caricature Frame"
        className="w-full max-w-[500px] rounded-[10px] mt-10"
      />
    </section>
  );

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};

export default Hero;