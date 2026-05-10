import express from 'express';
import { messbilling,updateBill,deleteDayBill,deleteMonthBill,togglePaymentStatus} from '../controllers/billing.controller.js';
const router = express.Router();

router.post("/admin/messbill/:rollno",messbilling);
router.put("/messbill/:billId/:dayId",updateBill);
router.delete("/messbill/day/:billId/:dayId",deleteDayBill);
router.delete("/messbill/month/:billId",deleteMonthBill);
router.put("/bill/status/:billId",togglePaymentStatus);
export default router;

