import { Request, Response } from "express"
import { generateInvoice } from "../../../../utils/generateInvoice"

export const generateInvoiceAdmin = async (req: Request, res: Response) => {
  try {
    const { cart, ...customerData } = req.body

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        message: "Cart data is required"
      })
    }

    const pdfBytes = await generateInvoice(cart, {
      companyName: customerData.companyName || "",
      contactPerson: customerData.contactPerson || "",
      orderVia: customerData.orderVia || "",
      paymentDate: customerData.paymentDate || "",
      estimatedArrival: customerData.estimatedArrival || "",
      paymentMethod: customerData.paymentMethod || ""
    })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Invoice_LittleAmora.pdf"
    )

    return res.status(200).send(Buffer.from(pdfBytes))
  } catch (error) {
    console.error("Generate invoice error:", error)
    return res.status(500).json({
      message: "Failed to generate invoice"
    })
  }
}