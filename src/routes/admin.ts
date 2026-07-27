import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { isAdmin } from "../middleware/admin.js";
import * as admin from "../controllers/admin.js";

const router = Router();

router.use(isAuthenticated, isAdmin);

router.get("/dashboard", admin.getDashboard);

router.get("/users", admin.listUsers);
router.patch("/users/:id", admin.updateUser);
router.delete("/users/:id", admin.deleteUser);

router.get("/categories", admin.listCategories);
router.post("/categories", admin.createCategory);
router.patch("/categories/:id", admin.updateCategory);
router.delete("/categories/:id", admin.deleteCategory);

router.get("/courses", admin.listCourses);
router.post("/uploads/signature", admin.createUploadSignature);
router.post("/courses", admin.createCourse);
router.patch("/courses/:id", admin.updateCourse);
router.delete("/courses/:id", admin.deleteCourse);

router.post("/courses/:courseId/sections", admin.createSection);
router.patch("/sections/:id", admin.updateSection);
router.delete("/sections/:id", admin.deleteSection);
router.post("/sections/:sectionId/lessons", admin.createLesson);
router.patch("/lessons/:id", admin.updateLesson);
router.delete("/lessons/:id", admin.deleteLesson);
router.patch("/videos/:id", admin.updateVideo);
router.post(`/lessons/:lessonId/videos`, admin.createVideo);
router.get("/courses/:id", admin.getCourse);

router.get("/enrollments", admin.listEnrollments);
router.delete("/enrollments/:id", admin.deleteEnrollment);
router.get("/payments", admin.listPayments);
router.patch("/payments/:id", admin.updatePayment);
router.get("/reviews", admin.listReviews);
router.delete("/reviews/:id", admin.deleteReview);
router.get("/certificates", admin.listCertificates);
router.get("/webhook-events", admin.listWebhookEvents);
// router.post()

export default router;
