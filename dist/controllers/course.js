import { Prisma } from "../prisma/client.js";
export const GetAllCourse = async (req, res) => {
    const all_courses = await Prisma.course.findMany({
        where: { isPublished: true },
        include: {
            category: true,
        },
    });
    return res.status(201).json({ courses: all_courses });
};
export const GetCourse = async (req, res) => {
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
            instructor: true,
        },
    });
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    return res.status(200).json({ course });
};
//# sourceMappingURL=course.js.map