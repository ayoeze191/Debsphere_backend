import { Prisma } from "../prisma/client.js";
import type { Request, Response } from "express";

export const GetAllCourse = async (req: Request, res: Response) => {
  const all_courses = await Prisma.course.findMany({
    where: { isPublished: true },
    include: {
      category: true,
    },
  });
  return res.status(201).json({ courses: all_courses });
};

export const GetCourse = async (req: Request, res: Response) => {
  const slug = Array.isArray(req.params.slug)
    ? req.params.slug[0]
    : req.params.slug;
  console.log(slug);
  if (!slug) {
    return res.status(400).json({ message: "Course id is required" });
  }

  const course = await Prisma.course.findFirst({
    where: {
      slug,
    },
    include: {
      sections: {
        include: {
          lessons: true,
        },
      },
      category: true,
      instructor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          avatar: true,
        },
      },
    },
  });

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  return res.status(200).json({ course });
};
