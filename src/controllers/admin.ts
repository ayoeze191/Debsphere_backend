import type { Request, Response } from "express";
import { createHash } from "node:crypto";
import {
  UserRole,
  PaymentStatus,
  VideoStatus,
} from "../generated/prisma/client.js";
import { AppError } from "../errors/app-error.js";
import { Prisma } from "../prisma/client.js";

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  profileImage: true,
  avatar: true,
  provider: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { enrollments: true, courses: true } },
} as const;

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(`${field} is required`, 400);
  }
  return value.trim();
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value.trim() || null : undefined;
}

function integer(value: unknown, field: string) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(number))
    throw new AppError(`${field} must be an integer`, 400);
  return number;
}

function optionalBoolean(value: unknown, field: string) {
  if (value === undefined) return undefined;
  if (typeof value !== "boolean")
    throw new AppError(`${field} must be a boolean`, 400);
  return value;
}

export const getDashboard = async (_req: Request, res: Response) => {
  const [
    users,
    courses,
    publishedCourses,
    enrollments,
    successfulPayments,
    revenue,
  ] = await Promise.all([
    Prisma.user.count(),
    Prisma.course.count(),
    Prisma.course.count({ where: { isPublished: true } }),
    Prisma.enrollment.count(),
    Prisma.payment.count({ where: { status: "SUCCESS" } }),
    Prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
  ]);

  return res.json({
    users,
    courses,
    publishedCourses,
    enrollments,
    successfulPayments,
    revenue: revenue._sum.amount ?? 0,
  });
};

export const listUsers = async (_req: Request, res: Response) =>
  res.json({
    users: await Prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: "desc" },
    }),
  });

export const updateUser = async (req: Request, res: Response) => {
  const { role, firstName, lastName, profileImage, avatar } = req.body;
  if (role !== undefined && !Object.values(UserRole).includes(role)) {
    throw new AppError("Invalid user role", 400);
  }
  const user = await Prisma.user.update({
    where: { id: requiredString(req.params.id, "User id") },
    data: {
      ...(role === undefined ? {} : { role }),
      ...(optionalString(firstName) === undefined
        ? {}
        : { firstName: optionalString(firstName)! }),
      ...(optionalString(lastName) === undefined
        ? {}
        : { lastName: optionalString(lastName)! }),
      ...(optionalString(profileImage) === undefined
        ? {}
        : { profileImage: optionalString(profileImage) }),
      ...(optionalString(avatar) === undefined
        ? {}
        : { avatar: optionalString(avatar) }),
    } as any,
    select: userSelect,
  });
  return res.json({ user });
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = requiredString(req.params.id, "User id");
  if (id === req.auth?.userId)
    throw new AppError("You cannot delete your own account", 400);
  await Prisma.user.delete({ where: { id } });
  return res.sendStatus(204);
};

export const listCategories = async (_req: Request, res: Response) =>
  res.json({
    categories: await Prisma.category.findMany({
      include: { _count: { select: { courses: true } } },
      orderBy: { name: "asc" },
    }),
  });

export const createCategory = async (req: Request, res: Response) =>
  res.status(201).json({
    category: await Prisma.category.create({
      data: { name: requiredString(req.body.name, "Name") },
    }),
  });

export const updateCategory = async (req: Request, res: Response) =>
  res.json({
    category: await Prisma.category.update({
      where: { id: requiredString(req.params.id, "Category id") },
      data: { name: requiredString(req.body.name, "Name") },
    }),
  });

export const deleteCategory = async (req: Request, res: Response) => {
  await Prisma.category.delete({
    where: { id: requiredString(req.params.id, "Category id") },
  });
  return res.sendStatus(204);
};

