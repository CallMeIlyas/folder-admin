import Footer from "../components/home/Footer";
import FAQItem from "../components/faq/FAQItem";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function FAQPage() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <div className="min-h-screen flex flex-col">
      <style>{`
        .faq-item-wrapper {
          min-height: 90px;
          display: flex;
          flex-direction: column;
        }
        
        .faq-item-wrapper > div {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .faq-item-wrapper button {
          min-height: 90px;
          display: flex;
          align-items: center;
        }

        @media (min-width: 768px) {
          .faq-item-wrapper {
            min-height: 110px;
          }
          .faq-item-wrapper button {
            min-height: 110px;
          }
        }
      `}</style>

      {/* ️ JUDUL & DESKRIPSI MOBILE - Hanya tampil di mobile */}
      <div className="md:hidden">
        <div className="relative my-6 mb-8 text-center">
          <h1
            className={`inline-block font-nataliecaydence relative z-10 leading-tight break-words px-4 text-lg max-w-[300px]`}
          >
            {currentLang === "id"
              ? "Pertanyaan yang sering diajukan customer"
              : "Frequently Ask Question"}
          </h1>

          <div className="absolute top-1/2 left-0 w-[15%] border-t-2 border-black transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-[15%] border-t-2 border-black transform -translate-y-1/2"></div>
        </div>

        <div className="font-poppinsRegular text-sm text-left max-w-[680px] mx-auto mt-1 mb-4 leading-relaxed px-4">
          {currentLang === "id" ? (
            <>
              <p className="mb-1">Proses pembuatan dan total harga tergantung format order yang diisi customer.</p>
              <p className="mb-1">Berikut informasi untuk proses normal atau tidak ekspres dan detail lainnya dari produk dan jasa kami.</p>
              <p>Untuk proses ekspres silahkan kontak admin kami.</p>
            </>
          ) : (
            <>
              <p className="mb-1">The format order from customer determine the process time and total price.</p>
              <p className="mb-1">Here is the information for non-express process and other detail regarding</p>
              <p>our services and products. For express process please contact our team.</p>
            </>
          )}
        </div>
      </div>

      {/* ️ JUDUL & DESKRIPSI DESKTOP - Hanya tampil di desktop */}
      <div className="hidden md:block">
        <div className="relative my-8 text-center">
          <h1
            className={`inline-block font-nataliecaydence relative z-10 leading-tight break-words px-6 ${
              currentLang === "id"
                ? "text-[1.3rem] md:text-[2.2rem] max-w-[800px]"
                : "text-4xl md:text-5xl max-w-[650px]"
            }`}
          >
            {currentLang === "id"
              ? "Pertanyaan yang sering diajukan customer"
              : "Frequently Ask Question"}
          </h1>

          <div className="absolute top-1/2 left-0 w-[20%] border-t-4 border-black transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-[20%] border-t-4 border-black transform -translate-y-1/2"></div>
        </div>

        <div className="font-poppinsRegular text-[15px] text-left max-w-[680px] mx-auto mt-1 mb-3 leading-[1.5] whitespace-nowrap overflow-hidden text-ellipsis px-5">
          {currentLang === "id" ? (
            <>
              <p>Proses pembuatan dan total harga tergantung format order yang diisi customer.</p>
              <p>Berikut informasi untuk proses normal atau tidak ekspres dan detail lainnya dari produk dan jasa kami.</p>
              <p>Untuk proses ekspres silahkan kontak admin kami.</p>
            </>
          ) : (
            <>
              <p>The format order from customer determine the process time and total price.</p>
              <p>Here is the information for non-express process and other detail regarding</p>
              <p>our services and products. For express process please contact our team.</p>
            </>
          )}
        </div>
      </div>


      {/*  FAQ Grid */}
      <main className="max-w-[700px] mx-auto py-6 md:py-12 px-4 md:px-5 font-sans flex-1">
        {/* Single column untuk mobile, 2 columns untuk desktop */}
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 font-poppinsRegular">
          
          
          {/*  Left Column */}
          <div className="space-y-3">
            {/* Q1 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Berapa lama proses pembuatan untuk 1 wajah karikatur di 1 pcs frame?"
                    : "How long the process time for 1 frame 1 face caricature?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      Proses normal
                      <br />
                      4R, 15cm, 6R, 20cm, 8R, 10R, 12R = 3-4 hari<br />
                      A2, A1, A0 = 4-5 hari
                      <br />
                      <br />
                      Proses ekspres
                      <br />
                      4R, 15cm, 6R, 20cm, 8R, 10R, 12R = 1-2 hari<br />
                      A2, A1, A0 = 2-3 hari
                      <br />
                      <br />
                      Waktu pengerjaan <span className="text-red-500 font-bold italic">tidak termasuk</span> waktu revisi dari customer dan waktu pengiriman kurir.
                      <br />
                      Kami bisa memproses order ekspres selama kuota masih tersedia.
                    </>
                  ) : (
                    <>
                      Normal process for frame
                      <br />
                      4R, 15cm, 6R, 20cm, 8R, 108, 12R = 3 - 4 days<br />
                      A2, A1, A0 = 4 - 5 days
                      <br />
                      <br />
                      Express process for frame<br />
                      4R, 15cm, 6R, 20cm, 8R, 10R, 12R = 1-2 days<br />
                      A2, A1, A0 = 2 - 3 days<br />
                      <br />
                      The process time <span className="text-red-500 font-bold italic">not include</span> revision time from customer and courier shipping time.  
                      We can proceed the express process as long as the quota is available.
                    </>
                  )
                }
              />
            </div>

            {/* Q2 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Dari mana produk ini dikirimkan?"
                    : "Which city are the products shipped from?"
                }
                answer={
                  <Link
                    to="/location"
                    className="block mx-auto mt-3 w-fit px-6 md:px-10 py-2 md:py-2.5 bg-[#f5d7d6] text-[#333] no-underline rounded-full font-bold text-xs md:text-sm text-center transition-all hover:bg-[#e8b9b8] hover:scale-105"
                  >
                    {currentLang === "id"
                      ? "Klik disini untuk lihat lokasi"
                      : "Click here to see the location"}
                  </Link>
                }
              />
            </div>

            {/* Q3 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Pop up frame itu apa sih? kenapa 3D itu unik dan special?"
                    : "What is pop up frame? Why 3D frame is special?"
                }
                answer={
                  currentLang === "id"
                    ? "Pop up frame adalah kerajinan yang menggunakan kertas berlapis sehingga tampak memiliki kedalaman 3D. Kami membuat karikatur digital, mendesain background, mencetak, memotong, dan merakitnya satu per satu sejak 2018."
                    : "Pop up frames are a type of handicraft that uses stacked paper so it has depth or it looks 3D. Starting from making digital caricature from photos, designing it with background based on the customer preferences. After that we print, cut, and assembling the paper layer by layer. Little Amora Caricature established since 2018. Our design characteristic we use is vector illustration, the body shown smaller and shorter so the faces can be more stand out."
                }
              />
            </div>

            {/* Q4 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Apakah customer boleh minta desainnya sebelum payment?"
                    : "Can customer get the design before payment?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      <p className="text-xs md:text-[13px]">Tidak bisa, karena kami menggunakan jasa ilustrator dan desainer. Setelah pembayaran, kirim referensi foto atau sketsa agar sesuai keinginan.</p>
                      <a
                        href="https://www.instagram.com/alittleamora?igsh=MXZ4emVlcnk5dm1mdw=="
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mx-auto mt-3 w-fit px-6 md:px-10 py-2 md:py-2.5 bg-[#f5d7d6] text-[#333] no-underline rounded-full font-bold text-xs md:text-sm text-center transition-all hover:bg-[#e8b9b8] hover:scale-105"
                      >
                        Galeri Foto
                      </a>
                      <a
                        href="https://www.tiktok.com/@alittleamora?_t=ZS-8yeIkqZXx8G&_r=1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mx-auto mt-3 w-fit px-6 md:px-10 py-2 md:py-2.5 bg-[#f5d7d6] text-[#333] no-underline rounded-full font-bold text-xs md:text-sm text-center transition-all hover:bg-[#e8b9b8] hover:scale-105"
                      >
                        Galeri Video
                      </a>
                      <Link
                        to="/background-catalog"
                        className="block mx-auto mt-3 w-fit px-6 md:px-10 py-2 md:py-2.5 bg-[#f5d7d6] text-[#333] no-underline rounded-full font-bold text-xs md:text-sm text-center transition-all hover:bg-[#e8b9b8] hover:scale-105"
                      >
                        Katalog Background
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-xs md:text-[13px]">No, the customer can't get the design before payment. For our design and frame portfolio, customer can check the gallery and video, and also the background catalog here.</p>
                      <a
                        href="https://www.instagram.com/alittleamora?igsh=MXZ4emVlcnk5dm1mdw=="
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mx-auto mt-3 w-fit px-6 md:px-10 py-2 md:py-2.5 bg-[#f5d7d6] text-[#333] no-underline rounded-full font-bold text-xs md:text-sm text-center transition-all hover:bg-[#e8b9b8] hover:scale-105"
                      >
                        Photo Gallery
                      </a>
                      <a
                        href="https://www.tiktok.com/@alittleamora?_t=ZS-8yeIkqZXx8G&_r=1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mx-auto mt-3 w-fit px-6 md:px-10 py-2 md:py-2.5 bg-[#f5d7d6] text-[#333] no-underline rounded-full font-bold text-xs md:text-sm text-center transition-all hover:bg-[#e8b9b8] hover:scale-105"
                      >
                        Video Gallery
                      </a>
                      <Link
                        to="/background-catalog"
                        className="block mx-auto mt-3 w-fit px-6 md:px-10 py-2 md:py-2.5 bg-[#f5d7d6] text-[#333] no-underline rounded-full font-bold text-xs md:text-sm text-center transition-all hover:bg-[#e8b9b8] hover:scale-105"
                      >
                        Background Catalog
                      </Link>
                    </>
                  )
                }
              />
            </div>

            {/* Q5 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Apakah customer boleh pilih frame kaca atau acrylic?"
                    : "Can customer choose the frame using glass or acrylic?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      Ya, customer bisa memilih antara kaca atau acrylic. Silahkan beli biaya tambahan untuk mengganti kaca ke acrylic.
                      <br />
                      <br />
                      Biasanya, untuk kebutuhan keamanan, frame acrylic digunakan untuk mengirim frame ukuran besar seperti A2, A1, dan A0 menggunakan kurir kargo JNE atau pengiriman ke luar negeri menggunakan Rayspeed.
                      <br />
                      <br />
                      Di bawah ukuran A2 seperti A3, 10R, 8R, 6R, 20cm, 15cm, 4R tidak perlu menggunakan acrylic.
                    </>
                  ) : (
                    <>
                      Yes, customer can choose whether to use glass or acrylic. Please purchase the additional fees for changing glass to acrylic.
                      <br />
                      <br />
                      Mostly, for safety needs, acrylic frame are used to send big frame size like A2, A1, and A0 using JNE cargo courier or sending to worldwide using Rayspeed.
                      <br />
                      <br />
                      Below A2 size like A3, 10R, 8R, 6R, 20cm, 15cm, 4R don't need to use acrylic.
                    </>
                  )
                }
              />
            </div>

            {/* Q6 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Apa yang membuat Little Amora beda dari toko lainnya?"
                    : "What makes Little Amora special than the other shop?"
                }
                answer={
                  currentLang === "id"
                    ? "Karikatur vector kami, cara kami memunculkan elemen pada frame, dan keseluruhan desain yang membuat Little Amora memiliki karakteristik tersendiri di bidang kerajinan tangan ini."
                    : "Our vector caricature, the way we pop up the element on the frame, and the whole design that makes Little Amora has it's own characteristic in this handcraft field."
                }
              />
            </div>

            {/* Q7 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Apakah customer bisa ambil framenya sendiri ke lokasi?"
                    : "Can customer pick up the frame on the site?"
                }
                answer={
                  currentLang === "id"
                    ? "Ya, customer bisa mengambil pesanan dari lokasi di Bogor atau Jakarta, tergantung ukuran frame."
                    : "Yes, customer can pick the order from the location in Bogor or Jakarta, depend on the size frame."
                }
              />
            </div>

            {/* Q8 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Apakah ada diskon untuk beli lebih dari 1?"
                    : "Any discount if customer order more than 1 frame?"
                }
                answer={
                  currentLang === "id"
                    ? "Diskon untuk frame tersedia untuk pesanan lebih dari 25 pcs, karena ini adalah produk kerajinan tangan, setiap desain dan karikatur membutuhkan waktu, usaha dan perhatian untuk memberikan hasil terbaik untuk customer."
                    : "Discount for frames are for order more than 25 pcs, as this is a handcraft products, each design and caricature needs time, effort and attention to give the best result for customers."
                }
              />
            </div>

            {/* Q9 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Apakah customer bisa ganti logo, tambahin gambar produk/brand dan elemen lain di background katalog?"
                    : "Can customer change logo, product or element in free background catalog?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      Ya, customer bisa mengubah apapun dari katalog background gratis.
                      <br />
                      <br />
                      Harap diingat, background tidak bisa diubah setelah preview desain diberikan.
                    </>
                  ) : (
                    <>
                      Yes, customer can change anything from the free background catalog.
                      <br />
                      <br />
                      Please remind, the background can't be change after the design preview is given.
                    </>
                  )
                }
              />
            </div>

            {/* Q10-Q18 untuk mobile */}
            <div className="md:hidden space-y-3">
              {/* Q10 */}
              <div className="faq-item-wrapper">
                <FAQItem
                  question={
                    currentLang === "id"
                      ? "Berapa lama proses pembuatan untuk 2-10 wajah karikatur di 1 pcs frame?"
                      : "How long the process time for 1 frame 2-10 faces caricature?"
                  }
                  answer={
                    currentLang === "id" ? (
                      <>
                        Proses normal
                        <br />
                        10R, 12R = 5-7 hari <br />
                        A2, A1, A0 = 7-10 hari <br />
                        <br />
                        Proses ekspres
                        <br />
                        10R, 12R = 4-5 hari <br />
                        A2, A1, A0 = 5-7 hari <br />
                        <br />
                        Waktu pengerjaan <span className="text-red-500 font-bold italic">tidak termasuk</span> waktu revisi dari customer dan waktu pengiriman kurir.
                        <br />
                        Kami bisa memproses pesanan ekspres selama kuota masih tersedia.
                      </>
                    ) : (
                      <>
                        Normal process for frame <br />
                        10R, 12R = 5–7 days <br />
                        A2, A1, A0 = 7–10 days <br />
                        <br />
                        Express process for frame <br />
                        10R, 12R = 4–5 days <br />
                        A2, A1, A0 = 5–7 days <br />
                        <br />
                        The process time <span className="text-red-500 font-bold italic">not include</span> revision time from customer and courier shipping time.  
                        We can proceed the express process as long as the quota is available.
                      </>
                    )
                  }
                />
              </div>

              {/* Q11 */}
              <div className="faq-item-wrapper">
                <FAQItem
                  question={
                    currentLang === "id"
                      ? "Gimana cara order frame disini?"
                      : "What is the procedure for order the frame?"
                  }
                  answer={
                    currentLang === "id" ? (
                      <>
                        <ul className="list-disc pl-4 text-xs md:text-[13px]">
                          <li>Berapa jumlah wajah karikatur yang ingin dibuat?</li>
                          <li>Berapa pcs bingkai yang ingin diorder?</li>
                          <li>Ukuran bingkai yang ingin diorder</li>
                          <li>Kecamatan dan kota tujuan pengiriman</li>
                          <li>Tanggal dan bulan harus sampai</li>
                        </ul>
                        <a
                          href="https://wa.me/6281380340307?text=fo1%20(kode%20jangan%20dihapus)%0A%0A%E2%80%A2%20Berapa%20wajah%20dalam%201%20frame%20=%0A%E2%80%A2%20Jumlah%20frame%20yang%20akan%20diorder%20=%0A%E2%80%A2%20Ukuran%20frame%20=%0A%E2%80%A2%20Background%20=%20free%20/%20custom%3F%0A%E2%80%A2%20Kecamatan%20%26%20kota%20pengiriman%20=%0A%E2%80%A2%20Tanggal-bulan%20barang%20harus%20sampai%20="
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mx-auto mt-3 w-fit px-6 md:px-10 py-2 md:py-2.5 bg-[#f5d7d6] text-[#333] no-underline rounded-full font-bold text-xs whitespace-nowrap text-center transition-all hover:bg-[#e8b9b8] hover:scale-105"
                        >
                          Kirim format order ke admin.
                        </a>
                      </>
                    ) : (
                      <>
                        <ul className="list-disc pl-4 text-xs md:text-[13px]">
                          <li>How many faces on the frame?</li>
                          <li>How many frame that you need?</li>
                          <li>Pick the frame size</li>
                          <li>Fill subdistrict and city for estimated shipping fee</li>
                          <li>Fill the deadline date and month</li>
                        </ul>
                        <a
                          href="https://wa.me/6281380340307?text=fo1%20(kode%20jangan%20dihapus)%0A%0A%E2%80%A2%20Berapa%20wajah%20dalam%201%20frame%20=%0A%E2%80%A2%20Jumlah%20frame%20yang%20akan%20diorder%20=%0A%E2%80%A2%20Ukuran%20frame%20=%0A%E2%80%A2%20Background%20=%20free%20/%20custom%3F%0A%E2%80%A2%20Kecamatan%20%26%20kota%20pengiriman%20=%0A%E2%80%A2%20Tanggal-bulan%20barang%20harus%20sampai%20="
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mx-auto mt-3 w-fit px-6 md:px-10 py-2 md:py-2.5 bg-[#f5d7d6] text-[#333] no-underline rounded-full font-bold text-xs whitespace-nowrap text-center transition-all hover:bg-[#e8b9b8] hover:scale-105"
                        >
                          Give the format order to our team
                        </a>
                      </>
                    )
                  }
                />
              </div>

           {/* Q12 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Bedanya frame 2D dan 3D apa?"
                    : "What is the difference between 2D and 3D frame?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      Frame 2D adalah frame foto biasa yang terbuat dari kayu dan kaca, tidak memiliki kedalaman.
                      <br />
                      <br />
                      Sedangkan frame 3D memiliki kedalaman, kami bisa meletakkan apapun di dalamnya berdasarkan kreativitas kami. Biasanya crafter di seluruh dunia membuat pop up frame menggunakan frame 3D, menambahkan lampu atau jam, atau bahkan menambahkan beberapa miniatur di dalamnya. Beberapa dari mereka bisa menambahkan bunga artifisial atau bahkan pasir, dan banyak elemen lainnya untuk membuat frame 3D terlihat hidup.
                    </>
                  ) : (
                    <>
                      2D frame is an ordinary photo frame made from wood and glass, it has no depth.
                      <br />
                      <br />
                      While 3D frame has it's depth, we can put anything inside based on our creativity. Usually the crafter around the world make a pop up frame using 3D frame, add a lamp or clock, or even add some miniature inside. Some of them can add artificial flower or even sand, and many more elements to create the 3D frame looks alive.
                    </>
                  )
                }
              />
            </div>

            {/* Q13 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Apakah pengirimannya aman?"
                    : "Is the packaging safe for delivery?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      Semua frame kami dikemas dengan bubblewrap di dalam dan luar box. Untuk frame ukuran besar, kami menggunakan airbag dan packaging box kardus.
                      <br />
                      <br />
                      Jika Anda khawatir tentang packaging, silahkan pesan Instant Delivery menggunakan motor atau mobil.
                      <br />
                      <br />
                      Jika packaging rusak karena kurir, tim kami bisa membantu customer untuk mengkomplain masalah tersebut ke kurir, dan jika customer meminta kami untuk membuat ulang frame, customer bisa membayar biaya hanya 70% dari harga frame asli, tidak perlu membayar tambahan wajah dan background custom.
                    </>
                  ) : (
                    <>
                      All our frame packed with bubblewrap inside and outside the box. For big size frame, we use airbag and card box packaging.
                      <br />
                      <br />
                      If you are concern about the packaging, please order an Instant Delivery using bike or car.
                      <br />
                      <br />
                      If the packaging was broken by the courier, our team can help customer to complain about the issues to the courier, and if customer ask us to recreate the frame, customer can pay the fee by only 70% of the original frame price, don't need to pay the additional faces and background custom.
                    </>
                  )
                }
              />
            </div>

            {/* Q14 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Apa bisa tambah lampu atau emas keping ke framenya?"
                    : "Can customer add lamp or gold plate on the frame?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      Saat ini, penambahan lampu atau plat emas masih belum tersedia di Little Amora Caricature Frame.
                      <br />
                      <br />
                      Jika customer ingin menambahkan, customer bisa membuka MDF di bagian belakang frame, dan menempelkannya menggunakan lem tembak.
                    </>
                  ) : (
                    <>
                      Currently, adding lamp or gold plate still not available in Little Amora Caricature Frame.
                      <br />
                      <br />
                      If customer want to add, customers can open the MDF on the back of the frame, and paste it using glue gun.
                    </>
                  )
                }
              />
            </div>

            {/* Q15 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Bisa berapa kali revisi untuk desainnya?"
                    : "How many revision for the design?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      Maksimal revisi minor 2x, customer tidak bisa mengubah background setelah preview desain.
                      <br />
                      <br />
                      Silahkan berikan informasi detail ketika customer melakukan pemesanan.
                    </>
                  ) : (
                    <>
                      Maximum design is 2x minor revision, customer can't change background after the preview design.
                      <br />
                      <br />
                      Please give us the detail information when customer make an order.
                    </>
                  )
                }
              />
            </div>

            {/* Q16 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Gimana kalau karikaturnya ga mirip dengan foto yang diberikan?"
                    : "What if the caricature not similar than the photo?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      Karakter wajah setiap orang berbeda pada variasi sudut. Tim kami membuat karikatur berdasarkan garis wajah pada foto asli.
                      <br />
                      <br />
                      Customer harus memperhatikan foto asli yang mereka kirim ke tim kami. Untuk membuat ulang karikatur, customer bisa mengirim ulang foto dengan sudut yang berbeda dari yang pertama, biaya tambahan termasuk karena illustrator kami membuat karikatur secara manual digital, kami tidak menggunakan AI untuk membuat karikatur.
                    </>
                  ) : (
                    <>
                      The face character on every person is different on angle variant. Our team make the caricature based from their face line on the original photos.
                      <br />
                      <br />
                      Customer must pay attention to the original photos that they send to our team. To remake the caricature, customer can re-submit the photo with different angle than the first one, additional fee included as our illustrator make the caricature manually digital, we don't use Al to make the caricature.
                    </>
                  )
                }
              />
            </div>

            {/* Q17 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Bedanya ilustrasi manual sama digital apa?"
                    : "What is the difference between manual and digital illustration?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      Umumnya, illustrator membuat ilustrasi menggunakan pen tablet untuk menggambar manual. Pen tablet mengacu pada gambar digital. Banyak illustrator juga masih menggunakan mouse dan laptop atau PC untuk menggambar, itu disebut vectoring. Vectoring sebuah gambar adalah apa yang kami lakukan di sini, dengan mengikuti garis wajah atau garis foto untuk membuat ilustrasi.
                      <br />
                      <br />
                      Gambar manual menggunakan pensil, pena atau alat untuk menggambar gambar atau lukisan.
                    </>
                  ) : (
                    <>
                      Generally, illustrator make an illustration using pen tablet to draw manual drawing. Pen tablet referred to digital drawing. Many illustrators too, still using mouse and laptop or PC to draw, it called vectoring. Vectoring an image is what we are doing here, by following the face line or photo line to create an illustration.
                      <br />
                      <br />
                      Manual drawing is using pencil, pen or tools to draw a picture or painting.
                    </>
                  )
                }
              />
            </div>

            {/* Q18 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Apakah customer bisa ganti style ilustrasi ke 3D atau semi realis?"
                    : "Can customer request to change the illustration style into 3D or semi realism?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      Saat ini, tim kami membuat ilustrasi vector untuk semua karikatur dan desain.
                      <br />
                      <br />
                      Untuk semi realisme, illustrator kami tersedia untuk melakukan permintaan. Membutuhkan biaya tambahan.
                      <br />
                      <br />
                      Untuk saat ini, tim kami belum tersedia untuk membuat menjadi 3D, tapi kami bisa menggunakan AI untuk membuatnya 3D, membutuhkan biaya tambahan juga.
                    </>
                  ) : (
                    <>
                      Currently, our team make a vector illustration for all the caricature and the design.
                      <br />
                      <br />
                      For semi realism, our illustrator is available to do the request. Requires additional costs.
                      <br />
                      <br />
                      For now, our team is not available for making into a 3D yet, but we can use Al to make it 3D, requires additional fee too.
                    </>
                  )
                }
              />
            </div>
            </div>
          </div>

          {/*  Right Column - hanya untuk desktop */}
          <div className="hidden md:block space-y-3">
            {/* Q10 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Berapa lama proses pembuatan untuk 2-10 wajah karikatur di 1 pcs frame?"
                    : "How long the process time for 1 frame 2-10 faces caricature?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      Proses normal
                      <br />
                      10R, 12R = 5-7 hari <br />
                      A2, A1, A0 = 7-10 hari <br />
                      <br />
                      Proses ekspres
                      <br />
                      10R, 12R = 4-5 hari <br />
                      A2, A1, A0 = 5-7 hari <br />
                      <br />
                      Waktu pengerjaan <span className="text-red-500 font-bold italic">tidak termasuk</span> waktu revisi dari customer dan waktu pengiriman kurir.
                      <br />
                      Kami bisa memproses pesanan ekspres selama kuota masih tersedia.
                    </>
                  ) : (
                    <>
                      Normal process for frame <br />
                      10R, 12R = 5–7 days <br />
                      A2, A1, A0 = 7–10 days <br />
                      <br />
                      Express process for frame <br />
                      10R, 12R = 4–5 days <br />
                      A2, A1, A0 = 5–7 days <br />
                      <br />
                      The process time <span className="text-red-500 font-bold italic">not include</span> revision time from customer and courier shipping time.  
                      We can proceed the express process as long as the quota is available.
                    </>
                  )
                }
              />
            </div>

            {/* Q11 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Gimana cara order frame disini?"
                    : "What is the procedure for order the frame?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      <ul className="list-disc pl-5 text-[13px]">
                        <li>Berapa jumlah wajah karikatur yang ingin dibuat?</li>
                        <li>Berapa pcs bingkai yang ingin diorder?</li>
                        <li>Ukuran bingkai yang ingin diorder</li>
                        <li>Kecamatan dan kota tujuan pengiriman</li>
                        <li>Tanggal dan bulan harus sampai</li>
                      </ul>
                      <a
                        href="https://wa.me/6281380340307?text=fo1%20(kode%20jangan%20dihapus)%0A%0A%E2%80%A2%20Berapa%20wajah%20dalam%201%20frame%20=%0A%E2%80%A2%20Jumlah%20frame%20yang%20akan%20diorder%20=%0A%E2%80%A2%20Ukuran%20frame%20=%0A%E2%80%A2%20Background%20=%20free%20/%20custom%3F%0A%E2%80%A2%20Kecamatan%20%26%20kota%20pengiriman%20=%0A%E2%80%A2%20Tanggal-bulan%20barang%20harus%20sampai%20="
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mx-auto mt-3 w-fit px-10 py-2.5 bg-[#f5d7d6] text-[#333] no-underline rounded-full font-bold text-xs whitespace-nowrap text-center transition-all hover:bg-[#e8b9b8] hover:scale-105"
                      >
                        Kirim format order ke admin.
                      </a>
                    </>
                  ) : (
                    <>
                      <ul className="list-disc pl-5 text-[13px]">
                        <li>How many faces on the frame?</li>
                        <li>How many frame that you need?</li>
                        <li>Pick the frame size</li>
                        <li>Fill subdistrict and city for estimated shipping fee</li>
                        <li>Fill the deadline date and month</li>
                      </ul>
                      <a
                        href="https://wa.me/6281380340307?text=fo1%20(kode%20jangan%20dihapus)%0A%0A%E2%80%A2%20Berapa%20wajah%20dalam%201%20frame%20=%0A%E2%80%A2%20Jumlah%20frame%20yang%20akan%20diorder%20=%0A%E2%80%A2%20Ukuran%20frame%20=%0A%E2%80%A2%20Background%20=%20free%20/%20custom%3F%0A%E2%80%A2%20Kecamatan%20%26%20kota%20pengiriman%20=%0A%E2%80%A2%20Tanggal-bulan%20barang%20harus%20sampai%20="
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mx-auto mt-3 w-fit px-10 py-2.5 bg-[#f5d7d6] text-[#333] no-underline rounded-full font-bold text-xs whitespace-nowrap text-center transition-all hover:bg-[#e8b9b8] hover:scale-105"
                      >
                        Give the format order to our team
                      </a>
                    </>
                  )
                }
              />
            </div>
            
           {/* Q12 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Bedanya frame 2D dan 3D apa?"
                    : "What is the difference between 2D and 3D frame?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      Frame 2D adalah frame foto biasa yang terbuat dari kayu dan kaca, tidak memiliki kedalaman.
                      <br />
                      <br />
                      Sedangkan frame 3D memiliki kedalaman, kami bisa meletakkan apapun di dalamnya berdasarkan kreativitas kami. Biasanya crafter di seluruh dunia membuat pop up frame menggunakan frame 3D, menambahkan lampu atau jam, atau bahkan menambahkan beberapa miniatur di dalamnya. Beberapa dari mereka bisa menambahkan bunga artifisial atau bahkan pasir, dan banyak elemen lainnya untuk membuat frame 3D terlihat hidup.
                    </>
                  ) : (
                    <>
                      2D frame is an ordinary photo frame made from wood and glass, it has no depth.
                      <br />
                      <br />
                      While 3D frame has it's depth, we can put anything inside based on our creativity. Usually the crafter around the world make a pop up frame using 3D frame, add a lamp or clock, or even add some miniature inside. Some of them can add artificial flower or even sand, and many more elements to create the 3D frame looks alive.
                    </>
                  )
                }
              />
            </div>

            {/* Q13 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Apakah pengirimannya aman?"
                    : "Is the packaging safe for delivery?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      Semua frame kami dikemas dengan bubblewrap di dalam dan luar box. Untuk frame ukuran besar, kami menggunakan airbag dan packaging box kardus.
                      <br />
                      <br />
                      Jika Anda khawatir tentang packaging, silahkan pesan Instant Delivery menggunakan motor atau mobil.
                      <br />
                      <br />
                      Jika packaging rusak karena kurir, tim kami bisa membantu customer untuk mengkomplain masalah tersebut ke kurir, dan jika customer meminta kami untuk membuat ulang frame, customer bisa membayar biaya hanya 70% dari harga frame asli, tidak perlu membayar tambahan wajah dan background custom.
                    </>
                  ) : (
                    <>
                      All our frame packed with bubblewrap inside and outside the box. For big size frame, we use airbag and card box packaging.
                      <br />
                      <br />
                      If you are concern about the packaging, please order an Instant Delivery using bike or car.
                      <br />
                      <br />
                      If the packaging was broken by the courier, our team can help customer to complain about the issues to the courier, and if customer ask us to recreate the frame, customer can pay the fee by only 70% of the original frame price, don't need to pay the additional faces and background custom.
                    </>
                  )
                }
              />
            </div>

            {/* Q14 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Apa bisa tambah lampu atau emas keping ke framenya?"
                    : "Can customer add lamp or gold plate on the frame?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      Saat ini, penambahan lampu atau plat emas masih belum tersedia di Little Amora Caricature Frame.
                      <br />
                      <br />
                      Jika customer ingin menambahkan, customer bisa membuka MDF di bagian belakang frame, dan menempelkannya menggunakan lem tembak.
                    </>
                  ) : (
                    <>
                      Currently, adding lamp or gold plate still not available in Little Amora Caricature Frame.
                      <br />
                      <br />
                      If customer want to add, customers can open the MDF on the back of the frame, and paste it using glue gun.
                    </>
                  )
                }
              />
            </div>

            {/* Q15 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Bisa berapa kali revisi untuk desainnya?"
                    : "How many revision for the design?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      Maksimal revisi minor 2x, customer tidak bisa mengubah background setelah preview desain.
                      <br />
                      <br />
                      Silahkan berikan informasi detail ketika customer melakukan pemesanan.
                    </>
                  ) : (
                    <>
                      Maximum design is 2x minor revision, customer can't change background after the preview design.
                      <br />
                      <br />
                      Please give us the detail information when customer make an order.
                    </>
                  )
                }
              />
            </div>

            {/* Q16 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Gimana kalau karikaturnya ga mirip dengan foto yang diberikan?"
                    : "What if the caricature not similar than the photo?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      Karakter wajah setiap orang berbeda pada variasi sudut. Tim kami membuat karikatur berdasarkan garis wajah pada foto asli.
                      <br />
                      <br />
                      Customer harus memperhatikan foto asli yang mereka kirim ke tim kami. Untuk membuat ulang karikatur, customer bisa mengirim ulang foto dengan sudut yang berbeda dari yang pertama, biaya tambahan termasuk karena illustrator kami membuat karikatur secara manual digital, kami tidak menggunakan AI untuk membuat karikatur.
                    </>
                  ) : (
                    <>
                      The face character on every person is different on angle variant. Our team make the caricature based from their face line on the original photos.
                      <br />
                      <br />
                      Customer must pay attention to the original photos that they send to our team. To remake the caricature, customer can re-submit the photo with different angle than the first one, additional fee included as our illustrator make the caricature manually digital, we don't use Al to make the caricature.
                    </>
                  )
                }
              />
            </div>

            {/* Q17 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Bedanya ilustrasi manual sama digital apa?"
                    : "What is the difference between manual and digital illustration?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      Umumnya, illustrator membuat ilustrasi menggunakan pen tablet untuk menggambar manual. Pen tablet mengacu pada gambar digital. Banyak illustrator juga masih menggunakan mouse dan laptop atau PC untuk menggambar, itu disebut vectoring. Vectoring sebuah gambar adalah apa yang kami lakukan di sini, dengan mengikuti garis wajah atau garis foto untuk membuat ilustrasi.
                      <br />
                      <br />
                      Gambar manual menggunakan pensil, pena atau alat untuk menggambar gambar atau lukisan.
                    </>
                  ) : (
                    <>
                      Generally, illustrator make an illustration using pen tablet to draw manual drawing. Pen tablet referred to digital drawing. Many illustrators too, still using mouse and laptop or PC to draw, it called vectoring. Vectoring an image is what we are doing here, by following the face line or photo line to create an illustration.
                      <br />
                      <br />
                      Manual drawing is using pencil, pen or tools to draw a picture or painting.
                    </>
                  )
                }
              />
            </div>

            {/* Q18 */}
            <div className="faq-item-wrapper">
              <FAQItem
                question={
                  currentLang === "id"
                    ? "Apakah customer bisa ganti style ilustrasi ke 3D atau semi realis?"
                    : "Can customer request to change the illustration style into 3D or semi realism?"
                }
                answer={
                  currentLang === "id" ? (
                    <>
                      Saat ini, tim kami membuat ilustrasi vector untuk semua karikatur dan desain.
                      <br />
                      <br />
                      Untuk semi realisme, illustrator kami tersedia untuk melakukan permintaan. Membutuhkan biaya tambahan.
                      <br />
                      <br />
                      Untuk saat ini, tim kami belum tersedia untuk membuat menjadi 3D, tapi kami bisa menggunakan AI untuk membuatnya 3D, membutuhkan biaya tambahan juga.
                    </>
                  ) : (
                    <>
                      Currently, our team make a vector illustration for all the caricature and the design.
                      <br />
                      <br />
                      For semi realism, our illustrator is available to do the request. Requires additional costs.
                      <br />
                      <br />
                      For now, our team is not available for making into a 3D yet, but we can use Al to make it 3D, requires additional fee too.
                    </>
                  )
                }
              />
            </div>
          </div>
        </div>

        {/*  Custom FAQ */}
        <div className="max-w-[430px] mx-auto my-6 md:my-7.5 p-4 md:p-5 font-sans">
          <FAQItem
            question={
              currentLang === "id"
                ? "Jika ada pertanyaan lain, silahkan hubungi admin kami disini"
                : "Place your question here, our team will answer you soon"
            }
            answer={
              <a
                href="https://wa.me/6281380340307?text=fo1%20(kode%20jangan%20dihapus)%0A%0A%E2%80%A2%20Berapa%20wajah%20dalam%201%20frame%20=%0A%E2%80%A2%20Jumlah%20frame%20yang%20akan%20diorder%20=%0A%E2%80%A2%20Ukuran%20frame%20=%0A%E2%80%A2%20Background%20=%20free%20/%20custom%3F%0A%E2%80%A2%20Kecamatan%20%26%20kota%20pengiriman%20=%0A%E2%80%A2%20Tanggal-bulan%20barang%20harus%20sampai%20="
                target="_blank"
                rel="noopener noreferrer"
                className="block mx-auto mt-3 w-fit px-6 md:px-8 py-2 md:py-2.5 bg-[#d69ca0] text-white no-underline rounded-full font-bold text-xs md:text-sm whitespace-nowrap text-center transition-all hover:bg-[#c17f84] hover:scale-105"
              >
                Chat via WhatsApp
              </a>
            }
            isCustom={true}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}