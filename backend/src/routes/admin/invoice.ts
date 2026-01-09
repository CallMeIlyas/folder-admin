import { Router } from "express"
import { generateInvoiceAdmin } from "../../controllers/admin/invoice/invoiceAdminController"
import { getInvoiceProductOptions } from "../../controllers/admin/invoice/invoiceOptionController"

const router = Router()

router.post("/generate", generateInvoiceAdmin)
router.get("/product-options/:id", getInvoiceProductOptions)

export default router