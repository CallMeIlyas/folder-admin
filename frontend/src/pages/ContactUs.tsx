import React from "react";
import Footer from "../components/home/Footer";
import { useTranslation } from "react-i18next";
import ShopeeIcon from "../assets/icon-contact/shopee.png";
import GmailIcon from "../assets/icon-contact/gmail.png";
import GMapsIcon from "../assets/icon-contact/gmaps.png";
import IGIcon from "../assets/icon-contact/IG.png";
import TikTokIcon from "../assets/icon-contact/TIKTOK.png";
import WhatsAppIcon from "../assets/icon-contact/whatsapp.png";

const ContactUs: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <div className="min-h-screen flex flex-col">
      {/* MOBILE LAYOUT - hanya tampil di mobile */}
      <div className="block md:hidden">
        {/* Mobile Split Border Title */}
        <div className="relative my-6 mb-8 text-center">
          <h1 className="inline-block px-4 text-xl font-nataliecaydence relative z-10">
            {currentLang === "id" ? "Kontak Kami" : "Contact Us"}
          </h1>
          <div className="absolute top-1/2 left-0 w-[15%] border-t-2 border-black transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-[15%] border-t-2 border-black transform -translate-y-1/2"></div>
        </div>

        {/* Mobile Main Content */}
        <main className="flex flex-col gap-3 items-center pb-6 px-4">
          {/* Shopee - Mobile */}
          <a
            href="https://id.shp.ee/FGfGHup"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full max-w-[320px] py-2 px-4 border border-black rounded-full bg-white shadow-sm transition-transform hover:scale-105"
          >
            <img src={ShopeeIcon} alt="Shopee Logo" className="w-[60px] h-auto mr-3" />
            <div className="flex flex-col">
              <span className="font-poppinsBold text-xs">Shopee</span>
              <span className="font-poppinsRegular text-xs">littleamorakarikatur</span>
            </div>
          </a>

          {/* Gmail - Mobile */}
          <a
            href="mailto:littleamoradesign@gmail.com"
            className="flex items-center w-full max-w-[320px] py-2 px-4 border border-black rounded-full bg-white shadow-sm transition-transform hover:scale-105"
          >
            <img src={GmailIcon} alt="Gmail Logo" className="w-[60px] h-auto mr-3" />
            <div className="flex flex-col">
              <span className="font-poppinsBold text-xs">Gmail</span>
              <span className="font-poppinsRegular text-xs">littleamoradesign@gmail.com</span>
            </div>
          </a>

          {/* Google Maps - Mobile */}
          <a
            href="https://share.google/3NK3xtA32ThyT5hxH"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full max-w-[320px] py-2 px-4 border border-black rounded-full bg-white shadow-sm transition-transform hover:scale-105"
          >
            <img src={GMapsIcon} alt="Maps Logo" className="w-[60px] h-auto mr-3" />
            <div className="flex flex-col">
              <span className="font-poppinsBold text-xs">Google Maps</span>
              <span className="font-poppinsRegular text-xs">Little Amora Karikatur</span>
            </div>
          </a>

          {/* Instagram - Mobile */}
          <a
            href="https://www.instagram.com/alittleamora"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full max-w-[320px] py-2 px-4 border border-black rounded-full bg-white shadow-sm transition-transform hover:scale-105"
          >
            <img src={IGIcon} alt="Instagram Logo" className="w-[60px] h-auto mr-3" />
            <div className="flex flex-col">
              <span className="font-poppinsBold text-xs">Instagram</span>
              <span className="font-poppinsRegular text-xs">@alittleamora</span>
            </div>
          </a>

          {/* TikTok - Mobile */}
          <a
            href="https://www.tiktok.com/@alittleamora"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full max-w-[320px] py-2 px-4 border border-black rounded-full bg-white shadow-sm transition-transform hover:scale-105"
          >
            <img src={TikTokIcon} alt="TikTok Logo" className="w-[60px] h-auto mr-3" />
            <div className="flex flex-col">
              <span className="font-poppinsBold text-xs">TikTok</span>
              <span className="font-poppinsRegular text-xs">@alittleamora</span>
            </div>
          </a>

          {/* WhatsApp - Mobile */}
          <a
            href="https://wa.me/6281380340307"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full max-w-[320px] py-2 px-4 border border-black rounded-full bg-white shadow-sm transition-transform hover:scale-105"
          >
            <img src={WhatsAppIcon} alt="WhatsApp Logo" className="w-[60px] h-auto mr-3" />
            <div className="flex flex-col">
              <span className="font-poppinsBold text-xs">WhatsApp</span>
              <span className="font-poppinsRegular text-xs">+6281380340307</span>
            </div>
          </a>

          {/* Deskripsi - Mobile */}
          <div className="font-poppinsRegular text-justify mb-16 mt-6 max-w-full text-center leading-relaxed text-sm px-2">
            {currentLang === "id" ? (
              <>
                <p className="mb-4">
                  <span className="font-poppinsSemiBold">Seluruh diskusi order dan tanya jawab</span> hanya melalui WhatsApp saja.  
                  Social Media hanya bertujuan untuk menjadi galeri foto atau video. Email dan Google Drive bisa untuk  
                  kirim data yang lebih besar dan lengkap. Tim kami tidak berkewajiban membalas dan berdiskusi di  
                  platform social media.
                </p>

                <p>
                  Mohon mengingat bahwa payment hanya atas nama <span className="font-poppinsSemiBold">Claresta</span> atau <span className="font-poppinsSemiBold">Little Amora Karikatur</span> dengan nomor WhatsApp tertera diatas,  
                  silahkan berikan bukti pembayaran ke chat WhatsApp kami. Untuk pengiriman luar negeri, pembayaran bisa menggunakan Paypal,  
                  silahkan kontak admin lebih lanjut.
                </p>
              </>
            ) : (
              <>
                <p className="mb-4">
                  <span className="font-poppinsSemiBold">All discussion and order</span> available on WhatsApp only.  
                  Our social media used for gallery purpose. Email or Google Drive used for  
                  transferring big size data. Our team do not reply and open discussion on any  
                  platform besides WhatsApp.
                </p>

                <p>
                  Please note for all payment only on behalf of   
                  <span className="font-poppinsSemiBold"> Claresta</span> or <span className="font-poppinsSemiBold">Little Amora Karikatur</span>, please  
                  ensure to copy the payment info directly on the chat that our team gave to the  
                  customer. For worldwide shipping our team used Paypal, please contact us for  
                  further information.
                </p>
              </>
            )}
          </div>
        </main>
      </div>

      {/* DESKTOP LAYOUT - hanya tampil di desktop */}
      <div className="hidden md:block">
        {/* Desktop Split Border Title */}
        <div className="relative my-8 mb-10 text-center">
          <h1 className="inline-block px-5 text-4xl md:text-5xl font-nataliecaydence relative z-10">
            {currentLang === "id" ? "Kontak Kami" : "Contact Us"}
          </h1>
          <div className="absolute top-1/2 left-0 w-[20%] border-t-4 border-black transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-[20%] border-t-4 border-black transform -translate-y-1/2"></div>
        </div>

        {/* Desktop Main Content */}
        <main className="flex flex-col gap-4 items-center pb-8">
          {/* Shopee - Desktop */}
          <a
            href="https://id.shp.ee/FGfGHup"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full max-w-[420px] py-1 px-5 border-[1px] border-black rounded-full bg-white shadow-sm transition-transform hover:scale-105"
          >
            <img src={ShopeeIcon} alt="Shopee Logo" className="w-[80px] h-auto mr-4" />
            <div className="flex flex-col">
              <span className="font-poppinsBold text-[13px]">Shopee</span>
              <span className="font-poppinsRegular">littleamorakarikatur</span>
            </div>
          </a>

          {/* Gmail - Desktop */}
          <a
            href="mailto:littleamoradesign@gmail.com"
            className="flex items-center w-full max-w-[420px] py-1 px-5 border-[1px] border-black rounded-full bg-white shadow-sm transition-transform hover:scale-105"
          >
            <img src={GmailIcon} alt="Gmail Logo" className="w-[80px] h-auto mr-4" />
            <div className="flex flex-col">
              <span className="font-poppinsBold text-[13px]">Gmail</span>
              <span className="font-poppinsRegular">littleamoradesign@gmail.com</span>
            </div>
          </a>

          {/* Google Maps - Desktop */}
          <a
            href="https://share.google/3NK3xtA32ThyT5hxH"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full max-w-[420px] py-1 px-5 border-[1px] border-black rounded-full bg-white shadow-sm transition-transform hover:scale-105"
          >
            <img src={GMapsIcon} alt="Maps Logo" className="w-[80px] h-auto mr-4" />
            <div className="flex flex-col">
              <span className="font-poppinsBold text-[13px]">Google Maps</span>
              <span className="font-poppinsRegular">Little Amora Karikatur</span>
            </div>
          </a>

          {/* Instagram - Desktop */}
          <a
            href="https://www.instagram.com/alittleamora"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full max-w-[420px] py-1 px-5 border-[1px] border-black rounded-full bg-white shadow-sm transition-transform hover:scale-105"
          >
            <img src={IGIcon} alt="Instagram Logo" className="w-[80px] h-auto mr-4" />
            <div className="flex flex-col">
              <span className="font-poppinsBold text-[13px]">Instagram</span>
              <span className="font-poppinsRegular">@alittleamora</span>
            </div>
          </a>

          {/* TikTok - Desktop */}
          <a
            href="https://www.tiktok.com/@alittleamora"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full max-w-[420px] py-1 px-5 border-[1px] border-black rounded-full bg-white shadow-sm transition-transform hover:scale-105"
          >
            <img src={TikTokIcon} alt="TikTok Logo" className="w-[80px] h-auto mr-4" />
            <div className="flex flex-col">
              <span className="font-poppinsBold text-[13px]">TikTok</span>
              <span className="font-poppinsRegular">@alittleamora</span>
            </div>
          </a>

          {/* WhatsApp - Desktop */}
          <a
            href="https://wa.me/6281380340307"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full max-w-[420px] py-1 px-5 border-[1px] border-black rounded-full bg-white shadow-sm transition-transform hover:scale-105"
          >
            <img src={WhatsAppIcon} alt="WhatsApp Logo" className="w-[80px] h-auto mr-4" />
            <div className="flex flex-col">
              <span className="font-poppinsBold text-[13px]">WhatsApp</span>
              <span className="font-poppinsRegular">+6281380340307</span>
            </div>
          </a>

          {/* Deskripsi - Desktop */}
          <div className="font-poppinsRegular text-justify mb-[100px] mt-8 max-w-[700px] text-center leading-relaxed text-[15px]">
            {currentLang === "id" ? (
              <>
                <p className="mb-4">
                  <span className="font-poppinsSemiBold">Seluruh diskusi order dan tanya jawab</span> hanya melalui WhatsApp saja.  
                  Social Media hanya bertujuan untuk menjadi galeri foto atau video. Email dan Google Drive bisa untuk  
                  kirim data yang lebih besar dan lengkap. Tim kami tidak berkewajiban membalas dan berdiskusi di  
                  platform social media.
                </p>

                <p>
                  Mohon mengingat bahwa payment hanya atas nama <span className="font-poppinsSemiBold">Claresta</span> atau <span className="font-poppinsSemiBold">Little Amora Karikatur</span> dengan nomor WhatsApp tertera diatas,  
                  silahkan berikan bukti pembayaran ke chat WhatsApp kami. Untuk pengiriman luar negeri, pembayaran bisa menggunakan Paypal,  
                  silahkan kontak admin lebih lanjut.
                </p>
              </>
            ) : (
              <>
                <p className="mb-4">
                  <span className="font-poppinsSemiBold">All discussion and order</span> available on WhatsApp only.  
                  Our social media used for gallery purpose. Email or Google Drive used for  
                  transferring big size data. Our team do not reply and open discussion on any  
                  platform besides WhatsApp.
                </p>

                <p>
                  Please note for all payment only on behalf of   
                  <span className="font-poppinsSemiBold"> Claresta</span> or <span className="font-poppinsSemiBold">Little Amora Karikatur</span>, please  
                  ensure to copy the payment info directly on the chat that our team gave to the  
                  customer. For worldwide shipping our team used Paypal, please contact us for  
                  further information.
                </p>
              </>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default ContactUs;