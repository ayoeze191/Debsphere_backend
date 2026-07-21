import { Prisma } from "../prisma/client.js";
import { response } from "express";
export const getAllenrolledCourses = async (req, res) => {
    const enrolledCourses = await Prisma.enrollment.findMany({
        where: {
            userId: req.auth.userId,
        },
        include: {
            course: {
                include: {
                    sections: {
                        include: {
                            lessons: true,
                        },
                    },
                },
            },
        },
    });
    return res.status(200).json({ message: "successfull ", enrolledCourses });
};
export const getCourseForLearning = async (req, res) => {
    const user = req.auth;
    const { slug } = req.params;
    const enrollment = await Prisma.enrollment.findFirst({
        where: {
            userId: user.id,
            course: {
                slug,
            },
        },
        include: {
            course: {
                include: {
                    category: true,
                    sections: {
                        orderBy: {
                            position: "asc",
                        },
                        include: {
                            lessons: {
                                orderBy: {
                                    position: "asc",
                                },
                                include: {
                                    progress: {
                                        where: {
                                            userId: user.id,
                                        },
                                        select: {
                                            watched: true,
                                            completedAt: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    if (!enrollment) {
        return res.status(404).json({
            message: "User can't access this resource",
        });
    }
    return res.status(200).json({
        message: "Successful",
        course: enrollment.course,
        enrollment: {
            completedLessons: enrollment.completedLessons,
            totalLessons: enrollment.totalLessons,
            lastLesson: enrollment.lastLessonId,
        },
    });
};
export const markAsCompleted = async (req, res) => {
    const { lessonId, nowComplete } = req.body;
    const userId = req.auth?.userId;
    if (!lessonId || !userId) {
        return res.status(400).json({
            message: "Lesson id is required",
        });
    }
    const lesson = await Prisma.lesson.findUnique({
        where: {
            id: lessonId,
        },
        include: {
            section: {
                include: {
                    course: true,
                },
            },
        },
    });
    if (!lesson) {
        return res.status(404).json({
            message: "Lesson not found",
        });
    }
    const progress = await Prisma.lessonProgress.findFirst({
        where: {
            lessonId,
            userId,
        },
    });
    if (!progress) {
        await Prisma.lessonProgress.create({
            data: {
                lessonId,
                userId,
                watched: nowComplete,
                completedAt: nowComplete ? new Date() : null,
            },
        });
    }
    else {
        await Prisma.lessonProgress.update({
            where: {
                id: progress.id,
            },
            data: {
                watched: nowComplete,
                completedAt: nowComplete ? new Date() : null,
            },
        });
    }
    return res.status(200).json({
        message: "Successfully updated",
    });
};
//# sourceMappingURL=learn.js.map