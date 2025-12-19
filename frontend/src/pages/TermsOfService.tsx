import React from 'react';
import Footer from '../components/home/Footer';
import { useTranslation } from 'react-i18next';

const TermsOfService: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* MOBILE LAYOUT - hanya tampil di mobile */}
      <div className="block md:hidden">
        {/* Mobile Split Border Title */}
        <div className="relative my-6 -mb-2 text-center">
          <h1 className="inline-block px-4 text-xl font-nataliecaydence relative z-10">
            {currentLang === "id" ? "Mengenai Pembayaran" : "Terms Of Service"}
          </h1>
          <div className="absolute top-1/2 left-0 w-[15%] border-t-2 border-black transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-[15%] border-t-2 border-black transform -translate-y-1/2"></div>
        </div>

        {/* Mobile Main Content */}
        <main className="container mx-auto px-4 flex-grow">
          <section className="flex flex-col gap-0">
            
            {/* Payment Section - Mobile */}
            <section className="-mb-2">
              <div className="relative h-px my-6">
                <div className="absolute top-2 left-4 h-full w-[20%] border-t-2 border-black translate-y-4"></div>
              </div>

              <div className="flex flex-col gap-4 pb-4">
                <div className="font-semibold pl-4">
                  <p className="font-poppinsSemiBold text-xs m-0 text-black">
                    {currentLang === "id" ? "Ketentuan" : "Regarding"}
                  </p>
                  <h3 className="font-poppinsBold m-0 text-sm">
                    {currentLang === "id" ? "Pembayaran" : "Payment"}
                  </h3>
                </div>

                <div>
                  <ul className="font-poppinsRegular m-0 list-disc pl-5 space-y-3">
                    <li className="leading-relaxed text-sm">
                      {currentLang === "id" 
                        ? "Seluruh customer harus mengisi format order"
                        : "All customer must fill the order format"
                      }
                    </li>
                    <li className="leading-relaxed text-sm">
                      {currentLang === "id" 
                        ? "Full payment dibawah order Rp 5.000.000,-"
                        : "Full payment for order below Rp. 5.000.000,-"
                      }
                    </li>
                    <li className="leading-relaxed text-sm text-justify">
                      {currentLang === "id" 
                        ? <>
                            Ketentuan DP:<br />
                            DP 1 = saat customer order<br />
                            DP 2 = setelah customer acc preview desain yang diberikan tim kami, bukan setelah paket sampai.
                          </>
                        : <>
                            Terms of Down Payment:<br />
                            First Down Payment = when customer make an order<br />
                            Final Down Payment = after the customer accept the preview design, then customer can make the final payment.  
                            The second payment is not made after the goods arrive as we are making a handmade products.
                          </>
                      }
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Design Revision Section - Mobile */}
            <section className="-mb-2">
              <div className="relative h-px my-6">
                <div className="absolute top-2 left-4 h-full w-[20%] border-t-2 border-black translate-y-4"></div>
              </div>

              <div className="flex flex-col gap-4 pb-4">
                <div className="font-semibold pl-4">
                  <p className="font-poppinsSemiBold text-xs m-0 text-black">
                    {currentLang === "id" ? "Ketentuan" : "Regarding"}
                  </p>
                  <h3 className="font-poppinsBold m-0 text-sm">
                    {currentLang === "id" ? "Revisi Desain" : "Design Revision"}
                  </h3>
                </div>

                <div>
                  <ul className="font-poppinsRegular m-0 list-disc pl-5 space-y-3">
                    <li className="leading-relaxed text-sm text-justify">
                      {currentLang === "id" 
                        ? "Kami menerima revisi minor 2x, customer tidak bisa ganti background setelah preview desain dikasih oleh tim kami. Silahkan berikan sketsa kasar di awal, seperti peletakkan tulisan, pose, seragam yang dipakai, nama, ucapan, logo, dan berikan referensi foto background."
                        : "We accept minor revision for 2 times, customer can't change the background if our team already give a design preview. Please tell the brief design at the beginning, customer can send us background photos references or rough sketch to show the people order position, logo, greetings, and other objects placement."
                      }
                    </li>
                    <li className="leading-relaxed text-sm text-justify">
                      {currentLang === "id" 
                        ? "Untuk order deadline, mohon perhatikan revisi yang diberikan kepada tim kami. Kami tidak bertanggung jawab untuk memenuhi waktu deadline, jika revisinya lebih dari 3x, karena kami memproses frame sesuai urutan customer yang duluan order beserta tanggal deadlinenya. Meskipun kami menyanggupi deadline di awal, namun tidak berarti customer bisa memberikan revisi terus menerus."
                        : "If customer has a deadline time, please consider in giving the number of the design revision, as our team already make the design based on the first brief that customer give. We can not guarantee to fulfil the deadline time if the customer give us revision more than 3 times. Please understand that we already handling and arrange all order based on the process time which customer and our team have agreed from the beginning."
                      }
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Caricature Section - Mobile */}
            <section className="-mb-2">
              <div className="relative h-px my-6">
                <div className="absolute top-2 left-4 h-full w-[20%] border-t-2 border-black translate-y-4"></div>
              </div>

              <div className="flex flex-col gap-4 pb-4">
                <div className="font-semibold pl-4">
                  <p className="font-poppinsSemiBold text-xs m-0 text-black">
                    {currentLang === "id" ? "Ketentuan" : "Regarding"}
                  </p>
                  <h3 className="font-poppinsBold m-0 text-sm">
                    {currentLang === "id" ? "Karikatur" : "Caricature"}
                  </h3>
                </div>

                <div>
                  <ul className="font-poppinsRegular m-0 list-disc pl-5 space-y-3">
                    <li className="leading-relaxed text-sm text-justify">
                      {currentLang === "id" 
                        ? "Karikatur dibuat sesuai garis wajah foto asli yang diberikan, style ilustrasi kami berupa vector ilustrasi, kami tidak menggunakan AI untuk membuat karikatur, kecuali etalase 3D. Jika customer ingin ganti foto, silahkan checkout tambahan wajah di etalase, proses tambahan per 1 wajah adalah 1 hari kerja."
                        : "The caricature face made from the same face line from the original photos, our team make it as vector illustration, we do not use Al to make the caricature face. If customer want to change to other photos, customers are subject to additional charges per 1 face caricature, and 1 day additional process time added."
                      }
                    </li>
                    <li className="leading-relaxed text-sm text-justify">
                      {currentLang === "id" 
                        ? "Tim kami tidak bertanggung jawab melaporkan progres desain ke customer, karena kami sudah memberikan tanggal estimasi preview desainnya. Customer harus menunggu sampai preview desainnya jadi. Mohon pengertiannya bahwa kami tidak mengerjakan order 1 customer saja, sistem ini dibuat agar kami bisa lebih teliti dan supaya ga banyak salah, kami bisa fokus ngerjain tanpa dikejar kejar customer."
                        : "Our team is not obliged to report any of the progress to the customer, we already give the date of the design preview, customer must wait until we give the design preview. Please understand that we are handling more than one order, this system was made so our team can achieve more focus in making the products and making less error in the process."
                      }
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Shipping & Delivery Section - Mobile */}
            <section className="-mb-2">
              <div className="relative h-px my-6">
                <div className="absolute top-2 left-4 h-full w-[20%] border-t-2 border-black translate-y-4"></div>
              </div>

              <div className="flex flex-col gap-4 pb-4">
                <div className="font-semibold pl-4">
                  <p className="font-poppinsSemiBold text-xs m-0 text-black">
                    {currentLang === "id" ? "Ketentuan" : "Regarding"}
                  </p>
                  <h3 className="font-poppinsBold m-0 text-sm">
                    {currentLang === "id" ? "Pengiriman Barang" : "Shipping & Delivery"}
                  </h3>
                </div>

                <div>
                  <ul className="font-poppinsRegular m-0 list-disc pl-5 space-y-3">
                    <li className="leading-relaxed text-sm text-justify">
                      {currentLang === "id" 
                        ? "Silahkan menginfokan alamat lengkap seperti blok,nomor,kavling, dan lainnya. Tidak menerima screenshot alamat, mohon isi alamat sesuai format yang sudah kami berikan, untuk mempermudah kami dan pihak kurir mengerti. Customer harus mengingat, bahwa alamat bisa beda sesuai aplikasi yang dipakai, contoh: Grab, Gojek, Maxim, Google Maps, Grab Map tidak terhubung ke Google Maps, mereka punya server sendiri. Gojek kehubung ke Google Maps, namun kadang banyak alamat gak ada pin pointnya. Makadari itu, customer harus menginformasikan di awal seluruh detailnya."
                        : "Please share the precise address for the receiver locations and details for example office hour, drop zone, etc. We won't take any responsibility if the product sent to a mistaken locations due to lack of informations and detail given by customer, or customer missed a call from the driver during the delivery process."
                      }
                    </li>
                    <li className="leading-relaxed text-sm text-justify">
                      {currentLang === "id" 
                        ? "Kami tidak bertanggung jawab jika driver/kurir salah kirim barang karena kurang lengkap, atau customer ga bisa dihubungi oleh driver. Customer harus tau bahwa aplikasi Grab atau Gojek menelfon melalui aplikasinya dan telfon nomor asli, driver ga tau nomor WhatsApp penerima paket, karena di ban oleh pihak Grab/Gojek. Jika driver teliti, nomor WhatsApp tertera di paket frame yang kami bungkus. Kurir JNE sekarang hanya menerima telfon nomor asli atau WhatsApp, tidak menerima nomor telfon kantor/rumah lagi."
                        : "For shipping process, our team can order the Grab Express or Gosend, please note that we already give the customer data, such as address, note, and phone number on the application. Sometimes there is an issue about the application notification do not show up or do not pop up on the customer's phone. Therefore we give the customer's WhatsApp number to the driver. If there is issues about the delivery process, we can help to report the driver via Gojek or Grab application. This is the farthest assistance we could provide for the customer, so customer must pay attention with their phone when our team order the delivery from the application."
                      }
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Defect Product Section - Mobile */}
            <section className="-mb-2">
              <div className="relative h-px my-6">
                <div className="absolute top-2 left-4 h-full w-[20%] border-t-2 border-black translate-y-4"></div>
              </div>

              <div className="flex flex-col gap-4 pb-4">
                <div className="font-semibold pl-4">
                  <p className="font-poppinsSemiBold text-xs m-0 text-black">
                    {currentLang === "id" ? "Ketentuan" : "Regarding"}
                  </p>
                  <h3 className="font-poppinsBold m-0 text-sm">
                    {currentLang === "id" ? "Barang Rusak" : "Defect Product"}
                  </h3>
                </div>

                <div>
                  <ul className="font-poppinsRegular m-0 list-disc pl-5 space-y-3">
                    <li className="leading-relaxed text-sm text-justify">
                      {currentLang === "id" 
                        ? "Kami selalu memperhatikan untuk packaging setiap frame yang dikirim, jika ke luar kota atau pulau, kami bakal nambahin extra bubblewrap, air column bag atau dus. Stiker fragile, stiker arah paket harus ditaruh di posisi yang bener, juga udah selalu kami tempelin. Selama pengalaman kami, pengiriman frame via kurir sangat jarang banget rusak, namun jika kurir tidak berhati-hati kendala bisa terjadi. Jika sudah terjadi kendala, customer bisa melakukan video unboxing dan kami bisa bantu ngurusin komplainnya ke pihak kurir. Jika framenya sudah tidak bisa dipakai lagi, kami bisa bikin ulang framenya, namun customer harus bayar 70% dari harga frame per 1pcs-nya, tambahan biaya custom background dan tambahan wajah dan tambahan lainnya tidak perlu dihitung. Berikut adalah solusi terbaik yang bisa kami berikan kepada customer."
                        : "Our team already make the best effort to cover packaging of the products with bubblewrap inside and outside the box, using airbag to wrap big sized frame, put the fragile sticker, and position sticker on top of the front wrap. From our experience, there is a very small chance the products will break or defect, but if it happen, we can report it to the courier services. Please make a video unboxing before customer open the packaging, if the products defect or break, we can help to recreate and reship the new frame, with an additional fee of 60% of the original price. This is the best our team can do to provide the customer's need."
                      }
                    </li>
                  </ul>
                </div>
              </div>
            </section>

          </section>
        </main>
      </div>

      {/* DESKTOP LAYOUT - hanya tampil di desktop */}
      <div className="hidden md:block">
        {/* Desktop Split Border Title */}
        <div className="relative my-8 -mb-1 text-center">
          <h1 className="inline-block px-5 text-4xl md:text-5xl font-nataliecaydence relative z-10">
            {currentLang === "id" ? "Mengenai Pembayaran" : "Terms Of Service"}
          </h1>
          <div className="absolute top-1/2 left-0 w-[20%] border-t-4 border-black transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-[20%] border-t-4 border-black transform -translate-y-1/2"></div>
        </div>

        {/* Desktop Main Content */}
        <main className="container mx-auto px-4 py-8 flex-grow">
          <section className="flex flex-col gap-0">
            
            {/* Payment Section - Desktop */}
            <section className="-mb-[60px] last:mb-0">
              <div className="relative h-px my-10">
                <div className="absolute top-2 left-9 h-full w-[15%] border-t-2 border-black translate-y-7"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[250px,1fr] gap-6 pb-6">
                <div className="font-semibold pl-16 mb-2">
                  <p className="font-poppinsSemiBold text-[13px] m-0 text-black -ml-7">
                    {currentLang === "id" ? "Ketentuan" : "Regarding"}
                  </p>
                  <h3 className="font-poppinsBold m-0 text-[15px] -ml-7">
                    {currentLang === "id" ? "Pembayaran" : "Payment"}
                  </h3>
                </div>

                <div>
                  <ul className="font-poppinsRegular m-0 -ml-[3%] list-disc text-[16px]">
                    <li className="mb-2 leading-relaxed -translate-y-11">
                      {currentLang === "id" 
                        ? "Seluruh customer harus mengisi format order"
                        : "All customer must fill the order format"
                      }
                    </li>
                    <li className="mb-6 leading-relaxed -mt-[3.8%]">
                      {currentLang === "id" 
                        ? "Full payment dibawah order Rp 5.000.000,-"
                        : "Full payment for order below Rp. 5.000.000,-"
                      }
                    </li>
                    <li className="mb-2 leading-relaxed text-justify max-w-[890px] text-[16px]">
                      {currentLang === "id" 
                        ? <>
                            Ketentuan DP:<br />
                            DP 1 = saat customer order<br />
                            DP 2 = setelah customer acc preview desain yang diberikan tim kami, bukan setelah paket sampai.
                          </>
                        : <>
                            Terms of Down Payment:<br />
                            First Down Payment = when customer make an order<br />
                            Final Down Payment = after the customer accept the preview design, then customer can make the final payment.  
                            The second payment is not made after the goods arrive as we are making a handmade products.
                          </>
                      }
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Design Revision Section - Desktop */}
            <section className="-mb-[60px] last:mb-0">
              <div className="relative h-px my-10">
                <div className="absolute top-2 left-9 h-full w-[15%] border-t-2 border-black translate-y-7"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[250px,1fr] gap-6 pb-6">
                <div className="font-semibold pl-16 mb-2">
                  <p className="font-poppinsSemiBold text-[13px] m-0 text-black -ml-7">
                    {currentLang === "id" ? "Ketentuan" : "Regarding"}
                  </p>
                  <h3 className="font-poppinsBold m-0 text-[16px] -ml-7">
                    {currentLang === "id" ? "Revisi Desain" : "Design Revision"}
                  </h3>
                </div>

                <div>
                  <ul className="font-poppinsRegular m-0 -ml-[3%] list-disc">
                    <li className="mb-5 leading-relaxed text-justify max-w-[890px] text-[16px]">
                      {currentLang === "id" 
                        ? "Kami menerima revisi minor 2x, customer tidak bisa ganti background setelah preview desain dikasih oleh tim kami. Silahkan berikan sketsa kasar di awal, seperti peletakkan tulisan, pose, seragam yang dipakai, nama, ucapan, logo, dan berikan referensi foto background."
                        : "We accept minor revision for 2 times, customer can't change the background if our team already give a design preview. Please tell the brief design at the beginning, customer can send us background photos references or rough sketch to show the people order position, logo, greetings, and other objects placement."
                      }
                    </li>
                    <li className="mb-2 leading-relaxed text-justify max-w-[890px] text-[16px]">
                      {currentLang === "id" 
                        ? "Untuk order deadline, mohon perhatikan revisi yang diberikan kepada tim kami. Kami tidak bertanggung jawab untuk memenuhi waktu deadline, jika revisinya lebih dari 3x, karena kami memproses frame sesuai urutan customer yang duluan order beserta tanggal deadlinenya. Meskipun kami menyanggupi deadline di awal, namun tidak berarti customer bisa memberikan revisi terus menerus."
                        : "If customer has a deadline time, please consider in giving the number of the design revision, as our team already make the design based on the first brief that customer give. We can not guarantee to fulfil the deadline time if the customer give us revision more than 3 times. Please understand that we already handling and arrange all order based on the process time which customer and our team have agreed from the beginning."
                      }
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Caricature Section - Desktop */}
            <section className="-mb-[60px] last:mb-0">
              <div className="relative h-px my-10">
                <div className="absolute top-2 left-9 h-full w-[15%] border-t-2 border-black translate-y-7"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[250px,1fr] gap-6 pb-6">
                <div className="font-semibold pl-16 mb-2">
                  <p className="font-poppinsSemiBold text-[13px] m-0 text-black -ml-7">
                    {currentLang === "id" ? "Ketentuan" : "Regarding"}
                  </p>
                  <h3 className="font-poppinsBold m-0 text-[16px] -ml-7">
                    {currentLang === "id" ? "Karikatur" : "Caricature"}
                  </h3>
                </div>

                <div>
                  <ul className="font-poppinsRegular m-0 -ml-[3%] list-disc">
                    <li className="mb-2 leading-relaxed text-justify max-w-[890px] text-[16px]">
                      {currentLang === "id" 
                        ? "Karikatur dibuat sesuai garis wajah foto asli yang diberikan, style ilustrasi kami berupa vector ilustrasi, kami tidak menggunakan AI untuk membuat karikatur, kecuali etalase 3D. Jika customer ingin ganti foto, silahkan checkout tambahan wajah di etalase, proses tambahan per 1 wajah adalah 1 hari kerja."
                        : "The caricature face made from the same face line from the original photos, our team make it as vector illustration, we do not use Al to make the caricature face. If customer want to change to other photos, customers are subject to additional charges per 1 face caricature, and 1 day additional process time added."
                      }
                    </li>
                    <li className="mb-2 leading-relaxed text-justify max-w-[890px] text-[16px]">
                      {currentLang === "id" 
                        ? "Tim kami tidak bertanggung jawab melaporkan progres desain ke customer, karena kami sudah memberikan tanggal estimasi preview desainnya. Customer harus menunggu sampai preview desainnya jadi. Mohon pengertiannya bahwa kami tidak mengerjakan order 1 customer saja, sistem ini dibuat agar kami bisa lebih teliti dan supaya ga banyak salah, kami bisa fokus ngerjain tanpa dikejar kejar customer."
                        : "Our team is not obliged to report any of the progress to the customer, we already give the date of the design preview, customer must wait until we give the design preview. Please understand that we are handling more than one order, this system was made so our team can achieve more focus in making the products and making less error in the process."
                      }
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Shipping & Delivery Section - Desktop */}
            <section className="-mb-[60px] last:mb-0">
              <div className="relative h-px my-10">
                <div className="absolute top-2 left-9 h-full w-[15%] border-t-2 border-black translate-y-7"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[250px,1fr] gap-6 pb-6">
                <div className="font-semibold pl-16 mb-2">
                  <p className="font-poppinsSemiBold text-[13px] m-0 text-black -ml-7">
                    {currentLang === "id" ? "Ketentuan" : "Regarding"}
                  </p>
                  <h3 className="font-poppinsBold m-0 text-[16px] -ml-7">
                    {currentLang === "id" ? "Pengiriman Barang" : "Shipping & Delivery"}
                  </h3>
                </div>

                <div>
                  <ul className="font-poppinsRegular m-0 -ml-[3%] list-disc">
                    <li className="mb-2 leading-relaxed text-justify max-w-[890px] text-[16px]">
                      {currentLang === "id" 
                        ? "Silahkan menginfokan alamat lengkap seperti blok,nomor,kavling, dan lainnya. Tidak menerima screenshot alamat, mohon isi alamat sesuai format yang sudah kami berikan, untuk mempermudah kami dan pihak kurir mengerti. Customer harus mengingat, bahwa alamat bisa beda sesuai aplikasi yang dipakai, contoh: Grab, Gojek, Maxim, Google Maps, Grab Map tidak terhubung ke Google Maps, mereka punya server sendiri. Gojek kehubung ke Google Maps, namun kadang banyak alamat gak ada pin pointnya. Makadari itu, customer harus menginformasikan di awal seluruh detailnya."
                        : "Please share the precise address for the receiver locations and details for example office hour, drop zone, etc. We won't take any responsibility if the product sent to a mistaken locations due to lack of informations and detail given by customer, or customer missed a call from the driver during the delivery process."
                      }
                    </li>
                    <li className="mb-2 leading-relaxed text-justify max-w-[890px] text-[16px]">
                      {currentLang === "id" 
                        ? "Kami tidak bertanggung jawab jika driver/kurir salah kirim barang karena kurang lengkap, atau customer ga bisa dihubungi oleh driver. Customer harus tau bahwa aplikasi Grab atau Gojek menelfon melalui aplikasinya dan telfon nomor asli, driver ga tau nomor WhatsApp penerima paket, karena di ban oleh pihak Grab/Gojek. Jika driver teliti, nomor WhatsApp tertera di paket frame yang kami bungkus. Kurir JNE sekarang hanya menerima telfon nomor asli atau WhatsApp, tidak menerima nomor telfon kantor/rumah lagi."
                        : "For shipping process, our team can order the Grab Express or Gosend, please note that we already give the customer data, such as address, note, and phone number on the application. Sometimes there is an issue about the application notification do not show up or do not pop up on the customer's phone. Therefore we give the customer's WhatsApp number to the driver. If there is issues about the delivery process, we can help to report the driver via Gojek or Grab application. This is the farthest assistance we could provide for the customer, so customer must pay attention with their phone when our team order the delivery from the application."
                      }
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Defect Product Section - Desktop */}
            <section className="-mb-[60px] last:mb-0">
              <div className="relative h-px my-10">
                <div className="absolute top-2 left-9 h-full w-[15%] border-t-2 border-black translate-y-7"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[250px,1fr] gap-6 pb-6">
                <div className="font-semibold pl-16 mb-2">
                  <p className="font-poppinsSemiBold text-[13px] m-0 text-black -ml-7">
                    {currentLang === "id" ? "Ketentuan" : "Regarding"}
                  </p>
                  <h3 className="font-poppinsBold m-0 text-[16px] -ml-7">
                    {currentLang === "id" ? "Barang Rusak" : "Defect Product"}
                  </h3>
                </div>

                <div>
                  <ul className="font-poppinsRegular m-0 -ml-[3%] list-disc">
                    <li className="mb-2 leading-relaxed text-justify max-w-[890px] text-[16px]">
                      {currentLang === "id" 
                        ? "Kami selalu memperhatikan untuk packaging setiap frame yang dikirim, jika ke luar kota atau pulau, kami bakal nambahin extra bubblewrap, air column bag atau dus. Stiker fragile, stiker arah paket harus ditaruh di posisi yang bener, juga udah selalu kami tempelin. Selama pengalaman kami, pengiriman frame via kurir sangat jarang banget rusak, namun jika kurir tidak berhati-hati kendala bisa terjadi. Jika sudah terjadi kendala, customer bisa melakukan video unboxing dan kami bisa bantu ngurusin komplainnya ke pihak kurir. Jika framenya sudah tidak bisa dipakai lagi, kami bisa bikin ulang framenya, namun customer harus bayar 70% dari harga frame per 1pcs-nya, tambahan biaya custom background dan tambahan wajah dan tambahan lainnya tidak perlu dihitung. Berikut adalah solusi terbaik yang bisa kami berikan kepada customer."
                        : "Our team already make the best effort to cover packaging of the products with bubblewrap inside and outside the box, using airbag to wrap big sized frame, put the fragile sticker, and position sticker on top of the front wrap. From our experience, there is a very small chance the products will break or defect, but if it happen, we can report it to the courier services. Please make a video unboxing before customer open the packaging, if the products defect or break, we can help to recreate and reship the new frame, with an additional fee of 60% of the original price. This is the best our team can do to provide the customer's need."
                      }
                    </li>
                  </ul>
                </div>
              </div>
            </section>

          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;