import { Router } from "express";
import { verifyPaystackWebhook } from "../middleware/payments.js";
import PaymentController from "../controllers/payments.js";
import { isAuthenticated } from "../middleware/auth.js";
const router = Router();
router.post("/webhook", verifyPaystackWebhook, PaymentController.paystackWebhook);
router.post("/initialize", isAuthenticated, PaymentController.initialize);
router.get("/status/:reference", isAuthenticated, PaymentController.getStatus);
router.post("/verify", isAuthenticated, PaymentController.verifyPayment);
export default router;
//# sourceMappingURL=payments.js.map