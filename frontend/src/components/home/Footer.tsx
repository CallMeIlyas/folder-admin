import { useState, useEffect } from "react";
import logoFooter from "../../assets/logo/logo-amora-footer2.png";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useTranslation();
  const currrentYear = new Date().getFullYear();
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <footer className="w-full bg-[#dcbec1] overflow-hidden">
      {isMobile ? (
        <>
          {/* MOBILE VIEW */}
          <div className="flex flex-row items-start justify-between px-4 py-9 w-full -mt-8">
            {/* Bagian kiri: Logo dan copyright perusahaan */}
            <div className="flex flex-col">
              <img
                src={logoFooter}
                alt="Little Amora Logo"
                className="h-[70px] w-auto object-contain"
              />
              <p className="font-poppinsRegular text-[8px] mt-5 -translate-y-8">
                <span className="text-lg relative top-0.5">©</span> 2018-{currrentYear} Little Amora Karikatur
              </p>
            </div>
            
            {/* Bagian kanan: Menu dan copyright creator */}
            <div className="flex flex-col items-end">
              <ul className="flex flex-col items-end mt-6 text-right">
                <li>
                  <a
                    href="/terms"
                    className="no-underline text-black font-poppinsBold whitespace-nowrap text-sm hover:opacity-70 transition-opacity"
                  >
                    {t("footer.terms")}
                  </a>
                </li>
              </ul>
              <p className="font-poppinsRegular text-[8px] text-right translate-y-0.5 mt-2">
                <span className="text-lg relative top-0.5">©</span> Created by{" "}
                <a href="" className="underline hover:opacity-70 transition-opacity">
                  Muhammad Ilyas
                </a>
              </p>
            </div>
          </div>
        </>
      ) : (
        // DESKTOP VIEW
        <div 
          className="flex items-center justify-between mx-auto"
          style={{ 
            maxWidth: 'calc(100% - min(8vw, 160px))',
            padding: '0 min(4vw, 80px)'
          }}
        >
          <div>
            <img
              src={logoFooter}
              alt="Little Amora Logo"
              className="h-[86px] w-auto object-contain"
              style={{ 
                transform: 'translateX(calc(-1 * min(5vw, 100px)))'
              }}
            />
            <p className="font-poppinsRegular text-[11px]"
              style={{ 
                transform: 'translateX(calc(-1 * min(4vw, 100px)))'
              }}
            >
              <span className="text-lg relative top-0.5">©</span> 2018-{currrentYear} Little Amora Karikatur
            </p>
          </div>
          
          <div>
            <ul className="flex flex-row text-right"
              style={{ 
                gap: 'min(3vw, 60px)',
                transform: 'translateX(calc(min(5vw, 100px)))'
              }}
            >
              <li style={{ transform: 'translateY(8px)' }}>
                <a
                  href="/terms"
                  className="no-underline text-black font-poppinsBold whitespace-nowrap text-base hover:opacity-70 transition-opacity"
                >
                  {t("footer.terms")}
                </a>
              </li>
              <li style={{ transform: 'translateY(10px)' }}>
                <a
                  href="/contact"
                  className="no-underline text-black font-poppinsBold whitespace-nowrap text-base hover:opacity-70 transition-opacity"
                >
                  {t("footer.contact")}
                </a>
              </li>
            </ul>
            <p className="font-poppinsRegular ml-3 text-[11px]"
              style={{ 
                transform: 'translate(calc(min(8vw, 120px)), calc(min(2vw, 40px)))'
              }}
            >
              <span className="text-lg relative top-0.5">©</span> Created by <a href="" className="underline hover:opacity-70 transition-opacity">Muhammad Ilyas</a>
            </p>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;