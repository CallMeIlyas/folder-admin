import { PDFDocument, rgb, pushGraphicsState, popGraphicsState, scale } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { saveAs } from "file-saver";
import { mergeFooterPdf, addPageWithHeader } from "./mergeHeaderFooter";

export const generateInvoice = async (cartData, customerData) => {
  // Load HEADER PDF (tanpa footer)
  const headerUrl = "/HEADER.pdf";
  const headerBytes = await fetch(headerUrl).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(headerBytes);

  // Daftarkan fontkit
  pdfDoc.registerFontkit(fontkit);

  // Load font Poppins
  const poppinsRegularBytes = await fetch("/fonts/poppins/Poppins-Regular.ttf").then((r) =>
    r.arrayBuffer()
  );
  const poppinsSemiBoldBytes = await fetch("/fonts/poppins/Poppins-SemiBold.ttf").then((r) =>
    r.arrayBuffer()
  );
  const poppinsBoldBytes = await fetch("/fonts/poppins/Poppins-Bold.ttf").then((r) =>
    r.arrayBuffer()
  );
  const poppinsItalicBytes = await fetch("/fonts/poppins/Poppins-Italic.ttf").then((r) =>
    r.arrayBuffer()
  );

  const poppinsRegular = await pdfDoc.embedFont(poppinsRegularBytes);
  const poppinsSemiBold = await pdfDoc.embedFont(poppinsSemiBoldBytes);
  const poppinsBold = await pdfDoc.embedFont(poppinsBoldBytes);
  const poppinsItalic = await pdfDoc.embedFont(poppinsItalicBytes);

  let page = pdfDoc.getPage(0);

  // Helper teks
  const drawText = (text, x, y, { size = 10, font = poppinsRegular, color = rgb(0, 0, 0) } = {}) => {
    page.drawText(String(text), { x, y, size, font, color });
  };

  // BILL TO (posisi sudah pas)
  const billToX = 240; 
  let billToY = 735;   
  const lineGap = 16;  

  // Helper: fallback kalau field kosong → "-"
  const safeText = (val) => (val && val.trim() !== "" ? val : "-");

  // Company
  drawText(safeText(customerData.companyName), billToX, billToY, { font: poppinsRegular, size: 10 });
  billToY -= lineGap;

  // Name & Contact Person
  drawText(safeText(customerData.contactPerson), billToX, billToY, { font: poppinsRegular, size: 10 });
  billToY -= lineGap;

  // Order via
  drawText(safeText(customerData.orderVia), billToX, billToY, { font: poppinsRegular, size: 10 });
  billToY -= lineGap;

  // Payment Date
  drawText(safeText(customerData.paymentDate), billToX, billToY, { font: poppinsRegular, size: 10 });
  billToY -= lineGap;

  // Estimated Product Arrival
  drawText(safeText(customerData.estimatedArrival), billToX, billToY, { font: poppinsRegular, size: 10 });
  billToY -= lineGap;

  // Payment transfer via Bank
  drawText(safeText(customerData.paymentMethod), billToX, billToY, { font: poppinsRegular, size: 10 });

  // INVOICE NUMBER di bawah INVOICE - FORMAT BARU: INV/LAC/NAMATANGGAL
  const invoiceInfoX = 45;
  const invoiceInfoY = 790;

  // Helper untuk format nama (ambil 5 karakter pertama, uppercase, tanpa spasi)
  const formatCustomerName = (name) => {
    if (!name || name === "-") return "CUST";
    const cleanName = name.replace(/\s+/g, '').toUpperCase();
    return cleanName.substring(0, 5);
  };

  // Helper untuk format tanggal ke DDMMYYYY
  const formatToDDMMYYYY = (dateString) => {
    if (!dateString || dateString === "-") return "";
    
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${day}${month}${year}`;
    } catch {
      return dateString.replace(/\D/g, '').substring(0, 8);
    }
  };

  // Format nama customer
  const customerName = formatCustomerName(customerData.contactPerson);
  // Format tanggal payment date
  const paymentDateFormatted = formatToDDMMYYYY(customerData.paymentDate) || "00000000";

  // Gabungkan: INV/LAC/NAMATANGGAL
  const finalInvoiceText = `INV/LAC/${customerName}${paymentDateFormatted}`;

  drawText(finalInvoiceText, invoiceInfoX, invoiceInfoY, {
    font: poppinsSemiBold,
    size: 9,
    color: rgb(0.862, 0.149, 0.149),
  });

  // Area tabel produk
  const box = { left: 45, right: 545, top: 630, bottom: 50, rowH: 50 };
  const cols = { image: 60, name: 210, price: 90, qty: 60, total: 90 };
  let y = box.top;
  
  // Track posisi Y untuk footer nanti
  let lastProductY = y;
  
  // Flag untuk halaman pertama (punya header BILL TO)
  let isFirstPage = true;

  // Loop produk
  for (const [i, item] of cartData.entries()) {
    // Cek apakah perlu halaman baru UNTUK PRODUK
    const currentBottom = isFirstPage ? 170 : 30;
    
    if (y - box.rowH < currentBottom) {
      // Buat halaman BLANK (TANPA apapun)
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 841;
      isFirstPage = false;
    }

    // Gambar produk proporsional
    try {
      const imgBytes = await fetch(item.imageUrl).then((r) => r.arrayBuffer());
      const img = item.imageUrl.endsWith(".png")
        ? await pdfDoc.embedPng(imgBytes)
        : await pdfDoc.embedJpg(imgBytes);

      const size = 35;
      const { width, height } = img.scale(1);
      const aspect = width / height;
      const drawW = aspect >= 1 ? size : size * aspect;
      const drawH = aspect >= 1 ? size / aspect : size;
      const imgX = box.left + (cols.image - drawW) / 2;
      const imgY = y - drawH - 53;
      page.drawImage(img, { x: imgX, y: imgY, width: drawW, height: drawH });
    } catch {}

    // Hitung subtotal
    const subtotal = item.price * item.quantity;

    // Posisi teks produk
    const textY = y - 70;
    const nameX = box.left + cols.image + 8;
    const nameY = textY;
    const nameSize = 8;

    // Helper: potong teks dengan panjang maksimum karakter
    const truncateByChar = (text, maxChars = 20) => {
      if (!text) return "-";
      if (text.length <= maxChars) return text;
      return text.slice(0, maxChars - 3) + "...";
    };
        
    // Nama Produk (dengan truncation)
    const maxChars = 25;
    drawText(truncateByChar(item.name, maxChars), nameX, nameY, {
      font: poppinsRegular,
      size: nameSize,
    });

    // Variasi Produk
    if (item.variation) {
      const symbolFontBytes = await fetch("/fonts/NotoSansSymbols2-Regular.ttf").then((r) =>
        r.arrayBuffer()
      );
      const symbolFont = await pdfDoc.embedFont(symbolFontBytes);

      const labelFontSize = 9.5;

      // Posisi teks variasi di kanan nama produk
      const labelX = nameX + 110;
      const labelY = nameY;

      // Baris pertama: Variations:
      drawText("Variations:", labelX, labelY, {
        font: poppinsRegular,
        size: 8,
      });

      const labelWidth = poppinsRegular.widthOfTextAtSize("Variations:", labelFontSize);

      // Gambar panah ▼ dengan transform skala
      page.pushOperators(pushGraphicsState());
      page.pushOperators(scale(1.5, 1));

      drawText("▼", (labelX + labelWidth - 6) / 1.5, labelY, {
        font: symbolFont,
        size: 6,
        color: rgb(0, 0, 0),
      });

      page.pushOperators(popGraphicsState());

      // Baris kedua: nama variasi
      drawText(item.variation, labelX, labelY - 12, {
        font: poppinsRegular,
        size: 8,
      });
    }

    // Harga satuan
    drawText(`Rp${item.price.toLocaleString("id-ID")}`, box.left + cols.image + cols.name - 13, textY, {
      font: poppinsSemiBold,
      size: 11,
    });

    // Quantity
    drawText(String(item.quantity), box.left + cols.image + cols.name + cols.price + 40, textY, {
      font: poppinsRegular,
      size: 11,
    });

    // Subtotal
    drawText(`Rp${subtotal.toLocaleString("id-ID")}`, box.right - cols.total + 50, textY, {
      font: poppinsSemiBold,
      size: 12,
      color: rgb(0.862, 0.149, 0.149),
    });

    // Update Y position SEBELUM update lastProductY
    y -= box.rowH;
    
    // Update posisi produk terakhir SETELAH Y dikurangi
    lastProductY = y;
  }

  // MERGE FOOTER PDF - Setelah semua produk selesai
  const total = cartData.reduce((acc, cur) => acc + cur.price * cur.quantity, 0);

  // Siapkan fonts untuk footer
  const fonts = {
    poppinsRegular,
    poppinsSemiBold,
    poppinsBold
  };

  // LOGIC: Jika produk >= 7, footer pasti di halaman baru
  const productCount = cartData.length;

  // Merge footer PDF
  const { finalPage, finalY } = await mergeFooterPdf(
    pdfDoc,
    page,
    lastProductY,
    "/FOOTER.pdf",
    total,
    fonts,
    cartData.length
  );

  // Update page reference ke page terakhir
  page = finalPage;

  // Simpan hasil PDF
  const result = await pdfDoc.save();
  saveAs(new Blob([result], { type: "application/pdf" }), "Invoice_LittleAmora.pdf");
};