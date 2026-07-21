import { Router } from "express";
import { GetAllCourse, GetCourse } from "./../controllers/course.js";
const router = Router();

router.get("/", GetAllCourse);
router.get("/:slug", GetCourse);

export default router;
