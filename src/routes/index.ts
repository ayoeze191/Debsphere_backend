import { Router } from "express";
import authRoutes from "./auth.js";
import courseRoute from "./course.js";
import paymentRoute from "./payments.js";
import learnRoute from "./learn.js";
import adminRoute from "./admin.js";
const router = Router();

router.use("/auth", authRoutes);
router.use("/courses", courseRoute);
router.use("/payments", paymentRoute);
router.use("/learn", learnRoute);
router.use("/admin", adminRoute);
export default router;
