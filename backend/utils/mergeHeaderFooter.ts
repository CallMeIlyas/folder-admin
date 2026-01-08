import { PDFDocument, rgb } from "pdf-lib"
import fs from "fs"
import path from "path"

export const mergeFooterPdf = async (
  pdfDoc: PDFDocument,
  currentPage: any,
  lastProductY: number,
  footerPdfPath: string,
  total: number,
  fonts: any,
  productCount: number = 0
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

  if (productCount >= 4) {
    targetPage = pdfDoc.addPage([595.28, 841.89])
    footerY = 841.89
  } else {
    footerY = height
  }

  const footerX = (595.28 - width) / 2

  targetPage.drawPage(footerPage, {
    x: footerX,
    y: footerY - height,
    width,
    height
  })

  targetPage.drawText(`Rp${total.toLocaleString("id-ID")}`, {
    x: 405,
    y: footerY - 68,
    size: 14,
    font: fonts.poppinsBold,
    color: rgb(0.862, 0.149, 0.149)
  })

  return {
    finalPage: targetPage,
    finalY: footerY - height
  }
}