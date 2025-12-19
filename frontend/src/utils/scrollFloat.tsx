import { useEffect, useRef } from "react";
import gsap from "gsap";

type UseScrollFloatOptions = {
  rootMargin: string;
  threshold: number;
  inDuration: number;
  outDuration: number;
  yIn: number;
  yOut: number;
  blurIn: number;
  blurOut: number;
  stagger: number;
};

const defaults: UseScrollFloatOptions = {
  rootMargin: "0px 0px -10% 0px",
  threshold: 0.18,
  inDuration: 0.9,
  outDuration: 0.6,
  yIn: 40,
  yOut: 30,
  blurIn: 0,
  blurOut: 6,
  stagger: 0.12,
};

/**
 * Hook animasi scroll halus:
 * - Scroll down → muncul dari bawah
 * - Scroll up → muncul dari atas
 */
export const useScrollFloat = (
  selector = ".scroll-float",
  opts?: Partial<UseScrollFloatOptions>
) => {
  const cfg: UseScrollFloatOptions = { ...defaults, ...(opts || {}) };
  const lastScrollY = useRef(0);
  const scrollDir = useRef<"down" | "up">("down");

  useEffect(() => {
    if (typeof window === "undefined") return;

    //  Deteksi arah scroll (up/down)
    const handleScroll = () => {
      const current = window.scrollY;
      scrollDir.current = current > lastScrollY.current ? "down" : "up";
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", handleScroll);

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(selector)
    );
    if (!elements.length) return;

    // Set posisi awal elemen
    elements.forEach((el) => {
      const isGroup = el.dataset.scrollGroup === "true";
      if (isGroup) {
        const children = el.querySelectorAll<HTMLElement>(".float-item");
        children.forEach((c) =>
          gsap.set(c, { opacity: 0, y: cfg.yIn, filter: `blur(${cfg.blurOut}px)` })
        );
      } else {
        gsap.set(el, { opacity: 0, y: cfg.yIn, filter: `blur(${cfg.blurOut}px)` });
      }
    });

    const groupTimelines = new Map<HTMLElement, gsap.core.Timeline>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          const inView = entry.isIntersecting;
          const direction = scrollDir.current;

          const isGroup = el.dataset.scrollGroup === "true";
          const children = isGroup
            ? Array.from(el.querySelectorAll<HTMLElement>(".float-item"))
            : [];

          // arah muncul sesuai scroll
          const enterFromY =
            direction === "down" ? cfg.yIn : -cfg.yIn; // naik kalau down, turun kalau up

          if (inView) {
            if (isGroup) {
              const tl = gsap.timeline();
              tl.fromTo(
                children,
                {
                  opacity: 0,
                  y: enterFromY,
                  filter: `blur(${cfg.blurOut}px)`,
                },
                {
                  opacity: 1,
                  y: 0,
                  filter: `blur(${cfg.blurIn}px)`,
                  duration: cfg.inDuration,
                  ease: "power3.out",
                  stagger: cfg.stagger,
                  overwrite: true,
                }
              );
              groupTimelines.set(el, tl);
            } else {
              gsap.fromTo(
                el,
                {
                  opacity: 0,
                  y: enterFromY,
                  filter: `blur(${cfg.blurOut}px)`,
                },
                {
                  opacity: 1,
                  y: 0,
                  filter: `blur(${cfg.blurIn}px)`,
                  duration: cfg.inDuration,
                  ease: "power3.out",
                  overwrite: true,
                }
              );
            }
          } else {
            // keluar dari viewport → hilang halus
            if (isGroup) {
              gsap.to(children, {
                opacity: 0,
                y: cfg.yOut,
                filter: `blur(${cfg.blurOut}px)`,
                duration: cfg.outDuration,
                ease: "power2.inOut",
                stagger: cfg.stagger / 1.5,
                overwrite: true,
              });
            } else {
              gsap.to(el, {
                opacity: 0,
                y: cfg.yOut,
                filter: `blur(${cfg.blurOut}px)`,
                duration: cfg.outDuration,
                ease: "power2.inOut",
                overwrite: true,
              });
            }
          }
        });
      },
      {
        root: null,
        rootMargin: cfg.rootMargin,
        threshold: cfg.threshold,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
      groupTimelines.forEach((tl) => tl.kill());
      groupTimelines.clear();
    };
  }, [selector, JSON.stringify(opts || {})]);
};

export default useScrollFloat;