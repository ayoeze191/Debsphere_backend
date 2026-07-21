import { Router } from "express";
import authRoutes from "./auth.js";
import courseRoute from "./course.js";
import paymentRoute from "./payments.js";
import learnRoute from "./learn.js";
const router = Router();

router.use("/auth", authRoutes);
router.use("/courses", courseRoute);
router.use("/payments", paymentRoute);
router.use("/learn", learnRoute);
export default router;
