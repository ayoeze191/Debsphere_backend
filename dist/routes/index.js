import { Router } from "express";
import authRoutes from "./auth.js";
import courseRoute from "./course.js";
const router = Router();
router.use("/auth", authRoutes);
router.use("/courses", courseRoute);
export default router;
//# sourceMappingURL=index.js.map