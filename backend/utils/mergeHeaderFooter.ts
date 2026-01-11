import { PDFDocument, rgb } from "pdf-lib"
import fs from "fs"
import path from "path"

export const mergeFooterPdf = async (
  pdfDoc: PDFDocument,
  currentPage: any,
  lastProductY: number,
  footerPdfPath: string,
  grandTotal: number,
  fonts: any,
  productCount: number = 0,
  breakdown?: { productTotal: number; shippingTotal: number }
) => {
  const footerBytes = fs.readFileSync(
    path.isAbsolute(footerPdfPath)
      ? footerPdfPath
      : path.join(process.cwd(), footerPdfPath)
  )

  const footerPdf = await PDFDocument.load(footerBytes)
  const [footerPage] = await pdfDoc.embedPdf(footerPdf, [0])
  const { width, height } = footerPage.scale(1)

  let targetPage = currentPage
  let footerY

  // If 4 or more products, footer goes to new page
  if (productCount >= 4) {
    targetPage = pdfDoc.addPage([595.28, 841.89])
    footerY = 841.89
  } else {
    footerY = height
  }

  const footerX = (595.28 - width) / 2

  // Draw footer page
  targetPage.drawPage(footerPage, {
    x: footerX,
    y: footerY - height,
    width,
    height
  })

  console.log('=== FOOTER BREAKDOWN ===')
  console.log('Product Total:', breakdown?.productTotal)
  console.log('Shipping Total:', breakdown?.shippingTotal)
  console.log('Grand Total:', grandTotal)

  // HANYA TAMPILKAN GRAND TOTAL (MERAH)
  // Subtotal produk dan ongkos kirim dihapus
  targetPage.drawText(`Rp${grandTotal.toLocaleString("id-ID")}`, {
    x: 405,
    y: footerY - 74, // Posisi Y tetap sama
    size: 14,
    font: fonts.poppinsBold,
    color: rgb(0.862, 0.149, 0.149) // Warna merah
  })

  return {
    finalPage: targetPage,
    finalY: footerY - height
  }
}