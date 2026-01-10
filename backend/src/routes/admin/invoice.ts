import { Router } from "express"
import { generateInvoiceAdmin } from "../../controllers/admin/invoice/invoiceAdminController"
import { 
  getInvoiceProductOptions,
  calculateProductPriceWithOptions
} from "../../controllers/admin/invoice/invoiceOptionController"

const router = Router()

router.post("/generate", generateInvoiceAdmin)
router.get("/product-options/:id", getInvoiceProductOptions)
router.post("/product-options/:id/calculate-price", calculateProductPriceWithOptions)

export default router