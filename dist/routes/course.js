import { Router } from "express";
import { GetAllCourse, GetCourse } from "./../controllers/course.js";
const router = Router();
router.post("/", GetAllCourse);
router.post("/:id", GetAllCourse);
export default router;
//# sourceMappingURL=course.js.map