export const listCourses = async (_req: Request, res: Response) =>
  res.json({
    courses: await Prisma.course.findMany({
      include: {
        category: true,
        instructor: { select: userSelect },
        _count: {
          select: { sections: true, enrollments: true, payment: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  });

export const createCourse = async (req: Request, res: Response) => {
  const {
    title,
    slug,
    description,
    thumbnail,
    price,
    instructorId,
    categoryId,
    duration,
    isPublished,
  } = req.body;

  try {
    const course = await Prisma.course.create({
      data: {
        title: requiredString(title, "Title"),
        slug: requiredString(slug, "Slug"),
        description: requiredString(description, "Description"),
        thumbnail: requiredString(thumbnail, "Thumbnail"),
        price: requiredString(String(price ?? ""), "Price"),
        instructorId: requiredString(instructorId, "Instructor id"),
        ...(optionalString(categoryId) === undefined
          ? {}
          : { categoryId: optionalString(categoryId) }),
        ...(optionalString(duration) === undefined
          ? {}
          : { duration: optionalString(duration) }),
        ...(optionalBoolean(isPublished, "isPublished") === undefined
          ? {}
          : { isPublished }),
      } as any,
    });
    return res.status(201).json({ course });
  } catch (e) {
    if (e instanceof AppError) {
      return res.status(e.statusCode).json({ message: e.message });
    }
    console.error(e); // log the real error server-side for anything unexpected
    return res
      .status(500)
      .json({ message: "Something went wrong creating the course." });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const textFields = [
    "title",
    "slug",
    "description",
    "thumbnail",
    "duration",
    "categoryId",
    "instructorId",
  ] as const;
  const data: Record<string, unknown> = {};
  for (const field of textFields)
    if (body[field] !== undefined) data[field] = optionalString(body[field]);
  if (body.price !== undefined)
    data.price = requiredString(String(body.price), "Price");
  const published = optionalBoolean(body.isPublished, "isPublished");
  if (published !== undefined) data.isPublished = published;
  const course = await Prisma.course.update({
    where: { id: requiredString(req.params.id, "Course id") },
    data,
  });
  return res.json({ course });
};

export const deleteCourse = async (req: Request, res: Response) => {
  const courseId = requiredString(req.params.id, "Course id");
  const lessons = await Prisma.lesson.findMany({
    where: { section: { courseId } },
    select: { videoId: true },
  });

  await Prisma.$transaction([
    Prisma.enrollment.deleteMany({ where: { courseId } }),
    Prisma.certificate.deleteMany({ where: { courseId } }),
    Prisma.payment.deleteMany({ where: { courseId } }),
    Prisma.lesson.deleteMany({ where: { section: { courseId } } }),
    Prisma.section.deleteMany({ where: { courseId } }),
    Prisma.video.deleteMany({
      where: { id: { in: lessons.flatMap((lesson) => lesson.videoId ? [lesson.videoId] : []) } },
    }),
    Prisma.course.delete({ where: { id: courseId } }),
  ]);
  return res.sendStatus(204);
};

export const createSection = async (req: Request, res: Response) => {
  const section = await Prisma.section.create({
    data: {
      courseId: requiredString(req.params.courseId, "Course id"),
      title: requiredString(req.body.title, "Title"),
      position: integer(req.body.position, "Position"),
    },
  });
  return res.status(201).json({ section });
};

export const updateSection = async (req: Request, res: Response) =>
  res.json({
    section: await Prisma.section.update({
      where: { id: requiredString(req.params.id, "Section id") },
      data: {
        ...(req.body.title === undefined
          ? {}
          : { title: requiredString(req.body.title, "Title") }),
        ...(req.body.position === undefined
          ? {}
          : { position: integer(req.body.position, "Position") }),
      },
    }),
  });

export const deleteSection = async (req: Request, res: Response) => {
  const id = requiredString(req.params.id, "Section id");
  const lessons = await Prisma.lesson.findMany({ where: { sectionId: id }, select: { videoId: true } });
  await Prisma.$transaction([
    Prisma.lesson.deleteMany({ where: { sectionId: id } }),
    Prisma.section.delete({ where: { id } }),
    Prisma.video.deleteMany({ where: { id: { in: lessons.flatMap((lesson) => lesson.videoId ? [lesson.videoId] : []) } } }),
  ]);
  return res.sendStatus(204);
};

export const createLesson = async (req: Request, res: Response) => {
  const lesson = await Prisma.lesson.create({
    data: {
      sectionId: requiredString(req.params.sectionId, "Section id"),
      title: requiredString(req.body.title, "Title"),
      duration: integer(req.body.duration, "Duration"),
      position: integer(req.body.position, "Position"),
      ...(optionalString(req.body.description) === undefined
        ? {}
        : { description: optionalString(req.body.description) }),
    } as any,
  });
  return res.status(201).json({ lesson });
};

export const updateLesson = async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  if (body.title !== undefined)
    data.title = requiredString(body.title, "Title");
  if (body.description !== undefined)
    data.description = optionalString(body.description);
  if (body.duration !== undefined)
    data.duration = integer(body.duration, "Duration");
  if (body.position !== undefined)
    data.position = integer(body.position, "Position");
  return res.json({
    lesson: await Prisma.lesson.update({
      where: { id: requiredString(req.params.id, "Lesson id") },
      data,
    }),
  });
};

export const deleteLesson = async (req: Request, res: Response) => {
  const id = requiredString(req.params.id, "Lesson id");
  const lesson = await Prisma.lesson.findUnique({ where: { id }, select: { videoId: true } });
  await Prisma.$transaction([
    Prisma.lesson.delete({ where: { id } }),
    ...(lesson?.videoId ? [Prisma.video.delete({ where: { id: lesson.videoId } })] : []),
  ]);
  return res.sendStatus(204);
};

/**
 * Creates a short-lived Cloudinary upload signature. The browser receives no
 * secret and uploads files directly to Cloudinary, keeping the API server out
 * of the large-file upload path.
 */
export const createUploadSignature = async (req: Request, res: Response) => {
  const resourceType = req.body.resourceType;
  if (resourceType !== "image" && resourceType !== "video") {
    throw new AppError("resourceType must be image or video", 400);
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError("Cloudinary is not configured on the server", 503);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `debsphere/${resourceType}s`;
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  return res.json({ cloudName, apiKey, timestamp, folder, signature });
};

export const listEnrollments = async (_req: Request, res: Response) =>
  res.json({
    enrollments: await Prisma.enrollment.findMany({
      include: { user: { select: userSelect }, course: true, lastLesson: true },
      orderBy: { enrolledAt: "desc" },
    }),
  });
export const deleteEnrollment = async (req: Request, res: Response) => {
  await Prisma.enrollment.delete({
    where: { id: requiredString(req.params.id, "Enrollment id") },
  });
  return res.sendStatus(204);
};

export const listPayments = async (_req: Request, res: Response) =>
  res.json({
    payments: await Prisma.payment.findMany({
      include: { course: true },
      orderBy: { createdAt: "desc" },
    }),
  });
export const updatePayment = async (req: Request, res: Response) => {
  if (!Object.values(PaymentStatus).includes(req.body.status))
    throw new AppError("Invalid payment status", 400);
  return res.json({
    payment: await Prisma.payment.update({
      where: { id: requiredString(req.params.id, "Payment id") },
      data: { status: req.body.status },
    }),
  });
};

export const listReviews = async (_req: Request, res: Response) =>
  res.json({
    reviews: await Prisma.review.findMany({ orderBy: { id: "desc" } }),
  });
export const deleteReview = async (req: Request, res: Response) => {
  await Prisma.review.delete({
    where: { id: requiredString(req.params.id, "Review id") },
  });
  return res.sendStatus(204);
};
export const listCertificates = async (_req: Request, res: Response) =>
  res.json({
    certificates: await Prisma.certificate.findMany({
      include: { user: { select: userSelect }, course: true },
      orderBy: { issuedAt: "desc" },
    }),
  });
export const listWebhookEvents = async (_req: Request, res: Response) =>
  res.json({
    webhookEvents: await Prisma.webhookEvent.findMany({
      orderBy: { createdAt: "desc" },
    }),
  });

export const updateVideo = async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;
  if (
    body.status !== undefined &&
    !Object.values(VideoStatus).includes(body.status as VideoStatus)
  )
    throw new AppError("Invalid video status", 400);
  const video = await Prisma.video.update({
    where: { id: requiredString(req.params.id, "Video id") },
    data: {
      ...(body.originalUrl === undefined
        ? {}
        : { originalUrl: requiredString(body.originalUrl, "Original URL") }),
      ...(body.hlsUrl === undefined
        ? {}
        : { hlsUrl: optionalString(body.hlsUrl) }),
      ...(body.thumbnail === undefined
        ? {}
        : { thumbnail: optionalString(body.thumbnail) }),
      ...(body.duration === undefined
        ? {}
        : { duration: integer(body.duration, "Duration") }),
      ...(body.status === undefined
        ? {}
        : { status: body.status as VideoStatus }),
    } as any,
  });
  return res.json({ video });
};

// export const createVideo = async (req: Request, res: Response) => {
//   const video = await Prisma.video.create({
//     data: {
//       lessonId: requiredString(req.params.lessonId, "Lesson id"),
//       originalUrl: requiredString(req.body.originalUrl, "Original URL"),
//       ...(optionalString(req.body.hlsUrl) === undefined
//         ? {}
//         : { hlsUrl: optionalString(req.body.hlsUrl) }),
//       ...(optionalString(req.body.thumbnail) === undefined
//         ? {}
//         : { thumbnail: optionalString(req.body.thumbnail) }),
//       duration: integer(req.body.duration, "Duration"),
//       status: (req.body.status as VideoStatus) ?? "PENDING",
//     } as any,
//   });
//   return res.status(201).json({ video });
// };

export const createVideo = async (req: Request, res: Response) => {
  const lessonId = requiredString(req.params.lessonId, "Lesson id");
  const originalUrl = requiredString(req.body.originalUrl, "Original URL");

  const lesson = await Prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw new AppError("Lesson not found", 404);
  if (lesson.videoId)
    throw new AppError(
      "This lesson already has a video attached — use updateVideo to change it",
      409,
    );

  const video = await Prisma.video.create({
    data: {
      originalUrl,
      ...(optionalString(req.body.thumbnail) === undefined
        ? {}
        : { thumbnail: optionalString(req.body.thumbnail) }),
      duration: 20,
      // Bootstrap path: no transcoding pipeline yet, so mark it playable
      // immediately using the raw file. Switch this to "UPLOADING" once
      // you wire up real transcoding (Mux, your own ffmpeg worker, etc.)
      // and let that pipeline flip it to READY via updateVideo.
      status: "READY",
    } as any,
  });

  await Prisma.lesson.update({
    where: { id: lessonId },
    data: { videoId: video.id },
  });

  return res.status(201).json({ video });
};

export const getCourse = async (req: Request, res: Response) => {
  const course = await Prisma.course.findUnique({
    where: { id: requiredString(req.params.id, "Course id") },
    include: {
      category: true,
      instructor: { select: userSelect },
      sections: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            include: { video: true },
          },
        },
      },
    },
  });

  if (!course) throw new AppError("Course not found", 404);
  return res.json({ course });
};
