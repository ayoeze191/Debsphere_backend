import { Router } from "express";
import {
  getAllenrolledCourses,
  getCourseForLearning,
  markAsCompleted,
} from "../controllers/learn.js";
import { isAuthenticated } from "../middleware/auth.js";
const router = Router();

// router.get("/:id", isAuthenticated, getCourse);
router.get("/courses", isAuthenticated, getAllenrolledCourses);
router.get("/:slug", isAuthenticated, getCourseForLearning);
router.post("/:markascomplete", isAuthenticated, markAsCompleted);

// isAuthenticated

export default router;
