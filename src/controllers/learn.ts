import { Prisma } from "../prisma/client.js";
import type { Request, Response } from "express";

export const getAllenrolledCourses = async (req: Request, res: Response) => {
  const enrolledCourses = await Prisma.enrollment.findMany({
    where: {
      userId: req.auth!.userId,
    },
    include: {
      lastLesson: { select: { id: true, title: true } },
      course: {
        include: {
          category: true,
          sections: {
            orderBy: { position: "asc" },
            include: {
              lessons: { orderBy: { position: "asc" } },
            },
          },
        },
      },
    },
  });

  const lessonIds = enrolledCourses.flatMap((enrollment) =>
    enrollment.course.sections.flatMap((section) =>
      section.lessons.map((lesson) => lesson.id),
    ),
  );
  const completedProgress = await Prisma.lessonProgress.findMany({
    where: {
      userId: req.auth!.userId,
      lessonId: { in: lessonIds },
      completedAt: { not: null },
    },
    select: { lessonId: true },
  });
  const completedLessonIds = new Set(
    completedProgress.map((progress) => progress.lessonId),
  );

  const enrollments = enrolledCourses.map((enrollment) => {
    const lessons = enrollment.course.sections.flatMap((section) => section.lessons);
    const totalLessons = lessons.length;
    const completedLessons = lessons.filter((lesson) =>
      completedLessonIds.has(lesson.id),
    ).length;
    const progress = totalLessons
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    return {
      ...enrollment,
      completedLessons,
      totalLessons,
      progress,
    };
  });

  return res.status(200).json({ message: "successful", enrolledCourses: enrollments });
};

export const getCourseForLearning = async (
  req: Request<{ slug: string }>,
  res: Response,
) => {
  const user = req.auth;
  const { slug } = req.params;

  const enrollment = await Prisma.enrollment.findFirst({
    where: {
      userId: user!.id,
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
                      userId: user!.id,
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

export const markAsCompleted = async (req: Request, res: Response) => {
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

  const enrollment = await Prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: lesson.section.courseId } },
  });
  if (!enrollment) {
    return res.status(403).json({ message: "You are not enrolled in this course" });
  }

  const summary = await Prisma.$transaction(async (tx) => {
    await tx.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        lessonId,
        userId,
        watched: nowComplete,
        completedAt: nowComplete ? new Date() : null,
      },
      update: {
        watched: nowComplete,
        completedAt: nowComplete ? new Date() : null,
      },
    });

    const lessons = await tx.lesson.findMany({
      where: { section: { courseId: lesson.section.courseId } },
      orderBy: [{ section: { position: "asc" } }, { position: "asc" }],
      select: { id: true },
    });
    const completedLessons = await tx.lessonProgress.count({
      where: {
        userId,
        completedAt: { not: null },
        lesson: { section: { courseId: lesson.section.courseId } },
      },
    });
    const nextLesson = await tx.lesson.findFirst({
      where: {
        section: { courseId: lesson.section.courseId },
        progress: { none: { userId, completedAt: { not: null } } },
      },
      orderBy: [{ section: { position: "asc" } }, { position: "asc" }],
      select: { id: true },
    });
    const totalLessons = lessons.length;
    const updatedEnrollment = await tx.enrollment.update({
      where: { id: enrollment.id },
      data: {
        completedLessons,
        totalLessons,
        lastLessonId: nextLesson?.id ?? lessonId,
      },
    });

    return { ...updatedEnrollment, progress: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0 };
  });

  return res.status(200).json({
    message: "Successfully updated",
    enrollment: summary,
  });
};
