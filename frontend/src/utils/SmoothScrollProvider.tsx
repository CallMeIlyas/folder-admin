import React, { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SmoothScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    let lenis: Lenis | null = null;
    let rafId: number;

    //  Desktop pakai smooth inertia, Mobile pakai scroll native
    if (!isMobile) {
      lenis = new Lenis({
        duration: 1.6,        
        smoothWheel: true,
        smoothTouch: false,   
        touchMultiplier: 1.4,
        wheelMultiplier: 1.15,
        lerp: 0.08,           
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
      });

      const raf = (time: number) => {
        lenis!.raf(time);
        gsap.ticker.tick(time / 1000);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    }

    //  Sinkronisasi dengan PageTransition
    const handleTransitionDone = () => {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
        ScrollTrigger.refresh(true);
      } else {
        ScrollTrigger.refresh(true);
        window.scrollTo({ top: 0 });
      }
    };

    window.addEventListener("pageTransition:done", handleTransitionDone);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pageTransition:done", handleTransitionDone);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScrollProvider;