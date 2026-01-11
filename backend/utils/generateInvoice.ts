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

  // ===== RESOLVE IMAGE PATH =====
  const resolveImagePath = (imageUrl: string): string | null => {
    if (!imageUrl) return null
    
    // Handle URL dari frontend
    let cleanPath = imageUrl
    
    if (imageUrl.startsWith('http://localhost:3001')) {
      const url = new URL(imageUrl)
      cleanPath = url.pathname
    }
    
    // Remove /api prefix if exists
    cleanPath = cleanPath.replace(/^\/api/, '')
    
    // Remove leading slash
    cleanPath = cleanPath.startsWith("/") ? cleanPath.substring(1) : cleanPath
    
    // Join directly with project root (images are in uploads/ at root level)
    const fullPath = path.join(process.cwd(), cleanPath)
    
    return fullPath
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
  const box = { left: 25, right: 545, top: 630, bottom: 50, rowH: 50 }
  const cols = { image: 60, name: 210, price: 90, qty: 60, total: 90 }

  let y = box.top
  let lastProductY = y
  let isFirstPage = true

  // Hitung shipping total
  const shippingTotal = customerData.shipping 
    ? customerData.shipping.reduce((sum, item) => sum + (item.shippingCost || 0), 0)
    : 0

  // Gabungkan produk + shipping sebagai satu array untuk ditampilkan
  const allItems = [...cartData]
  
  // Tambahkan shipping sebagai item terakhir jika ada
  if (shippingTotal > 0) {
    allItems.push({
      name: "Ongkos Kirim",
      price: shippingTotal,
      quantity: 1,
      imageUrl: null, // Tidak ada gambar untuk shipping
      isShipping: true // Flag untuk item shipping
    })
  }

  for (const item of allItems) {
    const currentBottom = isFirstPage ? 170 : 30

    if (y - box.rowH < currentBottom) {
      page = pdfDoc.addPage([595.28, 841.89])
      y = 841
      isFirstPage = false
    }

    // IMAGE - hanya untuk produk, bukan untuk shipping
    if (!item.isShipping && item.imageUrl) {
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
    }

    const subtotal = item.price * item.quantity
    const textY = y - 70
    const nameX = box.left + cols.image + 8

    const truncate = (t, m = 25) =>
      t && t.length > m ? t.slice(0, m - 3) + "..." : t || "-"

    // Nama produk/shipping - SAMA PERSIS dengan produk lain
    if (item.isShipping) {
      drawText("Ongkos Kirim", nameX, textY, { size: 8 }) // Size 8 sama seperti produk
    } else {
      drawText(truncate(item.name), nameX, textY, { size: 8 })

      // Display options atau variation
      const displayOptions = item.optionLabels 
        ? Object.values(item.optionLabels).join(", ")
        : item.variation

      if (displayOptions) {
        const symbolFont = await pdfDoc.embedFont(
          fs.readFileSync(
            path.join(process.cwd(), "public/fonts/NotoSansSymbols2-Regular.ttf")
          )
        )

        const labelText = item.optionLabels ? "Options:" : "Variations:"
        drawText(labelText, nameX + 110, textY, { size: 8 })

        page.pushOperators(pushGraphicsState())
        page.pushOperators(scale(1.5, 1))

        drawText("▼", (nameX + 110 + 42) / 1.5, textY, {
          font: symbolFont,
          size: 6
        })

        page.pushOperators(popGraphicsState())

        drawText(truncate(displayOptions, 20), nameX + 110, textY - 12, { size: 8 })
      }
    }

    // Harga per item - SAMA PERSIS dengan produk lain
    drawText(
      `Rp${item.price.toLocaleString("id-ID")}`,
      box.left + cols.image + cols.name - 13,
      textY,
      { 
        font: poppinsSemiBold, // Font SAMA dengan produk
        size: 11 // Size SAMA dengan produk
      }
    )

    // Quantity - untuk shipping selalu 1
    drawText(
      item.isShipping ? "1" : String(item.quantity),
      box.left + cols.image + cols.name + cols.price + 40,
      textY,
      { 
        size: 11, // Size SAMA dengan produk
        font: poppinsRegular // Font SAMA dengan produk
      }
    )

    // Subtotal - warna merah untuk semua, SAMA PERSIS dengan produk lain
    drawText(
      `Rp${subtotal.toLocaleString("id-ID")}`,
      box.right - cols.total + 30,
      textY,
      {
        font: poppinsSemiBold, // Font SAMA dengan produk
        size: 12, // Size SAMA dengan produk
        color: rgb(0.862, 0.149, 0.149) // Warna SAMA dengan produk
      }
    )

    y -= box.rowH
    lastProductY = y
  }

  // ===== FOOTER =====
  // Hitung total semua item (produk + shipping)
  const productTotal = cartData.reduce(
    (a, b) => a + b.price * b.quantity,
    0
  )
  
  const grandTotal = productTotal + shippingTotal

  // Kirim ke mergeFooterPdf tanpa breakdown (hanya grand total)
  await mergeFooterPdf(
    pdfDoc,
    page,
    lastProductY,
    path.join(process.cwd(), "public/FOOTER.pdf"),
    grandTotal,
    { poppinsRegular, poppinsSemiBold, poppinsBold },
    allItems.length, // Gunakan jumlah semua item (termasuk shipping)
    { productTotal, shippingTotal } // Masih dikirim untuk logging
  )

  return await pdfDoc.save()
}