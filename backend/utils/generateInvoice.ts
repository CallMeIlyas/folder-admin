import {
  PDFDocument,
  rgb,
  pushGraphicsState,
  popGraphicsState,
  scale
} from "pdf-lib"
import fontkit from "@pdf-lib/fontkit"
import fs from "fs"
import path from "path"
import { mergeFooterPdf } from "./mergeHeaderFooter"

export const generateInvoice = async (
  cartData,
  customerData
): Promise<Uint8Array> => {
  // ===== HEADER =====
  const headerBytes = fs.readFileSync(
    path.join(process.cwd(), "public/HEADER.pdf")
  )
  const pdfDoc = await PDFDocument.load(headerBytes)

  pdfDoc.registerFontkit(fontkit)

  // ===== FONTS =====
  const poppinsRegular = await pdfDoc.embedFont(
    fs.readFileSync(
      path.join(process.cwd(), "public/fonts/poppins/Poppins-Regular.ttf")
    )
  )
  const poppinsSemiBold = await pdfDoc.embedFont(
    fs.readFileSync(
      path.join(process.cwd(), "public/fonts/poppins/Poppins-SemiBold.ttf")
    )
  )
  const poppinsBold = await pdfDoc.embedFont(
    fs.readFileSync(
      path.join(process.cwd(), "public/fonts/poppins/Poppins-Bold.ttf")
    )
  )
  const poppinsItalic = await pdfDoc.embedFont(
    fs.readFileSync(
      path.join(process.cwd(), "public/fonts/poppins/Poppins-Italic.ttf")
    )
  )

  let page = pdfDoc.getPage(0)

  // ===== TEXT HELPER =====
  const drawText = (
    text,
    x,
    y,
    { size = 10, font = poppinsRegular, color = rgb(0, 0, 0) } = {}
  ) => {
    page.drawText(String(text), { x, y, size, font, color })
  }

  // ===== BILL TO =====
  const billToX = 240
  let billToY = 735
  const lineGap = 16

  const safeText = val => (val && val.trim() !== "" ? val : "-")

  drawText(safeText(customerData.companyName), billToX, billToY)
  billToY -= lineGap
  drawText(safeText(customerData.contactPerson), billToX, billToY)
  billToY -= lineGap
  drawText(safeText(customerData.orderVia), billToX, billToY)
  billToY -= lineGap
  drawText(safeText(customerData.paymentDate), billToX, billToY)
  billToY -= lineGap
  drawText(safeText(customerData.estimatedArrival), billToX, billToY)
  billToY -= lineGap
  drawText(safeText(customerData.paymentMethod), billToX, billToY)

  // ===== INVOICE NUMBER =====
  const invoiceInfoX = 45
  const invoiceInfoY = 790

  const formatCustomerName = name => {
    if (!name || name === "-") return "CUST"
    return name.replace(/\s+/g, "").toUpperCase().substring(0, 5)
  }

  const formatToDDMMYYYY = dateString => {
    if (!dateString || dateString === "-") return ""
    const d = new Date(dateString)
    return `${String(d.getDate()).padStart(2, "0")}${String(
      d.getMonth() + 1
    ).padStart(2, "0")}${d.getFullYear()}`
  }

  const finalInvoiceText = `INV/LAC/${formatCustomerName(
    customerData.contactPerson
  )}${formatToDDMMYYYY(customerData.paymentDate) || "00000000"}`

  drawText(finalInvoiceText, invoiceInfoX, invoiceInfoY, {
    font: poppinsSemiBold,
    size: 9,
    color: rgb(0.862, 0.149, 0.149)
  })

  // ===== PRODUCT TABLE =====
  const box = { left: 45, right: 545, top: 630, bottom: 50, rowH: 50 }
  const cols = { image: 60, name: 210, price: 90, qty: 60, total: 90 }

  let y = box.top
  let lastProductY = y
  let isFirstPage = true

  for (const item of cartData) {
    const currentBottom = isFirstPage ? 170 : 30

    if (y - box.rowH < currentBottom) {
      page = pdfDoc.addPage([595.28, 841.89])
      y = 841
      isFirstPage = false
    }

    // IMAGE
    const imageFsPath = resolveImagePath(item.imageUrl)

if (imageFsPath && fs.existsSync(imageFsPath)) {
  const imgBytes = fs.readFileSync(imageFsPath)

  const img = imageFsPath.endsWith(".png")
    ? await pdfDoc.embedPng(imgBytes)
    : await pdfDoc.embedJpg(imgBytes)

  const size = 35
  const { width, height } = img.scale(1)
  const aspect = width / height

  const drawW = aspect >= 1 ? size : size * aspect
  const drawH = aspect >= 1 ? size / aspect : size

  page.drawImage(img, {
    x: box.left + (cols.image - drawW) / 2,
    y: y - drawH - 53,
    width: drawW,
    height: drawH
  })
}

    const subtotal = item.price * item.quantity
    const textY = y - 70
    const nameX = box.left + cols.image + 8

    const truncate = (t, m = 25) =>
      t && t.length > m ? t.slice(0, m - 3) + "..." : t || "-"

    drawText(truncate(item.name), nameX, textY, { size: 8 })

    if (item.variation) {
      const symbolFont = await pdfDoc.embedFont(
        fs.readFileSync(
          path.join(process.cwd(), "public/fonts/NotoSansSymbols2-Regular.ttf")
        )
      )

      drawText("Variations:", nameX + 110, textY, { size: 8 })

      page.pushOperators(pushGraphicsState())
      page.pushOperators(scale(1.5, 1))

      drawText("▼", (nameX + 110 + 42) / 1.5, textY, {
        font: symbolFont,
        size: 6
      })

      page.pushOperators(popGraphicsState())

      drawText(item.variation, nameX + 110, textY - 12, { size: 8 })
    }

    drawText(
      `Rp${item.price.toLocaleString("id-ID")}`,
      box.left + cols.image + cols.name - 13,
      textY,
      { font: poppinsSemiBold, size: 11 }
    )

    drawText(
      String(item.quantity),
      box.left + cols.image + cols.name + cols.price + 40,
      textY,
      { size: 11 }
    )

    drawText(
      `Rp${subtotal.toLocaleString("id-ID")}`,
      box.right - cols.total + 50,
      textY,
      {
        font: poppinsSemiBold,
        size: 12,
        color: rgb(0.862, 0.149, 0.149)
      }
    )

    y -= box.rowH
    lastProductY = y
  }

  // ===== FOOTER =====
  const total = cartData.reduce(
    (a, b) => a + b.price * b.quantity,
    0
  )

  await mergeFooterPdf(
    pdfDoc,
    page,
    lastProductY,
    path.join(process.cwd(), "public/FOOTER.pdf"),
    total,
    { poppinsRegular, poppinsSemiBold, poppinsBold },
    cartData.length
  )

  return await pdfDoc.save()
}