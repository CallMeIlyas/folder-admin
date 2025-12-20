import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

export const useScrollSmoother = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return;

    //  pastikan scroll direset saat reload
    window.scrollTo(0, 0);

    //  fix layout bug di React: force height
    wrapperRef.current.style.height = "100vh";
    wrapperRef.current.style.overflow = "hidden";
    contentRef.current.style.willChange = "transform";
    contentRef.current.style.backfaceVisibility = "hidden";

    //  buat smoother
    const smoother = ScrollSmoother.create({
      wrapper: wrapperRef.current,
      content: contentRef.current,
    
      //  Super buttery smooth setup
      smooth: 5.9,          
      smoothTouch: 1.3,     
      inertia: 1.6,         
      speed: 0.65,          
      normalizeScroll: true,
      ignoreMobileResize: true,
      effects: true,
    
      // respons lebih natural
      smoothTouchInertia: 1.1,
    });

    // sync ScrollTrigger refresh 
    ScrollTrigger.refresh(true);

    return () => {
      smoother.kill();
      ScrollTrigger.killAll();
    };
  }, []);

  return { wrapperRef, contentRef };
};