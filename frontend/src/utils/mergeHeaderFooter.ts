import { PDFDocument, rgb } from "pdf-lib";

/**
 * Merge Header PDF + Products + Footer PDF
 * 
 * @param pdfDoc - PDF Document yang sudah ada header & products
 * @param currentPage - Halaman terakhir dengan produk
 * @param lastProductY - Posisi Y dari produk terakhir
 * @param footerPdfPath - Path ke footer PDF
 * @param total - Total harga
 * @param fonts - Fonts object
 * @param productCount - Jumlah total produk
 * @returns Object { finalPage, finalY }
 */
export const mergeFooterPdf = async (
  pdfDoc: PDFDocument,
  currentPage: any,
  lastProductY: number,
  footerPdfPath: string = "/FOOTER.pdf",
  total: number,
  fonts: any,
  productCount: number = 0
) => {
  try {
    // Load footer PDF
    const footerBytes = await fetch(footerPdfPath).then((res) => {
      if (!res.ok) throw new Error(`Footer PDF not found: ${footerPdfPath}`);
      return res.arrayBuffer();
    });
    
    const footerPdf = await PDFDocument.load(footerBytes);
    
    // Embed footer page
    const [footerPage] = await pdfDoc.embedPdf(footerPdf, [0]);
    const { width: footerWidth, height: footerHeight } = footerPage.scale(1);

    let targetPage = currentPage;
    let footerY;

    // KONFIGURASI MARGIN FOOTER
    const FOOTER_CONFIG = {
      newPageTopMargin: 0,      // Jarak dari atas halaman BARU 
      samePageBottomMargin: 0,  // Jarak footer dari bawah halaman 
    };

    // LOGIKA: Jika produk >= 4, PASTI buat halaman baru untuk footer
    if (productCount >= 4) {
      // Buat halaman baru untuk footer
      targetPage = pdfDoc.addPage([595.28, 841.89]);
      
      // Posisi footer di atas halaman baru (tanpa jeda)
      footerY = 841.89 - FOOTER_CONFIG.newPageTopMargin;
      
    } else {
      // Footer MENEMPEL DI BAWAH HALAMAN (same page)
      // Posisi footer di bagian paling bawah tanpa celah kosong
      footerY = FOOTER_CONFIG.samePageBottomMargin + footerHeight;
    }

    // Stamp footer page
    const footerX = (595.28 - footerWidth) / 2;
    targetPage.drawPage(footerPage, {
      x: footerX,
      y: footerY - footerHeight,
      width: footerWidth,
      height: footerHeight,
    });

    // Tulis total di atas footer
    const totalX = 405;
    const totalY = footerY - 68;

    targetPage.drawText(`Rp${total.toLocaleString("id-ID")}`, {
      x: totalX,
      y: totalY,
      size: 14,
      font: fonts.poppinsBold,
      color: rgb(0.862, 0.149, 0.149),
    });

    return {
      finalPage: targetPage,
      finalY: footerY - footerHeight,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Copy header template ke halaman baru (untuk multiple pages)
 */
export const addPageWithHeader = async (
  pdfDoc: PDFDocument,
  headerPdfPath: string = "/HEADER.pdf"
) => {
  try {
    const headerBytes = await fetch(headerPdfPath).then((res) => {
      if (!res.ok) throw new Error(`Header PDF not found: ${headerPdfPath}`);
      return res.arrayBuffer();
    });
    
    const headerPdf = await PDFDocument.load(headerBytes);
    const [headerTemplate] = await pdfDoc.copyPages(headerPdf, [0]);
    
    return pdfDoc.addPage(headerTemplate);
  } catch (error) {
    throw error;
  }
};

/**
 * Cek apakah footer akan muat di halaman
 */
export const needsNewPageForFooter = (
  currentY: number,
  footerHeight: number = 280,
  marginTop: number = 70,
  minY: number = 5
): boolean => {
  return (currentY - marginTop - footerHeight) < minY;
};