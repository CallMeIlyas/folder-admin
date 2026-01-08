import { Router } from "express"
import { generateInvoiceAdmin } from "../../controllers/admin/invoice/invoiceAdminController"

const router = Router()

router.post("/generate", generateInvoiceAdmin)

export default router